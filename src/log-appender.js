const path = require('path'); 
const filename = path.basename(__filename);
const Convert = require('ansi-to-html');

// known actions
const LogActions = {
    LOG: "log",
    DEBUG: "debug",
    INFO: "info",
    WARNING: "warning",
    ERROR: "error",
    FATAL: "fatal",
    GROUP: "group",
    GROUP_END: "groupEnd",
    START_FIXTURE: "startFixture",
    START_LAUNCH: "startLaunch",
    START_SUITE: "startSuite",
    START_TEST: "startTest",
    FINISH_TEST: "finishTest",
    FINISH_TASK: "finishTask",
    FINISH_LAUNCH: "finishLaunch",
    FINISH_SUITE: "finishSuite"
};

//base class. Appenders should extend it and add their different implementation
class LogAppender{
    constructor(){}
    
    now(){
        return new Date().toISOString();
    }
    log(){}
    debug(){}
    info(){}
    warning(){}
    error(){}
    fatal(){}
    group(){}
    groupEnd(){}
    startFixture(){}
    startLaunch(){}
    startSuite(){}
    startTest(){}
    finishTest(){}
    finishTask(){}
    finishLaunch(){}
    finishSuite(){}
    isCompleted(){return true;}
}

function parseToJSObj(message){
    let parsedMsg;
    if(message !== undefined) {
        try{
            //convert to json object
            parsedMsg = JSON.parse(message);
        }
        catch (e) {
            // failed to convert to json object
            process.stdout.write(`[${filename} ! didnt parse: ${message}\n`);
        }
    }
    return parsedMsg;
}

function toJsonString(message) {
    //convert text into a JavaScript obtimeject and then to json string    
    let parsedMsg;  
    if(message !== undefined) {
        parsedMsg = parseToJSObj(message);
        if(parsedMsg === undefined){
            // failed to convert to json object
            if(typeof message === 'object'){
                parsedMsg = `"${message}"`;
                parsedMsg = parseToJSObj(parsedMsg);
            } else {
                parsedMsg = message;
            }
        }
        if(parsedMsg !== undefined){
            try{
                //convert javascript objects into json string
                parsedMsg = JSON.stringify(parsedMsg);
            }
            catch(e){
                process.stdout.write('ERROR convering to json string: ' + message);
                parsedMsg = undefined;
            }
        }
         
    }
    return parsedMsg;
}

// revert Ansi message to Html message
function   revertAnsiToHtml(ansiMsg){
    const htmlMsg = new Convert({
        fg: '#006',
        bg: '#EEE'}).toHtml(ansiMsg);
    return htmlMsg;             
}

module.exports = {
    LogAppender,
    toJsonString,
    LogActions,
    revertAnsiToHtml
    //LMlog: console.log,
    //LMdebug: console.debug,
    //LMinfo: console.info,
    //LMwarning: console.warn,
    //LMerror: console.error,
    //LMgroup: console.group,
    //LMgroupEnd: console.groupEnd
};