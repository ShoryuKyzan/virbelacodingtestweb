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
  - Sometimes first time the tests time out. Not sure why yet. (fixme)
- Running server:
  - Run `npm install -g nodemon ts-node cross-env`
  - Run `npm install`
  - Run `npm run serve`
  - Will run an API server on port 8000, and it will refresh automatically when code changes are made

# Changelog

TODO

1. How can your implementation be optimized?

   There's an aweful lot of await's in this, there is probably some way to batch these transactions for more speed. While sequelize library is popular, I believe there are some issues where tests are running simultaneously, making the need for alot of sequalize.sync's necessary I think.

1. How much time did you spend on your implementation?

   24.6325 hours across 7 days. Kept a log.

1. What was most challenging for you?

   I had designed an algorithm to place the elevator at a position between the most frequent floors. This is a problem I've never solved before. I came up with an algorithm in algo-research.ods that demonstrates it. I accidentally happened upon something that works well enough, but not precisely. I happened upon this while trying to implement statistical mean of the frequencies of the floors, combined with this line-segment sort of approach of finding the center concentration of the frequencies. I think I inadvertantly inverted the frequencies of the smaller segments. The line-approach suffered from the smaller segments pulling the center closer to them. I accidentally inverted that I think.
   Second thing that was challenging and rather frustrating was some of the annoyances of sequelize, not being object oriented fully (can't programmatically determine the database connection, must use environment variables), Windows/Cygwin environment variables not setting properly (so that I can enter test environment), and some features of sequelize plain old not working intuitively (foreign keys not being set automatically on associate, multithreaded test running messing up things in the shared database).

This was alot for only a few days work, but was fun to get this done.
