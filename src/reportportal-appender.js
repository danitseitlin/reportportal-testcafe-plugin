const ReportPortal = require("./report-portal");
const { LogAppender, LogActions } = require("./log-appender");

// appender for reportportal
class ReportPortalAppender extends LogAppender {
    constructor() {
        super();
        try{
            this.reporter = new ReportPortal();
        }catch(e){
            process.stdout.write('ReportPortal ctor exception');
            throw e;
        }
    }
    now() {
        return new Date().valueOf();
    }
    async log(arg) {
        await this.reporter.appendAction(
            LogActions.LOG,
            `${arg}`
        );
    }
    async debug(arg) {
        await this.reporter.appendAction(
            LogActions.DEBUG,
            `${arg}`
        );
    }
    async info(arg) {
        await this.reporter.appendAction(
            LogActions.INFO,
            `[INFO] ${arg}`
        );
    }
    async error(arg) {
        await this.reporter.appendAction(
            LogActions.ERROR,
            `[ERROR] ${arg}`
        );
    }
    async fatal(arg) {
        await this.reporter.appendAction(
            LogActions.FATAL,
            `[FATAL] ${arg}`
        );
    }
    async group(arg) {
        await this.reporter.appendAction(
            LogActions.GROUP,
            `${arg}`
        );
    }
    async groupEnd() {
        await this.reporter.appendAction(LogActions.GROUP_END);
    }
    async startFixture(arg) {
        await this.reporter.appendAction(
            LogActions.START_FIXTURE,
            `[before Test] ${arg}`
        );
    }

    async startLaunch(arg) {
        await this.reporter.appendAction(
            LogActions.START_LAUNCH,
            `${arg}`
        );
    }
    async startTest(arg) {
        await this.reporter.appendAction(
            LogActions.START_TEST,
            `[TEST]${arg}`
        );
    }
    async finishTest(arg) {
        await this.reporter.appendAction(
            LogActions.FINISH_TEST,
            `${arg}`
        );
    }
    async finishTask(arg) {
        await this.reporter.appendAction(
            LogActions.FINISH_TASK,
            `${arg}`
        );
    }
    async finishLaunch(arg) {
        await this.reporter.appendAction(
            LogActions.FINISH_LAUNCH,
            `${arg}`
        );
    }
    async addScreenshot(...args) {
        if (args !== undefined) {
            const msg = args[0][0];
            const fileObj = args[0][1];
            await this.reporter.appendAction(
                LogActions.ADD_SCREENSHOT,
                msg,
                fileObj
            );
        }
    }

    isCompleted() {
        return this.reporter.isCompleted();
    }
}

module.exports = ReportPortalAppender;
