var express = require("express");
var request = require("sync-request");
var url = require("url");
var qs = require("qs");
var querystring = require("querystring");
var cons = require("consolidate");
var randomstring = require("randomstring");
var __ = require("underscore");
__.string = require("underscore.string");

var app = express();

app.engine("html", cons.underscore);
app.set("view engine", "html");
app.set("views", "files/client");

// authorization server information
var authServer = {
  authorizationEndpoint: "http://localhost:9001/authorize",
  tokenEndpoint: "http://localhost:9001/token",
};

var protectedResource = "http://localhost:9002/resource";

// client information

/*
 * Add the client information in here
 */
var client = {
  client_id: "oauth-client-1",
  client_secret: "oauth-client-secret-1",
  redirect_uris: ["http://localhost:9000/callback"],
};

var state = null;

var access_token = null;
var scope = null;

app.get("/", function (req, res) {
  res.render("index", { access_token, scope });
});

app.get("/authorize", function (req, res) {
  /*
   * Send the user to the authorization server
   */

  access_token = null;

  state = randomstring.generate();

  var authorizeUrl = buildUrl(authServer.authorizationEndpoint, {
    response_type: "code",
    client_id: client.client_id,
    redirect_uri: client.redirect_uris[0],
    state,
  });

  console.log("redirect", authorizeUrl);
  res.redirect(authorizeUrl);
});

app.get("/callback", function (req, res) {
  if (req.query.error) {
    // it's an error response, act accordingly
    res.render("error", { error: req.query.error });
    return;
  }

  if (req.query.state != state) {
    console.log(
      "State DOES NOT MATCH: expected %s got %s",
      state,
      req.query.state
    );
    res.render("error", { error: "State value did not match" });
    return;
  }

  var code = req.query.code;

  var form_data = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: client.redirect_uris[0],
  }).toString();
  var headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization:
      "Basic " +
      encodeClientCredentials(client.client_id, client.client_secret),
  };

  var tokRes = (async function () {
    const response = await fetch(authServer.tokenEndpoint, {
      method: "POST",
      headers,
      body: form_data,
    });

    // Convert fetch Response to match sync-request format
    return {
      statusCode: response.status,
      getBody: async () => {
        // const body = await response.json();
        // return JSON.stringify(body);
        return JSON.stringify(await response.json());
      },
    };
  })();

  console.log("Requesting access token for code %s", code);

  // Handle the Promise
  async function fetchResource() {
    const response = await tokRes;
    if (response.statusCode >= 200 && response.statusCode < 300) {
      const body = JSON.parse(await response.getBody());
      access_token = body.access_token;
      console.log("Got access token: %s", access_token);
      res.render("index", { access_token: access_token, scope: scope });
    } else {
      res.render("error", {
        error:
          "Unable to fetch access token, server response: " +
          response.statusCode,
      });
    }
  }
  fetchResource();
});
//   tokRes
//     .then(async function (response) {
//       if (response.statusCode >= 200 && response.statusCode < 300) {
//         const body = JSON.parse(await response.getBody());
//         access_token = body.access_token;
//         console.log("Got access token: %s", access_token);
//         res.render("index", { access_token: access_token, scope: scope });
//       } else {
//         res.render("error", {
//           error:
//             "Unable to fetch access token, server response: " +
//             response.statusCode,
//         });
//       }
//     })
//     .catch(function (error) {
//       res.render("error", {
//         error: "Error fetching access token: " + error.message,
//       });
//     });
// });

app.get("/fetch_resource", function (req, res) {
  /*
   * Use the access token to call the resource server
   */
  if (!access_token) {
    res.render("error", { error: "Missing Access Token" });
    return;
  }
  console.log("Making request with access token %s", access_token);

  var headers = {
    authorization: `bearer ${access_token}`,
  };

  var tokRes = (async function () {
    const response = await fetch(protectedResource, {
      method: "post",
      headers,
    });
    return {
      statusCode: response.status,
      getBody: async () => {
        return JSON.stringify(await response.json());
      },
    };
  })();

  async function fetchResource() {
    const response = await tokRes;
    if (response.statusCode >= 200 && response.statusCode < 300) {
      const body = JSON.parse(await response.getBody());
      console.log("Got data: %s!!!!!!!!", body);
      res.render("data", { resource: body });
    } else {
      res.render("error", {
        error:
          "Unable to fetch resource, server response: " + response.statusCode,
      });
    }
  }
  fetchResource();
});

var buildUrl = function (base, options, hash) {
  var newUrl = url.parse(base, true);
  delete newUrl.search;
  if (!newUrl.query) {
    newUrl.query = {};
  }
  Object.keys(options).forEach(function (key) {
    newUrl.query[key] = options[key];
  });
  if (hash) {
    newUrl.hash = hash;
  }

  return url.format(newUrl);
};

var encodeClientCredentials = function (clientId, clientSecret) {
  return Buffer.from(
    querystring.escape(clientId) + ":" + querystring.escape(clientSecret)
  ).toString("base64");
};

app.use("/", express.static("files/client"));

var server = app.listen(9000, "localhost", function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("OAuth Client is listening at http://%s:%s", host, port);
});
