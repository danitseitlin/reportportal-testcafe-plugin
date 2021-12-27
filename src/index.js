const LogManager = require("./log-manager");
const LogActions = require("./log-appender").LogActions;
const ConsoleLogAppender = require("./console-log-appender");
const ReportPortalAppender = require("./reportportal-appender");
const cliArguments = require("cli-argument-parser").cliArguments;
const path = require("path");
const filename = path.basename(__filename);

exports["default"] = () => {
    return {
        // testcafe reportTaskStart
        async reportTaskStart(startTime, userAgents, testCount) {
            this.startTime = startTime;
            this.testCount = testCount;

            this.setIndent(1)
                .useWordWrap(true)
                .write(
                    this.chalk.cyan(
                        `[${filename}]reportTaskStart.  Running tests in:`
                    )
                )
                .newline();

            userAgents.forEach((ua) => {
                this.write(`- ${this.chalk.blue(ua)}`).newline();
            });

            this.logManager = new LogManager();
            const debugMode = cliArguments.rdebug === "true" ? true : false;
            if (debugMode) {
                await this.logManager.addAppenders({
                    type: ReportPortalAppender,
                });
            } else {
                await this.logManager.addAppenders(
                    { type: ConsoleLogAppender },
                    { type: ReportPortalAppender }
                );
            }

            await this.logManager.appendMsg(LogActions.START_LAUNCH);
        },
        // testcafe reportFixtureStart
        async reportFixtureStart(name = "", path = "", meta = "") {
            this.setIndent(1).useWordWrap(true);

            if (this.afterErrorList) this.afterErrorList = false;
            else this.newline();

            this.write(this.chalk.cyan(`start Fixture: ${name}`))
                .newline()
                .newline();

            await this.logManager.appendMsg(
                LogActions.START_FIXTURE,
                `${name}  \nmeta: ${JSON.stringify(meta)}  \npath:${path}`
            );
        },
        // testcafe reportTestStart
        async reportTestStart(name /*, meta */) {
            if (name === undefined) name = "undefined name";
            this.write(
                this.chalk.cyan("[" + filename + "] reportTestStart: " + name)
            ).newline();
            await this.logManager.appendMsg(LogActions.START_TEST, name);
        },
        // testcafe reportTestDone
        async reportTestDone(name, testRunInfo) {
            this.write(
                this.chalk.cyan("[" + filename + "] reportTestDone")
            ).newline();
            const errors = testRunInfo.errs;
            const hasErrors = errors !== undefined ? !!errors.length : false;
            let symbol = null;
            let nameStyle = null;

            if (testRunInfo.skipped) {
                this.skipped++;
                symbol = this.chalk.cyan("-");
                nameStyle = this.chalk.cyan;
            } else if (hasErrors) {
                symbol = this.chalk.red.bold(this.symbols.err);
                nameStyle = this.chalk.red.bold;
            } else {
                symbol = this.chalk.green(this.symbols.ok);
                nameStyle = this.chalk.grey;
            }

            let title = `${symbol} ${nameStyle(name)}`;

            this.setIndent(1).useWordWrap(true);

            if (testRunInfo.unstable) title += this.chalk.yellow(" (unstable)");

            if (testRunInfo.screenshotPath)
                title += ` (screenshots: ${this.chalk.underline.grey(
                    testRunInfo.screenshotPath
                )})`;

            this.newline().write(title).newline();

            if (hasErrors) await this._renderErrors(testRunInfo.errs);

            const result = testRunInfo.skipped
                ? "skipped"
                : hasErrors
                ? "failed"
                : "passed";

            this.afterErrorList = hasErrors;

            this.newline();
            if (testRunInfo.screenshots) {
                testRunInfo.screenshots.forEach(async (screenshot, idx) => {
                    await this.logManager.appendMsg(
                        LogActions.ADD_SCREENSHOT,
                        `Taking screenshot (${name}-${idx}.png)`,
                        {
                            name: `${name}-${idx}.png`,
                            path: screenshot.screenshotPath,
                        }
                    );
                });
            }
            process.stdout.write(
                `Test ${name} has ended...result:[${result}]\n`
            );

            await this.logManager.appendMsg(LogActions.FINISH_TEST, result);
        },
        //testcafe reportTaskDone
        async reportTaskDone(endTime, passed, warnings) {
            this.write(
                this.chalk.cyan("[" + filename + "] reportTaskDone")
            ).newline();
            const durationMs = endTime - this.startTime;
            const durationStr = this.moment
                .duration(durationMs)
                .format("h[h] mm[m] ss[s]");

            const failed = this.testCount - passed;
            var footer =
                passed === this.testCount
                    ? this.chalk.bold.green(`${this.testCount} passed`)
                    : this.chalk.bold.red(`${failed}/${this.testCount} failed`);

            footer += this.chalk.grey(` (${durationStr})`);

            this.newline().setIndent(0).write(footer).newline();

            if (this.skipped > 0) {
                this.write(
                    this.chalk.cyan(`${this.skipped} skipped`)
                ).newline();
            }

            if (warnings.length) this._renderWarnings(warnings);
            const result = failed == 0 ? "passed" : "failed";
            await this.logManager.appendMsg(LogActions.FINISH_LAUNCH, result);
            await this.logManager.waitForLastMessageResponse();
        },
        //testcafe _renderErrors  (stack trace)
        async _renderErrors(errs) {
            process.stdout.write(
                this.chalk.cyan("[" + filename + "] renderErrors")
            );
            this.setIndent(3).newline();

            await errs.forEach(async (err) => {
                await console.error(this.formatError(err));
            });
        },
        //testcafe _renderWarnings
        async _renderWarnings(warnings) {
            this.write(
                this.chalk.cyan("[" + filename + "] enter renderWarnings")
            );
            this.newline()
                .setIndent(1)
                .write(this.chalk.bold.yellow(`Warnings (${warnings.length}):`))
                .newline();

            warnings.forEach((msg) => {
                this.setIndent(1)
                    .write(this.chalk.bold.yellow("--"))
                    .newline()
                    .setIndent(2)
                    .write(msg)
                    .newline();
            });
        },
    };
};

module.exports = exports["default"];
