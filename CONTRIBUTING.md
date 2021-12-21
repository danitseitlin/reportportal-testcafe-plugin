# Contributing guidelines

## Setup
Run `npm i` in the root of the project, in order to install all the NPM dependencies

## Compile your code, and build your local reporter
In order to be able to test your latest report changes, please run `npm run build-local-reporter` which will build the code via Babel and will relink the project to the reporter `testcafe-reporter-reportportal-plugin`.
In your tests, make sure you use the report with one of the reporter options [here](https://github.com/danitseitlin/reportportal-testcafe-plugin#use-the-reporter-in-your-testcafe-test-run)

## Running tests
### Running integration tests
#### Start a local Report portal environment
Run the following commands to setup a local environment of Report Portal -->
* > `npm run download-report-portal-latest-docker-compose-file`<br>//Downloading the latest docker compose file from the report portal master
* > `npm run up`<br>// Start the report portal server. In order to stop the server run npm run down later

#### Running the tests
* Use the template from `.env.integration-tests` and create a `.env` file with the same configuration.
If you're intersted in running the tests on your own external server, please adjust the `.env` file configuration to point to it.
* Run `npm run integration-tests` to run all E2E tests.

#### Login into the UI
* Navigate to http://localhost:8080
* Login into one of the existing usernames:

| User        | Username   | Password |
| ----------- | ---------- | -------- |
| default     | default    | 1q2w3e   |
| super admin | superadmin | erebus   |

The following users are taken from [official docs](https://reportportal.io/docs/Deploy-with-Docker)
#### Cleanup
In order to cleanup you will need to only run `npm run down` or `npm run stop` to stop/teardown all the Report Portal server services.

### Running Unit tests
* Run `npm run run-full-unit-tests` to run all Unit tests.