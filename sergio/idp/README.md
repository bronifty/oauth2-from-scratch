# Authorization Server

This is the Authorization Server, also known as Identity Provider, IdP, or issuer. This app is a TypeScript application running on [Bun](https://bun.sh) that will authenticate users and issue tokens to our clients.

> [!CAUTION]
> This is a simple Authorization Server for educational purposes. Do not use it in production, and if you do, please make sure to review the code and understand the security implications.

## Setup

Install the dependencies

```sh
bun install
```

Create a `.env` file like this:

```txt
PORT=4001
RESOURCE_HOST="http://localhost:4000"
AUDIENCE="api.addressbook.com"
ISSUER="idp.addressbook.com"
ISSUER_HOST="http://localhost:4001"

GH_CLIENT_ID="<REPLACE-ME>"
GH_CLIENT_SECRET="<REPLACE-ME>"
```

Start the server:

```sh
bun start
```
