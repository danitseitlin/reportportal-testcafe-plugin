import { ReportPortal } from './report-portal';

module.exports = function () {
    return {
        async reportTaskStart (startTime, userAgents, testCount) {
            this.startTime = startTime;
            this.testCount = testCount;

            this.write(`Running tests in: ${userAgents}`)
                .newline()
                .newline();
            this.client = new ReportPortal();
            this.client.connect();
            this.client.startLaunch();
        },

        async reportFixtureStart (name, path, meta) {
            this.currentFixtureName = name;
            this.client.startTest()
        },

        async reportTestDone (name, testRunInfo, meta) {
            const errors      = testRunInfo.errs;
            const warnings    = testRunInfo.warnings;
            const hasErrors   = !!errors.length;
            const hasWarnings = !!warnings.length;
            const result = testRunInfo.skipped ? 'skipped' : hasErrors ? 'failed' : 'passed';

            name = `${this.currentFixtureName} - ${name}`;

            const title = `${result} ${name}`;

            this.write(title);

            if (hasErrors) {
                this.newline().write('Errors:');

                errors.forEach(error => {
                    this.newline().write(this.formatError(error));
                    this.client.sendTestLogs(this.client.curTest.tmpId, 'error', this.formatError(error))
                });
                this.client.sendTestLogs(this.client.curTest.tmpId, 'error', errors)
            }

            if (hasWarnings) {
                this.newline().write('Warnings:');

                warnings.forEach(warning => {
                    this.newline().write(warning);
                    this.client.sendTestLogs(this.client.curTest.tmpId, 'warning', this.formatError(error))
                });
            }
            this.client.finishTest(this.client.curTest.tmpId, result);
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
            this.client.finishLaunch()
        }
    };
};
