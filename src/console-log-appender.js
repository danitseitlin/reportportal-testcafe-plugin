const LogAppender = require('./log-appender').LogAppender;

// responsible for console logs
class ConsoleLogAppender extends LogAppender{
    constructor(){
        super();
    }

    log(msg,obj=''){
        if(msg !== undefined)
            process.stdout.write(`${super.now()}[Log] ${msg} ${obj}\n`);
    }
     debug(msg){
        if(msg !== undefined) 
            process.stdout.write(`${super.now()}[Debug] ${msg}\n`);
    }
     info(msg){
        if(msg !== undefined) 
            process.stdout.write(`${super.now()}[Info] ${msg}\n`);
    }
     error(msg){
        if(msg !== undefined) {
            
            process.stdout.write(`${super.now()}[Error] ${msg}\n`);
        }
    }
     warning(msg){
        if(msg !== undefined)
            process.stdout.write(`${super.now()}[Warning] ${msg}\n`);
    }
     fatal(msg){
        if(msg !== undefined) 
            process.stdout.write(`${super.now()}[Fatal] ${msg}\n`);
    }
     group(msg){
        if(msg !== undefined)
            process.stdout.write(`${super.now()}[Group] ${msg}\n`);
    }
     groupEnd(msg){
        if(msg !== undefined)
            process.stdout.write(`${super.now()}[GroupEnd] ${msg}\n`);
    }
     startLaunch(msg){
        if(msg !== undefined) msg = "start launch";
        process.stdout.write(`${super.now()}[start launch] ${msg}\n`);
    }
     startTest(msg){
        if(msg !== undefined)
            process.stdout.write(`${super.now()}[start test] ${msg}\n`);
    }
     finishTest(msg){
        if(msg !== undefined)
            process.stdout.write(`${super.now()}[finish test] ${msg}\n`);
    }
     finishTask(msg){
        if(msg !== undefined)
            process.stdout.write(`${super.now()}[finish task] ${msg}\n`);
    }
     finishLaunch(msg){
        if(msg !== undefined) 
            process.stdout.write(`${super.now()}[finish launch] ${msg}\n`);
    }
}

module.exports = ConsoleLogAppender;