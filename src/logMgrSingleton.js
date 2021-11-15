const {LogAppender,toJsonString, LMlog, LMinfo, LMdebug, LMwarning, LMerror, LMgroup, LMgroupEnd} = require('./logAppender');
const path = require('path'); 
const filename = path.basename(__filename);


class LogMgrSingleton {
   
    constructor(){
        if(! LogMgrSingleton.instance){
            this._appenders = [];
            LogMgrSingleton.instance = this;  
            this.overrideConsole();          
        }
    }

    async addAppenders(...args){  
        try{      
            for(const appender of args){
                if(appender["type"] && appender["type"].prototype instanceof LogAppender){
                    this._appenders.push(await new appender["type"](appender));
                }
            }                         
        } catch(e){
            process.stdout.write('Got an exception trying to create appender:' + e);
        }
        const appendersNum = this._appenders.length;  
        process.stdout.write('[' + filename + "]appenders number: " + appendersNum + '\n');
    }

    appendMsg(level, message, args) {
        message = message || ""; 
        for(const appender of this._appenders){
            try{
                if(appender[level] !== undefined)
                    appender[level](message, args);
            }
            catch (error) {  
                process.stdout.write("unknow level: " + level); 
                //process.stdout.write(`\n[Test ${testId}] Sending log: ${message} \n caused error: ${error} \n`);
                throw new Error("unknow level: " + level); 
            }
        }
    }

    overrideConsole(){
        console.log = this.appendMsg.bind(this,"log");
        console.debug = this.appendMsg.bind(this,"debug");
        console.info = this.appendMsg.bind(this,"info");
        console.warn = this.appendMsg.bind(this,"warn");
        console.error = this.appendMsg.bind(this,"error");
        console.group = this.appendMsg.bind(this,"group");
        console.groupEnd = this.appendMsg.bind(this,"groupEnd");       
    }
    
}

module.exports = LogMgrSingleton;

