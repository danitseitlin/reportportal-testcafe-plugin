# Contributing guidelines

## Setup
Run `npm i` in the root of the project, in order to install all the NPM dependencies

## Compile your code, and build your local reporter
In order to be able to test your latest report changes, please run `npm run build-local-reporter` which will build the code via Babel and will relink the project to the reporter `testcafe-reporter-reportportal-plugin`.
In your tests, make sure you use the report with one of the reporter options [here](https://github.com/redislabs/reportportal-testcafe-plugin#use-the-reporter-in-your-testcafe-test-run)

## Running tests
In order to run some tests, you can execute our tests running `npm run e2e-tests` to just run the tests or `npm run run-e2e-tests` that will firstly build the report and relink it before running the tests.
Please look into the `scripts` section of the `package.json` file for more similar test run options, while test script that start with `run` will rebuild and relink and the run the tests, while others will just run the test with the currently linked reporter.

In case you're interested into running the e2e tests on your own Report portal environment, please create a `.env` file located in the root of the repository with the following contents:
```

rdomain="my-rp-domain.com"
rtoken="My personal PR token"
....
Make sure to add all the relevant parameters, for your test.
```