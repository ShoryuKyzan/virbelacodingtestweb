# Intro

XXX TODO
I generated this project based on a starter template for node/typescript to speed things up: https://github.com/microsoft/TypeScript-Node-Starter (mainly for proper typescript setup), and I added the dockerization.

# Features

XXX TODO

# How to run

Set up a docker environment.

## Production

- This was designed to run on one machine inside a docker engine.
- `npm run start` will build and start docker-compose for the yaml file in the main directory.
- To rebuild quickly, use ./update.sh
- Will run api on port 8000
- To shut down, run `npm run stop`

## Development

- Running tests: `npm run test`
- Running server:
  - Run `npm install -g nodemon ts-node cross-env`
  - Run `npm install`
  - Run `npm run serve`
  - Will run an API server on port 8000, and it will refresh automatically when code changes are made

# Changelog

TODO
