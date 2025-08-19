# React Router OAuth2 Handbook Example Application (Address Book)

Welcome to Address Book, the example application from the book [React Router OAuth2 Handbook](https://books.sergiodxa.com).

This repository contains four distinct applications:

- `api`: The Resource Server, built with Bun.
- `idp`: The Authorization Server, also built with Bun.
- `web`: The Client Application, built with React Router.
- `e2e`: The End-to-End tests, built with Playwright.

The project utilizes a separate Authorization Server to authenticate users in the Client Application and authorize requests in the Resource Server. While this example uses custom built Authorization Server, you can use any other that supports OAuth 2.0 and OpenID Connect, as the code in the Resource Server and Client Application has no dependency are generic.

The Client Application is an extended version of the Address Book tutorial from the official React Router documentation. It includes authentication and uses a separate API (the Resource Server) to store user and contact information.

## Setup

> [!TIP]
> If you already installed the dependencies and created the `.env` files, use `make start` to start all services.

### Resource Server

Navigate to the `api` directory and install the dependencies:

```sh
cd api
bun install
```

Create a `.env` file with the following content:

```txt
PORT=4000
ISSUER="idp.addressbook.com"
AUDIENCE="api.addressbook.com"
ISSUER_HOST="http://localhost:4001"
```

Set up the database:

```sh
bun run db:setup
```

This command will execute `bun run db:migrate` and `bun run db:seed`. To reset the data, run `bun run db:reset` to clear the SQLite database and then `bun run db:setup` to recreate it.

> [!TIP]
> You can skip this setup if you navigate to `/healthcheck` endpoint in the browser which will create an in-memory database, migrate and seed it automatically.

Start the server:

```sh
bun start
```

### Client Application

Navigate to the `web` directory and install the dependencies:

```sh
cd web
bun install
```

Create a `.env` file with the following content:

```txt
ISSUER="idp.addressbook.com"
CLIENT_ID="56f0fee7-a73e-41f5-9a75-310e5bb340ee"
CLIENT_SECRET="d4023cc0-4d9f-4df2-9ed7-e4762438f9a9"
SESSION_SECRET="secret"
RESOURCE_HOST="http://localhost:4000"
ISSUER_HOST="http://localhost:4001"
AUDIENCE="api.addressbook.com"
```

Replace `ISSUER` with the domain of your Authorization Server, `CLIENT_ID` and `CLIENT_SECRET` with the identifier and secret of your Client Application, `SESSION_SECRET` with a random value, and `RESOURCE_HOST` with the domain of your Resource Server.

The `CLIENT_ID` and `CLIENT_SECRET` values in the example above are the same configured in the `idp/app/data/clients.ts` file. If you want to change them remember to change them there too.

For development, use the `dev` script to run the application:

```sh
bun run dev
```

For production, use the `start` script to run the application after building it:

```sh
bun run build
bun start
```

> [!TIP]
> If you visit the `/healthcheck` endpoint in the browser, it will fetch the healthcheck endpoints of the Resource Server and Authorization Server, to confirm they're running. Which can also migrate and seed their databases automatically.

### Authorization Server

Navigate to the `idp` directory and install the dependencies:

```sh
cd idp
bun install
```

Create a `.env` file with the following content:

```txt
PORT=4001
RESOURCE_HOST="http://localhost:4000"
AUDIENCE="api.addressbook.com"
ISSUER="idp.addressbook.com"
ISSUER_HOST="http://localhost:4001"

GH_CLIENT_ID="<REPLACE-ME>"
GH_CLIENT_SECRET="<REPLACE-ME>"
```

Set up the database:

```sh
bun run db:setup
```

This command will execute `bun run db:migrate` and `bun run db:seed`. To reset the data, run `bun run db:reset` to clear the SQLite database and then `bun run db:setup` to recreate it.

> [!TIP]
> You can skip this setup if you navigate to `/healthcheck` endpoint in the browser which will create an in-memory database, migrate and seed it automatically.

Start the server:

```sh
bun start
```

That's it! You can now access the Client Application at [http://localhost:3000](http://localhost:3000), log in to your Authorization Server at [http://localhost:4001](http://localhost:4001), and access the Resource Server at [http://localhost:4000](http://localhost:4000).
