const {
    LMlog,
    LMdebug,
    LMinfo,
    LMwarning,
    LMerror,
    LogAppender,
} = require("./log-appender");

// responsible for console logs
class ConsoleLogAppender extends LogAppender {
    constructor() {
        super();
    }

    log(arg) {
        if (arg !== undefined) LMlog(`${super.now()}[Log] ${arg}`);
    }
    debug(arg) {
        if (arg !== undefined) LMdebug(`${super.now()}[Debug] ${arg}`);
    }
    info(arg) {
        if (arg !== undefined) LMinfo(`${super.now()}[Info] ${arg}`);
    }
    error(arg) {
        if (arg !== undefined) {
            LMerror(`${super.now()}[Error] ${arg}`);
        }
    }
    warning(arg) {
        if (arg !== undefined) LMwarning(`${super.now()}[Warning] ${arg}`);
    }
    fatal(arg) {
        if (arg !== undefined)
            process.stdout.write(`${super.now()}[Fatal] ${arg}`);
    }
    group(arg) {
        if (arg === undefined) arg = "";
        process.stdout.write(`  ${super.now()} [Group] ${arg}\n`);
    }
    groupEnd() {
        process.stdout.write(`  [End group]\n`);
    }
    startLaunch(arg) {
        if (arg === undefined) arg = "start launch";
        LMlog(`${super.now()}[start launch] ${arg}`);
    }
    startFixture(arg) {
        LMinfo(`${super.now()}[start fixture] ${arg}`);
    }
    startTest(arg) {
        if (arg !== undefined) LMlog(`${super.now()}[start test] ${arg}`);
    }
    finishTest(arg) {
        if (arg !== undefined) LMlog(`${super.now()}[finish test] ${arg}`);
    }
    finishTask(arg) {
        if (arg !== undefined) LMlog(`${super.now()}[finish task] ${arg}`);
    }
    finishLaunch(arg) {
        if (arg !== undefined) LMlog(`${super.now()}[finish launch] ${arg}`);
    }
    addScreenshot(...args) {
        if (args !== undefined) {
            const msg = args[0][0];
            const fileObj = args[0][1];
            LMlog(
                `${super.now()}[add Screenshot] ${msg} ${JSON.stringify(
                    fileObj
                )}`
            );
        }
    }
}

module.exports = ConsoleLogAppender;
