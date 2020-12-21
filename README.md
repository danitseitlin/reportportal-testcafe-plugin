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

## Author
Dani Tseitlin (https://github.com/danitseitlin)
