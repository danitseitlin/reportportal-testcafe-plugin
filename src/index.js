/* eslint-disable no-console */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-undefined */
const RP = require('./report-portal');

exports['default'] = () => {
    return {
        async reportTaskStart (startTime, userAgents, testCount) {
            this.startTime = startTime;
            this.testCount = testCount;
            
            this.setIndent(1)
                .useWordWrap(true)
                .write(this.chalk.bold('Running tests in:'))
                .newline();

            userAgents.forEach(ua => {
                this.write(`- ${this.chalk.blue(ua)}`)
                    .newline();
            });
            
            this.reporter = new RP();
            await this.reporter.startLaunch();
        },

        async reportFixtureStart (name, /*path, meta*/) {
            this.currentFixtureName = name;
            this.setIndent(1)
                .useWordWrap(true);

            if (this.afterErrorList)
                this.afterErrorList = false;
            else
                this.newline();

            this.write(name)
                .newline()
                .newline();
        },
        async reportTestStart (name /*, meta */) {
            process.logs = [];
            console.log = d => {
                (async() => this.captureLogs(this.reporter.test.id, 'info', d, new Date().valueOf()))().then(d => {
                    process.stdout.write(d + '\n');
                })
            };
            console.error = d => {
                (async() => this.captureLogs(this.reporter.test.id, 'error', d, new Date().valueOf()))().then(d => {
                    process.stdout.write(d + '\n');
                })
            };
            console.warning = d => {
                (async() => this.captureLogs(this.reporter.test.id, 'warning', d, new Date().valueOf()))().then(d => {
                    process.stdout.write(d + '\n');
                })
            };
            console.debug = d => {
                (async() => this.captureLogs(this.reporter.test.id, 'debug', d, new Date().valueOf()))().then(d => {
                    process.stdout.write(d + '\n');
                })
            };
            await this.reporter.startTest(name);
            await this.captureLogs(this.reporter.test.id, 'debug', `Starting test ${name}...`, new Date().valueOf())
        },
        async captureLogs(testId, level, message, time, attachment) {
            try {
                if(this.reporter.displayDebugLogs)
                    process.stdout.write(`\n [Test ${testId}] Capturing log: ${message} \n`)
                if(!this.reporter.liveReporting)
                    process.logs.push({ type: level, log: message, file: attachment, time: new Date().valueOf() });
                else
                    await this.reportLogs(testId, level, message, time, attachment);
                return message
            } 
            catch (error) {
                if(this.reporter.displayDebugLogs)
                    process.stdout.write(`\n [Test ${testId}] Sending log: ${message} \n caused error: ${error} \n`)
                this.reporter.client.handleError(error);
            }
        },
        async reportLogs(testId, level, message, time, attachment) {
            if(message !== undefined) {
                const isJSON = this.reporter.client.isJSON(message) || Array.isArray(message);
                //If the log is a stacktrace, and we want to focus on printing the error message itself.
                if(isJSON && JSON.parse(message).errMsg !== undefined) message = JSON.parse(message).errMsg;
                //If the log is a JS Object
                else if(isJSON) message = JSON.parse(message)
                message = this.reporter.client.isJSON(message) ? JSON.stringify(message): message
            }
            await this.reporter.sendTestLogs(testId, level, message, time, attachment);
        },
        async reportTestDone (name, testRunInfo) {
            const errors      = testRunInfo.errs;
            const hasErrors   = errors !== undefined ? !!errors.length : false;
            let symbol    = null;
            let nameStyle = null;

            if (testRunInfo.skipped) {
                this.skipped++;
                symbol    = this.chalk.cyan('-');
                nameStyle = this.chalk.cyan;
            }
            else if (hasErrors) {
                symbol    = this.chalk.red.bold(this.symbols.err);
                nameStyle = this.chalk.red.bold;
            }
            else {
                symbol    = this.chalk.green(this.symbols.ok);
                nameStyle = this.chalk.grey;
            }

            let title = `${symbol} ${nameStyle(name)}`;

            this.setIndent(1)
                .useWordWrap(true);

            if (testRunInfo.unstable)
                title += this.chalk.yellow(' (unstable)');

            if (testRunInfo.screenshotPath)
                title += ` (screenshots: ${this.chalk.underline.grey(testRunInfo.screenshotPath)})`;

            this.newline().write(title);

            if (hasErrors)
                await this._renderErrors(testRunInfo.errs);

            const result = testRunInfo.skipped ? 'skipped' : hasErrors ? 'failed' : 'passed';

            this.afterErrorList = hasErrors;

            this.newline();
            if (testRunInfo.screenshots) {
                testRunInfo.screenshots.forEach(async (screenshot, idx) => {
                    await this.captureLogs(this.reporter.test.id, 'debug', `Taking screenshot (${name}-${idx}.png)`, new Date().valueOf(), { name: `${name}-${idx}.png`, path: screenshot.screenshotPath })
                });
            }
            await this.captureLogs(this.reporter.test.id, 'debug', `Test ${name} has ended...`, new Date().valueOf())
            if(!this.reporter.liveReporting) {
                process.logs.forEach(async (item) => {
                    await this.reportLogs(this.reporter.test.id, item.type, item.log, item.time, item.file);
                })
            }
            await this.reporter.finishTest(this.reporter.test.id, result);
        },

        async reportTaskDone (endTime, passed, warnings) {
            const durationMs  = endTime - this.startTime;
            const durationStr = this.moment.duration(durationMs).format('h[h] mm[m] ss[s]');

            var footer = passed === this.testCount ?
                this.chalk.bold.green(`${this.testCount} passed`) :
                this.chalk.bold.red(`${this.testCount - passed}/${this.testCount} failed`);

            footer += this.chalk.grey(` (${durationStr})`);

            this.newline()
                .setIndent(0)
                .write(footer)
                .newline();

            if (this.skipped > 0) {
                this.write(this.chalk.cyan(`${this.skipped} skipped`))
                    .newline();
            }

            if (warnings.length)
                this._renderWarnings(warnings);
            await this.reporter.finishLaunch();
        },
        async _renderErrors (errs) {
            this.setIndent(3)
                .newline();

            await errs.forEach(async (err, idx) => {
                await this.captureLogs(this.reporter.test.id, 'error', JSON.stringify(err), new Date().valueOf())
                var prefix = this.chalk.red(`${idx + 1}) `);

                this.newline()
                    .write(this.formatError(err, prefix))
                    .newline()
                    .newline();
            });
        },
        _renderWarnings (warnings) {
            this.newline()
                .setIndent(1)
                .write(this.chalk.bold.yellow(`Warnings (${warnings.length}):`))
                .newline();

            warnings.forEach(msg => {
                this.setIndent(1)
                    .write(this.chalk.bold.yellow('--'))
                    .newline()
                    .setIndent(2)
                    .write(msg)
                    .newline();
            });
        }
    };
};

module.exports = exports['default'];
