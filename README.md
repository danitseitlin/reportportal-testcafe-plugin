<p align='center'>
  <a href='https://www.npmjs.com/package/testcafe-reporter-reportportal-plugin'>
    <img src='https://img.shields.io/npm/v/testcafe-reporter-reportportal-plugin/latest?style=plastic' target='_blank' />
  </a>
  <a href='https://npmjs.org/package/testcafe-reporter-reportportal-plugin' style='width:25px;height:20px;'>
    <img src='https://img.shields.io/npm/dm/testcafe-reporter-reportportal-plugin.svg?color=blue&style=plastic' target='_blank' />
  </a>
  <a href='https://github.com/RedisLabs/reportportal-testcafe-plugin/issues' style='width:25px;height:20px;'>
    <img src='https://img.shields.io/github/issues/RedisLabs/reportportal-testcafe-plugin?style=plastic' target='_blank' />
  </a>
  <a href='https://npmjs.org/package/testcafe-reporter-reportportal-plugin' style='width:25px;height:20px;'>
    <img src='https://img.shields.io/bundlephobia/min/testcafe-reporter-reportportal-plugin/latest?style=plastic' target='_blank' />
  </a>
  <a href='https://github.com/RedisLabs/reportportal-testcafe-plugin/commits/master'>
    <img src='https://img.shields.io/github/last-commit/RedisLabs/reportportal-testcafe-plugin?style=plastic' />
  </a>
 <a href='https://github.com/RedisLabs/reportportal-testcafe-plugin/blob/master/LICENSE'>
    <img src='https://img.shields.io/badge/license-Apache%202.0-blue.svg?style=plastic' target='_blank' />
  </a>
</p></p>

This is the **reportportal-plugin** reporter plugin for [TestCafe](http://devexpress.github.io/testcafe).

# Integrate with Reporter in your project

## Install the reporter via NPM
```
npm i testcafe-reporter-reportportal-plugin --save-dev
```

## Use the reporter in your TestCafe test run
When you run tests from the command line, specify the reporter name by using the `--reporter` option:
```
testcafe chrome 'path/to/test/file.js' --reporter reportportal-plugin
```
OR:
```
testcafe chrome 'path/to/test/file.js' --reporter=reportportal-plugin
```

When you use API, pass the reporter name to the `reporter()` method:

```js
testCafe
    .createRunner()
    .src('path/to/test/file.js')
    .browsers('chrome')
    .reporter('reportportal-plugin') // <-
    .run();
```

## Map of existing CLI Arguments:

| Required | Argument   | Description                                                                                                     | Example                         | 
| -------- | ---------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Yes      | rdomain    | The domain of the report portal. https://{domain}/                                                              | --rdomain=reports.pl.portal.com |
| Yes      | rtoken     | The token to auth report portal with. Taken from the 'Profile' of your user.                                    | --rtoken=gfkbv5994350mg         |
| Yes      | rlaunch    | The name of your launch. Required (Unless replaced by rlaunch-id argument).                                     | --rlaunch=my-launch             |
| Yes      | rproject   | The name of your project.                                                                                       | --rproject=my-project           |
| No       | rlaunch-id | The ID of an existing launch, can replace the rlaunch parameter.                                                | --rlaunch-id=fjvkdnvjgnf        |
| No       | rsuite     | An optional suite name, adding a suite will put all tests under the suite instead of directly under the launch. | --rsuite=my-suite-name          |
| No       | rprotocol  | An optional ability to override the protocol of the API protocol. {protocol}://{domain}/.                       | --rprotocol=http                |
| No       | disable-live-reporting | An optional ability to disable the live reporting                                                   | --disable-live-reporting        |

# Devloping the plugin? 
in order to run tests in this plugin environment , in your cli run:
(your reportportal parameters are listed under your reportportal profile)
```
npm run test ./tests/test.e2e.ts -- --rprotocol=https --rlaunch=launchName --rsuite=suitName --rdomain=YourReportportalDomain --rtoken=yourReportportalToken --rproject=YourReportportalProject
```
or 
```
 testcafe chrome:headless tests/test.e2e.ts --rprotocol=https --rsuite=suitName --rdomain=YourReportportalDomain --rtoken=yourReportportalToken --rproject=YourReportportalProject --rlaunch=launchName --reporter reportportal-plugin
```
# Adding a new appender
1. extend LogAppender and implement its methods.
2. in index.js: 
    await this.logManager.addAppenders({ type: ConsoleLogAppender },{ type: ReportPortalAppender });
    
# Interested in contributing?
Please read our contributing guidelines [here](https://github.com/RedisLabs/reportportal-testcafe-plugin/blob/master/CONTRIBUTING.md)

## Author
Redis https://github.com/RedisLabs/reportportal-testcafe-plugin/
forked from Dani Tseitlin (https://github.com/danitseitlin)
