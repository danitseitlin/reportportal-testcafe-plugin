# testcafe-reporter-reportportal-plugin
[![Build Status](https://travis-ci.org/danitseitlin/testcafe-reporter-reportportal-plugin.svg)](https://travis-ci.org/danitseitlin/testcafe-reporter-reportportal-plugin)

This is the **reportportal-plugin** reporter plugin for [TestCafe](http://devexpress.github.io/testcafe).

## Install

```
npm install testcafe-reporter-reportportal-plugin
```

## Usage

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

| Required | Argument   | Description                                                                                                     | Example                         | 
| -------- | ---------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Yes      | rdomain    | The domain of the report portal. https://{domain}/                                                              | --rdomain=reports.pl.portal.com |
| Yes      | rtoken     | The token to auth report portal with. Taken from the 'Profile' of your user.                                    | --rtoken=gfkbv5994350mg         |
| Yes      | rlaunch    | The name of your launch. Required (Unless replaced by rlaunch-id argument).                                     | --rlaunch=my-launch             |
| Yes      | rproject   | The name of your project.                                                                                       | --rproject=my-project           |
| No       | rlaunch-id | The ID of an existing launch, can replace the rlaunch parameter.                                                | --rlaunch-id=fjvkdnvjgnf        |
| No       | rsuite     | An optional suite name, adding a suite will put all tests under the suite instead of directly under the launch. | --rsuite=my-suite-name          |
| No       | rprotocol  | An optional ability to override the protocol of the API protocol. {protocol}://{domain}/.                       | --rprotocol=http                |

## Author
Dani Tseitlin (https://github.com/danitseitlin)
