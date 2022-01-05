const LogAppender = require("./log-appender").LogAppender;
const path = require("path");
const filename = path.basename(__filename);

class LogManager {
    constructor() {
        this._appenders = [];
        this.overrideConsole();
    }

    //Add appender that extends LogAppender.
    async addAppenders(...args) {
        try {
            for (const appenderClass of args) {
                if (
                    appenderClass.type &&
                    appenderClass.type.prototype instanceof LogAppender
                ) {
                    try{
                        const newAppender = await new appenderClass.type(appenderClass);
                        this._appenders.push(newAppender);
                    }
                    catch(e){
                        process.stdout.write(`[${filename}]Got an exception in creating appender:${e}\n`);
                    }
                }
            }
        } catch (e) {
            process.stdout.write(
                "Got an exception trying to create appender:" + e
            );
        }
        const appendersNum = this._appenders.length;
        process.stdout.write(
            "[" + filename + "]appenders number: " + appendersNum + "\n"
        );
    }

    // append message of type LogActions
    async appendMsg(msgType, ...args) {
        if (msgType !== undefined) {
            for (const appender of this._appenders) {
                try {
                    if (appender[msgType] !== undefined)
                        await appender[msgType](args);
                } catch (error) {
                    process.stdout.write(
                        `[${filename}]msgType:${msgType} error:${error} \n`
                    );
                }
            }
        }
    }

    overrideConsole() {
        console.group = this.appendMsg.bind(this, "group");
        console.groupEnd = this.appendMsg.bind(this, "groupEnd");
        console.log = this.appendMsg.bind(this, "log");
        console.debug = this.appendMsg.bind(this, "debug");
        console.info = this.appendMsg.bind(this, "info");
        console.warn = this.appendMsg.bind(this, "warn");
        console.error = this.appendMsg.bind(this, "error");
        //console.assert, console.trace,time,timeEnd??
    }

    async waitForLastMessageResponse() {
        const minToWait = 5;
        process.stdout.write(`[${filename}]wait for last msg\n`);
        for (const appender of this._appenders) {
            await this.waitUntil(() => appender.isCompleted(),60000 * minToWait);
        }
        process.stdout.write(`[${filename}]Finish waiting to appenders to complete \n`);
    }

    async waitUntil(condition, timeout) {
        const intervalTime = 1000;
        let timeWaited = 0;
        return new Promise((resolve) => {
            let interval = setInterval(() => {
                timeWaited += intervalTime;
                if (condition() || timeWaited > timeout) {
                    process.stdout.write(`This is the time we waited ${timeWaited}`);
                    if (timeWaited > timeout) {
                        process.stdout.write(`Timeout has reached ${timeout}`);
                    }
                    clearInterval(interval);
                    resolve();
                }
                return;
            }, intervalTime);
        });
    }
}

module.exports = LogManager;
