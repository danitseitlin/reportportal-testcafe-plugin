const ReportPortal = require('./report-portal');
const {LogAppender,toJsonString, LogActions, revertAnsiToHtml} = require('./log-appender');

// appender for reportportal
class ReportPortalAppender extends LogAppender {
    constructor () {
        super();
        this.reporter = new ReportPortal();
    }
    now(){
        return  new Date().valueOf();
    }
    async log(msg, args){
        await this.reporter.appendAction(LogActions.LOG, msg, args);
    }
    async debug(msg, args){
        await this.reporter.appendAction(LogActions.DEBUG, msg, args);
    }
    async info(msg, args){
        await this.reporter.appendAction(LogActions.INFO, msg, args);
    }
    async error(msg, args){
        if(msg !== undefined){  
            await this.reporter.appendAction(LogActions.ERROR, revertAnsiToHtml(msg), args);
        }
    }
    async fatal(msg, args){
        await this.reporter.appendAction(LogActions.FATAL, msg, args);
    }
    async group(msg, args){
        let parsedMsg = toJsonString(msg);
        if(parsedMsg !== undefined)
        await this.reporter.appendAction(LogActions.GROUP, msg, args);            
    }
    async groupEnd(msg, args){
        await this.reporter.appendAction(LogActions.GROUP_END, msg, args);
    }
    async startFixture(){}
    
    async startLaunch(msg){
         await this.reporter.appendAction(LogActions.START_LAUNCH, msg);
    }
    async startTest(msg , args){
        await this.reporter.appendAction(LogActions.START_TEST, msg, args);
    }
    async finishTest(msg , args){
        await this.reporter.appendAction(LogActions.FINISH_TEST, msg, args);
    }
    async finishTask(msg , args){
        await this.reporter.appendAction(LogActions.FINISH_TASK, msg, args);
    }
    async finishLaunch(msg , args){
        await this.reporter.appendAction(LogActions.FINISH_LAUNCH, msg, args);
    }
    isCompleted(){
        return this.reporter.isCompleted();
    }
}

module.exports =  ReportPortalAppender;