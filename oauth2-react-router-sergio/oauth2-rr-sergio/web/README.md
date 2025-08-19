# Client Application

This is our client application. It is a React Router application that uses an Authorization Server to login, and sends requests to Resource Server after login.

## Setup

Install the dependencies

```sh
bun install
```

Create a `.env` like this:

```txt
ISSUER="http://localhost:4001"
CLIENT_ID="56f0fee7-a73e-41f5-9a75-310e5bb340ee"
CLIENT_SECRET="d4023cc0-4d9f-4df2-9ed7-e4762438f9a9"
SESSION_SECRET="secret"
RESOURCE_HOST="http://localhost:4000"
AUDIENCE="api.addressbook.com"
```

In development, you can use the `dev` script to run the application:

```sh
bun run dev
```

In production, you can use the `start` script to run the application after building it:

```sh
bun run build
bun start
```
