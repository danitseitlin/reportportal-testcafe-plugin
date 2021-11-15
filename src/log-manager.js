const LogAppender = require('./log-appender').LogAppender;
const path = require('path'); 
const filename = path.basename(__filename);


class LogManager {
   
    constructor(){
        this._appenders = [];   
        this.overrideConsole();          
    }

    //Add appender that extends LogAppender.
    async addAppenders(...args){  
        try{      
            for(const appender of args){
                if(appender.type && appender.type.prototype instanceof LogAppender){
                    this._appenders.push(await new appender.type(appender));
                }
            }                         
        } catch(e){
            process.stdout.write('Got an exception trying to create appender:' + e);
        }
        const appendersNum = this._appenders.length;  
        process.stdout.write('[' + filename + "]appenders number: " + appendersNum + '\n');
    }

    // append message of type LogActions 
    async appendMsg(msgType, message, args) {
        if(msgType !== undefined){
            if(typeof message === 'object'){
                args = message;
                message = "log";
            }else{
                if(message === undefined) message ="";
            }
            
            for(const appender of this._appenders){
                try{
                    if(appender[msgType] !== undefined)
                        await appender[msgType](message, args);
                }
                catch (error) {  
                    process.stdout.write(`[${filename}]error:${error} \n`); 
                }
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

    async waitForLastMessageResponse(){
        process.stdout.write(`[${filename}]wait for last msg\n`);
        for(const appender of this._appenders){
            await this.waitUntil(()=>appender.isCompleted());  
        }
    }

    async waitUntil(condition) {
        return new Promise((resolve) => {
            let interval = setInterval(() => {
                if (!condition()) {
                    return;
                }
    
                clearInterval(interval);
                resolve();
            }, 100);
        });
    }
}

module.exports = LogManager;

