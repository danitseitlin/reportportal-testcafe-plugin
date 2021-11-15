const ReportPortal = require('./reportPortal');
const {LogAppender,toJsonString, LMlog, LMinfo, LMdebug, LMwarning, LMerror, LMgroup, LMgroupEnd} = require('./logAppender');


class ReportPortalAppender extends LogAppender {
    constructor () {
        super() 
        this.reporter = new ReportPortal();
    }
    
    log(msg, args){
        this.reporter.appendAction(LogAppender.prototype.log.name, msg, args);
        //await this.reporter["sendTestLogs"]( 'log', msg, LogAppender.now());
    }
    debug(msg, args){
        this.reporter.appendAction(LogAppender.prototype.debug.name, msg, args);
        //(async() => await this.reporter["sendTestLogs"]( 'debug', msg, LogAppender.now()))();
    }
    info(msg, args){
        this.reporter.appendAction(LogAppender.prototype.info.name, msg, args);
    }
    error(msg, args){
        this.reporter.appendAction(LogAppender.prototype.error.name, msg, args);
    }
    fatal(msg, args){
        this.reporter.appendAction(LogAppender.prototype.fatal.name, msg, args);
    }
    group(msg, args){
        let parsedMsg = toJsonString(msg);
        if(parsedMsg !== undefined)
            this.reporter.appendAction(LogAppender.prototype.group.name, msg, args);            
    }
    groupEnd(msg, args){
        this.reporter.appendAction(LogAppender.prototype.groupEnd.name, msg, args);
        //(async() => await this.reporter["finishStep"]("success"))();
    }
    startFixture(msg , args){}
    
    startLaunch(msg , args){
        this.reporter.appendAction(LogAppender.prototype.startLaunch.name, args);
    }
    startTest(msg , args){
        this.reporter.appendAction(LogAppender.prototype.startTest.name, msg, args);
    }
    finishTest(msg , args){
        this.reporter.appendAction(LogAppender.prototype.finishTest.name, msg, args);
    }
    finishTask(msg , args){
        this.reporter.appendAction(LogAppender.prototype.finishTask.name, msg, args);
    }
    finishLaunch(msg , args){
        this.reporter.appendAction(LogAppender.prototype.finishLaunch.name);
    }
    
}

module.exports =  ReportPortalAppender;