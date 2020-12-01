/* eslint-disable no-undefined */
const RP = require('./report-portal');

exports['default'] = () => {
    return {
        async reportTaskStart (startTime, userAgents, testCount) {
            this.startTime = startTime;
            this.testCount = testCount;

            this.write(`Running tests in: ${userAgents}`)
                .newline()
                .newline();
            
            this.client = new RP();
            await this.client.startLaunch();
        },

        async reportFixtureStart (name, /*path, meta*/) {
            this.currentFixtureName = name;
            await this.client.startTest();
        },

        async reportTestDone (name, testRunInfo, /*meta*/) {
            const errors      = testRunInfo.errs;
            const warnings    = testRunInfo.warnings;
            const hasErrors   = errors !== undefined ? !!errors.length : false;
            const hasWarnings = warnings !== undefined ? !!warnings.length : false;
            // eslint-disable-next-line no-nested-ternary
            const result = testRunInfo.skipped ? 'skipped' : hasErrors ? 'failed' : 'passed';

            name = `${this.currentFixtureName} - ${name}`;

            const title = `${result} ${name}`;

            this.write(title);

            if (hasErrors) {
                this.newline().write('Errors:');

                errors.forEach(async error => {
                    this.newline().write(this.formatError(error));
                    await this.client.sendTestLogs(await this.client.curTest.tmpId, 'error', this.formatError(error));
                });
                await this.client.sendTestLogs(await this.client.curTest.tmpId, 'error', errors);
            }

            if (hasWarnings) {
                this.newline().write('Warnings:');

                warnings.forEach(async warning => {
                    this.newline().write(warning);
                    await this.client.sendTestLogs(await this.client.curTest.tmpId, 'warning', this.formatError(warning));
                });
            }
            await this.client.finishTest(await this.client.curTest.tmpId, result);
        },

        async reportTaskDone (endTime, passed, warnings, result) {
            const durationMs  = endTime - this.startTime;
            const durationStr = this.moment.duration(durationMs).format('h[h] mm[m] ss[s]');

            let footer = result.failedCount ? `${result.failedCount}/${this.testCount} failed` : `${result.passedCount} passed`;

            footer += ` (Duration: ${durationStr})`;
            footer += ` (Skipped: ${result.skippedCount})`;
            footer += ` (Warnings: ${warnings.length})`;

            this.write(footer)
                .newline();
            await this.client.finishLaunch();
        }
    };
};

module.exports = exports['default'];
