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
            
            this.client = new RP();
            await this.client.startLaunch();
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
            console.log = function (d) {
                process.logs.push({ type: 'info', log: d, time: new Date().valueOf() });
                process.stdout.write(d + '\n');
            };
            console.error = function (d) {
                process.logs.push({ type: 'error', log: d, time: new Date().valueOf() });
                process.stdout.write(d + '\n');
            };
            console.warning = function (d) {
                process.logs.push({ type: 'warning', log: d, time: new Date().valueOf() });
                process.stdout.write(d + '\n');
            };
            console.debug = function (d) {
                process.logs.push({ type: 'debug', log: d, time: new Date().valueOf() });
                process.stdout.write(d + '\n');
            };
            process.logs.push({ type: 'debug', log: `Starting test ${name}...`, time: new Date().valueOf() });
            await this.client.startTest(name);
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
                this._renderErrors(testRunInfo.errs);

            const result = testRunInfo.skipped ? 'skipped' : hasErrors ? 'failed' : 'passed';

            this.afterErrorList = hasErrors;

            this.newline();
            if (testRunInfo.screenshots) {
                testRunInfo.screenshots.forEach((screenshot, idx) => {
                    process.logs.push({ type: 'debug', log: `Taking screenshot (${name}-${idx}.png)`, file: { name: `${name}-${idx}.png`, path: screenshot.screenshotPath }, time: new Date().valueOf() });
                });
            }
            process.logs.push({ type: 'debug', log: `Test ${name} has ended...`, time: new Date().valueOf() });
            process.logs.forEach(async (item) => {
                try {
                    const isJSON = this.client.client.isJSON(item.log);
                    if(isJSON && JSON.parse(item.log).errMsg !== undefined) item.log = JSON.parse(item.log).errMsg;
                    if (item.log !== undefined)
                        item.log = this.client.client.isJSON(item.log) ? JSON.stringify(item.log) : item.log;
                    await this.client.sendTestLogs(this.client.test.id, item.type, item.log, item.time, item.file);
                } 
                catch (error) {
                    this.client.client.handleError(error);
                }
            });
            await this.client.finishTest(this.client.test.id, result);
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
            await this.client.finishLaunch();
        },
        _renderErrors (errs) {
            this.setIndent(3)
                .newline();

            errs.forEach((err, idx) => {
                process.logs.push({ type: 'error', log: JSON.stringify(err), time: new Date().valueOf() });
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
