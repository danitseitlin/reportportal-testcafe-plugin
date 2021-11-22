const LogManager = require('./log-manager');
const ConsoleLogAppender = require('./console-log-appender');
const LogActions = require('./log-appender').LogActions;
const ReportPortalAppender = require('./reportportal-appender');
const path = require('path'); 
const filename = path.basename(__filename);

exports['default'] = () => {
    return { 
        // testcafe reportTaskStart
        async reportTaskStart (startTime, userAgents, testCount) {
            this.startTime = startTime;
            this.testCount = testCount;

            this.setIndent(1)
                .useWordWrap(true)
                .write(this.chalk.cyan('['+filename+']enter reportTaskStart.  Running tests in:'))
                .newline();

            userAgents.forEach(ua => {
                this.write(`- ${this.chalk.blue(ua)}`)
                    .newline();
            });
           
            this.logManager = new LogManager(); 
            await this.logManager.addAppenders({type:ConsoleLogAppender},{type:ReportPortalAppender});
            await this.logManager.appendMsg(LogActions.START_LAUNCH);
            this.write(this.chalk.cyan('[' + filename + ']exit reportTaskStart'));
        },
        // testcafe reportFixtureStart
        async reportFixtureStart (name='', /*path, meta*/) {
            this.currentFixtureName = name;
            this.setIndent(1)
                .useWordWrap(true);

            if (this.afterErrorList)
                this.afterErrorList = false;
            else
                this.newline();

            this.write(this.chalk.cyan('[' + filename + ']reportFixtureStart: ' + name))
                .newline()
                .newline();
        },
        // testcafe reportTestStart
        async reportTestStart (name /*, meta */) {
            if(name === undefined) name = 'undefined name';
            this.write(this.chalk.cyan('[' + filename + '] enter reportTestStart '+name)).newline();
            await this.logManager.appendMsg(LogActions.START_TEST, name);
            this.write(this.chalk.cyan('[' + filename + '] exit reportTestStart')).newline();
        },
        // testcafe reportTestDone
        async reportTestDone (name, testRunInfo) {
            this.write(this.chalk.cyan('[' + filename + '] enter reportTestDone')).newline();
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

            this.newline().write(title).newline();

            if (hasErrors)
                await this._renderErrors(testRunInfo.errs);

            const result = testRunInfo.skipped ? 'skipped' : hasErrors ? 'failed' : 'passed';

            this.afterErrorList = hasErrors;

            this.newline();
            if (testRunInfo.screenshots) {
                testRunInfo.screenshots.forEach(async (screenshot, idx) => {
                    await console.log(`Taking screenshot (${name}-${idx}.png)`,  { name: `${name}-${idx}.png`, path: screenshot.screenshotPath });
                });
            }
            process.stdout.write(`Test ${name} has ended...\n`);
            
            await this.logManager.appendMsg(LogActions.FINISH_TEST, result);
            this.write(this.chalk.cyan('['+filename+'] exit reportTestDone')).newline();
        },
        //testcafe reportTaskDone
        async reportTaskDone (endTime, passed, warnings) {
            this.write(this.chalk.cyan('[' + filename + '] enter reportTaskDone')).newline();
            const durationMs  = endTime - this.startTime;
            const durationStr = this.moment.duration(durationMs).format('h[h] mm[m] ss[s]');

            const failed = this.testCount - passed;
            var footer = passed === this.testCount ?
                this.chalk.bold.green(`${this.testCount} passed`) :
                this.chalk.bold.red(`${failed}/${this.testCount} failed`);

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
            const result = failed == 0? "passed": "failed";
            await this.logManager.appendMsg(LogActions.FINISH_LAUNCH, result);
            this.write(this.chalk.cyan('['+filename+'] exit reportTaskDone')).newline();
            await this.logManager.waitForLastMessageResponse();
        },
        //testcafe _renderErrors
        async _renderErrors (errs) {
            process.stdout.write(this.chalk.cyan('[' + filename + "] enter renderErrors"));
            this.setIndent(3)
                .newline();

            await errs.forEach(async (err, idx) => {
                var prefix = this.chalk.red(`${idx + 1}) `);
                await console.error(this.formatError(err));
            });
            process.stdout.write(this.chalk.cyan('[' + filename + "] exit renderErrors"));
        },
        //testcafe _renderWarnings
        async _renderWarnings (warnings) {
            this.write(this.chalk.cyan('[' + filename + "] enter renderWarnings"));
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
                //console.warn(msg);
            });
        }
    };
};

module.exports = exports['default'];