const LogMgrSingleton = require('./logMgrSingleton');
const {LogAppender,LMlog, LMinfo, LMdebug, LMwarning, LMerror, LMgroup, LMgroupEnd} = require('./logAppender');
const ConsoleLogAppender = require('./consoleLogAppender');
const ReportPortalAppender = require('./reportportalAppender');
const path = require('path'); 
const filename = path.basename(__filename);

exports['default'] = () => {
    return { 
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

            
            this.logMgr = new LogMgrSingleton(); 
            await this.logMgr.addAppenders({type:ConsoleLogAppender},{type:ReportPortalAppender});
            this.logMgr.appendMsg("startLaunch");
            this.write(this.chalk.cyan('[' + filename + ']exit reportTaskStart'));

        },
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
        async reportTestStart (name /*, meta */) {
            this.write(this.chalk.cyan('[' + filename + '] enter reportTestStart')).newline();
            this.logMgr.appendMsg("startTest", name);
            this.write(this.chalk.cyan('[' + filename + '] exit reportTestStart')).newline();
        },
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

            this.newline().write(title);

            if (hasErrors)
                await this._renderErrors(testRunInfo.errs);

            const result = testRunInfo.skipped ? 'skipped' : hasErrors ? 'failed' : 'passed';

            this.afterErrorList = hasErrors;

            this.newline();
            if (testRunInfo.screenshots) {
                testRunInfo.screenshots.forEach(async (screenshot, idx) => {
                    console.log(`Taking screenshot (${name}-${idx}.png)`,  { name: `${name}-${idx}.png`, path: screenshot.screenshotPath })
                });
            }
            console.debug(`Test ${name} has ended...`)
            
            this.logMgr.appendMsg("finishTest", result);
            this.write(this.chalk.cyan('['+filename+'] exit reportTestDone')).newline();
        },
        async reportTaskDone (endTime, passed, warnings) {
            this.write(this.chalk.cyan('[' + filename + '] enter reportTaskDone')).newline();
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
            this.logMgr.appendMsg("finishLaunch");
            this.write(this.chalk.cyan('['+filename+'] exit reportTaskDone')).newline();
        },
        async _renderErrors (errs) {
            this.write(this.chalk.cyan('[' + filename + "] enter renderErrors"));
            this.setIndent(3)
                .newline();

            await errs.forEach(async (err, idx) => {
                console.error(JSON.stringify(err));
                var prefix = this.chalk.red(`${idx + 1}) `);

                this.newline()
                    .write(this.formatError(err, prefix))
                    .newline()
                    .newline();
            });
            this.write(this.chalk.cyan('[' + filename + "] exit renderErrors"));
        },
        _renderWarnings (warnings) {
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
            });
        }
    };
};

module.exports = exports['default'];