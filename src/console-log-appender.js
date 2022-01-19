const {
    LMlog,
    LMdebug,
    LMinfo,
    LMwarning,
    LMerror,
    LogAppender,
} = require("./log-appender");
const cliArguments = require("cli-argument-parser").cliArguments;
// responsible for console logs
class ConsoleLogAppender extends LogAppender {
    constructor() {
        super();
    }

    log(arg) {
        if (arg !== undefined) LMlog(` [Log] ${arg}`);
    }
    debug(arg) {
        if (arg !== undefined) LMdebug(` [Debug] ${arg}`);
    }
    info(arg) {
        if (arg !== undefined) LMinfo(` [Info] ${arg}`);
    }
    error(arg) {
        if (arg !== undefined) {
            LMerror(` [Error] ${arg}`);
        }
    }
    warning(arg) {
        if (arg !== undefined) LMwarning(` [Warning] ${arg}`);
    }
    fatal(arg) {
        if (arg !== undefined) process.stdout.write(` [Fatal] ${arg}`);
    }
    group(arg) {
        if (arg === undefined) arg = "";
        if (cliArguments.rSkipGroupInConsole !== "true") {
            process.stdout.write(` [Group] ${arg}\n`);
        }
    }

    groupEnd() {
        if (cliArguments.rSkipGroupInConsole !== "true") {
            process.stdout.write(` [End group]\n`);
        }
    }
    startLaunch(arg) {
        if (arg === undefined) arg = "start launch";
        LMlog(` [start launch] ${arg}`);
    }
    startFixture(arg) {
        LMinfo(` [start fixture] ${arg}`);
    }
    startTest(arg) {
        if (arg !== undefined) LMlog(` [start test] ${arg}`);
    }
    finishTest(arg) {
        if (arg !== undefined) LMlog(` [finish test] ${arg}`);
    }
    finishTask(arg) {
        if (arg !== undefined) LMlog(` [finish task] ${arg}`);
    }
    finishLaunch(arg) {
        if (arg !== undefined) LMlog(` [finish launch] ${arg}`);
    }
    addScreenshot(...args) {
        if (args !== undefined) {
            const msg = args[0][0];
            const fileObj = args[0][1];
            LMlog(` [add Screenshot] ${msg} ${JSON.stringify(fileObj)}`);
        }
    }
}

module.exports = ConsoleLogAppender;
