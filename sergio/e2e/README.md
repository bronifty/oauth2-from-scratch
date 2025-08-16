# End to End Test Suite

This is the end-to-end test suite for our Address Book application.

The test suite uses Playwright to automate the browser and test the application as a user would.

It only comes with one test to ensure the login process works as expected.

## Setup

Install the dependencies

```sh
bun install
```

Run the whole application running the command in the root of the project

```sh
make start
```

Run the test suite

```sh
make e2e
```
