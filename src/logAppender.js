const path = require('path'); 
const filename = path.basename(__filename);


class LogAppender{
    constructor(){}
    
    now(){
        return  new Date().valueOf();
        //return new Date().toISOString();
    }
    log(msg , args){}
    debug(msg , args){}
    info(msg , args){}
    warning(msg , args){}
    error(msg , args){}
    fatal(msg , args){}
    group(msg , args){}
    groupEnd(msg , args){}
    startFixture(msg , args){}
    startLaunch(msg , args){}
    startSuite(msg , args){}
    startTest(msg , args){}
    finishTest(msg , args){}
    finishTask(msg , args){}
    finishLaunch(msg , args){}
    finishSuite(msg , args){}
}

function parseToJSObj(message){
    let parsedMsg = undefined;
    if(message !== undefined) {
        try{
            //convert to json object
            parsedMsg = JSON.parse(message);
        }
        catch (e) {
            // failed to convert to json object
            process.stdout.write('[' + filename + 'Failed to parse:' + message + '\n');
        }
    }
    return parsedMsg;
}

function toJsonString(message, time, attachment) {
    //convert text into a JavaScript object and then to json string    
    let parsedMsg = undefined;  
    if(message !== undefined) {
        parsedMsg = parseToJSObj(message);
        if(parsedMsg === undefined){
            // failed to convert to json object
            if(typeof message === 'object'){
                parsedMsg = `"${message}"`;
                parsedMsg = LogAppender.parseToJSObj(parsedMsg);
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

module.exports = {
    LogAppender,
    toJsonString,
    LMlog: console.log,
    LMdebug: console.debug,
    LMinfo: console.info,
    LMwarning: console.warn,
    LMerror: console.error,
    LMgroup: console.group,
    LMgroupEnd: console.groupEnd
};