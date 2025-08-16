# Resource Server

This is our Resource Server or API. This app is a TypeScript application running on [Bun](https://bun.sh) that will connect with our Authorization Server to authenticate requests and provide data to our clients.

The API only holds two resources, the users and the contacts. The users are the ones that can authenticate and the contacts are the ones that can be created by the users.

## Setup

Install the dependencies:

```sh
bun install
```

Create a `.env` like this:

```txt
PORT=4000
ISSUER="idp.addressbook.com"
AUDIENCE="api.addressbook.com"
ISSUER_HOST="http://localhost:4001"
```

Start the server:

```sh
bun start
```

Go to `http://localhost:4000/healthcheck` to check that the server is running and run the database migrations and seed.
