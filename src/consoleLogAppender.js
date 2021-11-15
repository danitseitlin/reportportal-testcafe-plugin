//const LogAppender = require('./logAppender');
//const {LMlog, LMinfo, LMdebug, LMwarning, LMerror, LMgroup, LMgroupEnd} = require('./logMgrSingleton');
const {LogAppender,toJsonString, LMlog, LMinfo, LMdebug, LMwarning, LMerror, LMgroup, LMgroupEnd} = require('./logAppender');


class ConsoleLogAppender extends LogAppender{
    constructor(){
        super();
    }

    log(msg){
        if(msg === undefined) msg="";
        LMlog(super.now()+'[Log] ' + msg);
    }
    debug(msg){
        if(msg === undefined) msg="";
        LMdebug(super.now()+'[Debug] ' + msg);
    }
    info(msg){
        if(msg === undefined) msg="";
        LMinfo(super.now()+'[Info] ' + msg);
    }
    error(msg){
        if(msg === undefined) msg="";
        let fullMsg = super.now()+'[Error] ' + msg;
        LMerror(fullMsg.red);
    }
    fatal(msg){
        if(msg === undefined) msg="";
        LMfatal(super.now()+'[Fatal] ' + msg);
    }
    group(msg){
        if(msg === undefined) msg="";
        LMgroup(super.now()+'[Group] ' + msg);
    }
    groupEnd(msg){
        if(msg === undefined) msg="";
        process.stdout.write('\n GROUP END\n');
        LMgroupEnd(super.now()+'[GroupEnd] ' + msg);
    }
    startLaunch(msg){
        if(msg === undefined) msg="";
        LMinfo(super.now()+'[Info] startLaunch ' + msg);
    }
}

module.exports = ConsoleLogAppender;