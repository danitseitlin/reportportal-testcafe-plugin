/* eslint-disable no-nested-ternary */
/* eslint-disable no-undefined */
const RP = require('./report-portal');

exports['default'] = () => {
    return {
        async reportTaskStart (startTime, userAgents, testCount) {
            this.log = [];

            console.log = function (d) {
                //this.log.push(d);
                process.stdout.write(d + '\n');
            };
            this.startTime = startTime;
            this.testCount = testCount;
            //const logs = [`Running tests in: ${userAgents}\n\n`];
            
            this.write(`Running tests in: ${userAgents}`)
                .newline()
                .newline();
            
            this.client = new RP();
            await this.client.startLaunch();
        },

        async reportFixtureStart (name, /*path, meta*/) {
            this.currentFixtureName = name;
            console.log(`${this.chalk.gray('-')} Fixture '${name}'`);
            //await this.client.startSuite(name);
        },
        async reportTestStart ( name /*, meta */) {
            // NOTE: This method is optional.
            console.log(`- Test '${name}'\n`);
            await this.client.startTest(name);
            await this.client.sendTestLogs(this.client.curTest.id, 'info', `${this.chalk.gray('-')} Test '${name}'`);
        },
        async reportTestDone (name, testRunInfo, /*meta*/) {
            const errors      = testRunInfo.errs;
            const warnings    = testRunInfo.warnings;
            const hasErrors   = errors !== undefined ? !!errors.length : false;
            const hasWarnings = warnings !== undefined ? !!warnings.length : false;

            // eslint-disable-next-line no-nested-ternary
            const result = testRunInfo.skipped ? 'skipped' : hasErrors ? 'failed' : 'passed';

            name = `${this.currentFixtureName} - ${name}`;

            const title = `${result === 'passed' ? this.chalk.green('✓') : result === 'skipped' ? this.chalk.blue('-') : this.chalk.red('✖')} ${name}`;
        
            this.setIndent(0)
                .write(`${title}`)
                .newline();

            if (hasErrors) {
                //this.newline().write('Errors:');
                //
                //errors.forEach(error => {
                //    this.newline().write(error);
                //    this.client.sendTestLogs(this.client.curTest.id, 'error', error);
                //});
                errors.forEach(async (error, idx) => {
                    this.newline()
                        .write(this.formatError(error, `${idx + 1}) `))
                        .newline();
                    //this.client.sendTestLogs(this.client.curTest.id, 'error', error);
                });
            }

            if (hasWarnings) {
                //this.newline().write('Warnings:');
                //
                warnings.forEach(warning => {
                    this.newline().write(warning);
                    this.client.sendTestLogs(this.client.curTest.id, 'warning', warning);
                });
                warnings.forEach((warning, idx) => {
                    this.newline()
                        .write(this.formatError(warning, `${idx + 1}) `))
                        .newline();
                });
            }
            await this.client.finishTest(this.client.curTest.id, result);
        },

        async reportTaskDone (endTime, passed, warnings, result) {
            const durationMs  = endTime - this.startTime;
            const durationStr = this.moment.duration(durationMs).format('h[h] mm[m] ss[s]');

            let footer = result.failedCount ? `${result.failedCount}/${this.testCount} failed` : `${result.passedCount} passed`;

            footer += ` (Duration: ${durationStr})`;
            footer += ` (Skipped: ${result.skippedCount})`;
            footer += ` (Warnings: ${warnings.length})`;

            this.newline()
                .setIndent(0)
                .write(footer)
                .newline();
            //await this.client.finishSuite(this.client.suite.id, 'passed');
            await this.client.finishLaunch();
        }
    };
};

module.exports = exports['default'];
