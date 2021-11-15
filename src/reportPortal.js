const RPClient = require('./api');
const cliArguments = require('cli-argument-parser').cliArguments;
const {LogAppender,toJsonString, LMlog, LMinfo, LMdebug, LMwarning, LMerror, LMgroup, LMgroupEnd} = require('./logAppender');



const actionTypes = {
    LOG: "LOG",
    DEBUG: "DEBUG",
    INFO: "INFO",
    ERROR : "ERROR", 
    FATAL: "FATAL",       
    START_GROUP: "START_GROUP",
    END_GROUP:"END_GROUP",
    START_LAUNCH:"START_LAUNCH",
    END_LAUNCH:"END_LAUNCH",   
    START_TEST:"START_TEST",
    END_TEST:"START_TEST"
};

class ReportPortal { 
    
    
    constructor () {
        process.stdout.write("ReportPortal ctor\n");
        if (!cliArguments.rdomain)
            throw new Error('Missing argument --rdomain');
        if (!cliArguments.rtoken)
            throw new Error('Missing argument --rtoken');
        if (!cliArguments.rlaunch && !cliArguments['rlaunch-id'])
            throw new Error('Missing argument --rlaunch/--rlaunch-id');
        if (!cliArguments.rproject)
            throw new Error('Missing argument --rproject');

        this.client = new RPClient({
            protocol: (cliArguments.rprotocol) ? cliArguments.rprotocol: 'https',
            domain:   cliArguments.rdomain,
            apiPath:  '/api/v1',
            token:    cliArguments.rtoken
        });
        this.connected = true;
        this._parentsIds = [];
        this.launchName = cliArguments.rlaunch;
        this.projectName = cliArguments.rproject;
        if (cliArguments.rsuite) {
            this.suiteName = cliArguments.rsuite;
            this.suiteStatus = 'passed';
        }
        this._queue = [];
        this._waitingForReply = false;
        this._testStatus = "passed";
    }

    
    
    //Verifying the connection to Report Portal     
    async verifyConnection () {
        try {
            await this.client.checkConnect();
            this.connected = true;
        } 
        catch (error) {
            process.stdout.write('Error connection to the Report Portal server');
            console.dir(error);
            this.connected = false;
        }
    }

    
    //Starting a new launch
    async _startLaunch (time) {
        await this.verifyConnection();
        
        if (!this.connected) throw Error('Report portal is not connected!');
        if (this.projectName !== undefined && this.launchName !== undefined) {
            this.launch = await this.client.createLaunch(this.projectName, {
                name:        this.launchName,
                startTime:   time,
                description: `Running ${this.launchName} tests`,
            });
            this._launchEnd = false;
        }
        else
            this.launch = { id: cliArguments['rlaunch-id'] };
        if (this.suiteName)
            await this.startSuite(this.suiteName);
            
    }

    /**
     * Creating a new suite
     * @param {*} name The name of the suite
     */

    async _startSuite (name, time) {            
        this.suite = await this.client.createTestItem(this.projectName, {
            launchUuid: this.launch.id,
            name:       name,
            startTime:  time,
            type:       'SUITE'
        });
        if(this.suite && this.suite.id){
            this._parentsIds.push(this.suite.id);
        }
    }

    /**
     * Starting a new step
     * @param {*} name The name of the step
     */
    
    async _startStep (name = "'->", time) {
        const options = {
            launchUuid: this.launch.id,
            name:       name,
            startTime:  time,
            type:       'STEP',
            hasStats:   false
        };

        if(this._parentsIds.length > 0){
            let stepParent = this._parentsIds[this._parentsIds.length-1];
            let step = await this.client.createChildTestItem(this.projectName, stepParent, options);
            if(step !== undefined && step.id !== undefined){
                this._parentsIds.push(step.id);
            }
        }
    }

    async _finishStep (time) {
        if (this.suiteName && this._testStatus === 'failed')
            this.suiteStatus = 'failed';
        if(this._parentsIds.length > 0){
            let lastParent = this._parentsIds.pop();
            process.stdout.write("[RP] finish step: " + lastParent+'\n');
            await this.client.finishTestItem(this.projectName, lastParent, {
                launchUuid: this.launch.id,
                status:     this._testStatus,
                endTime:    time
            });
        }
    }

    
    //Finishing a launch
    async _finishLaunch (time) {
        if (this.suiteName)
            await this.finishSuite(this.suite.id, this.suiteStatus);
        if (this.launch !== undefined && this.launch.id !== undefined){
            await this.client.finishLaunch(this.projectName, this.launch.id, { endTime: time });
            this._launchEnd = true;
        }
    }

    /**
     * Starting a new test
     * @param {*} name The name of the test
     */
    async _startTest (name="", time) {
        if(this.launch !== undefined && this.launch.id !== undefined){
            const options = {
                launchUuid: this.launch.id,
                name:       name,
                startTime:  time,
                type:       'TEST'
            };

            //Incase the test needs to be under a suite
            if (this.suiteName)
                this.test = await this.client.createChildTestItem(this.projectName, this.suite.id, options);
            else
                this.test = await this.client.createTestItem(this.projectName, options);
            this._parentsIds.push(this.test.id);
        }
    }

    /**
     * Finishing a test 
     * @param {*} testId The id of the test 
     * @param {*} status The final status of the test
     */
    
    async _finishTest (status, time) {
        if (this.suiteName && this._testStatus === 'failed')
            this.suiteStatus = 'failed';
        let testId = this._parentsIds.pop();
        process.stdout.write("[RP] send finish test request\n");
        await this.client.finishTestItem(this.projectName, testId, {
            launchUuid: this.launch.id,
            status:     this._testStatus,
            endTime:    time
        });
    }

    /**
     * Finishing a suite
     * @param {*} suiteId The id of the suite 
     * @param {*} status The final status of the suite
     */
    
    async _finishSuite (suiteId, status, time) {
        await this.client.finishTestItem(this.projectName, suiteId, {
            launchUuid: this.launch.id,
            status:     status,
            endTime:    time
        });
        this._parentsIds.pop();
    }

    /**
     * Sending testing logs
     * @param {*} testId The id of the test
     * @param {*} level The level of the log (error/info/waiting, etc.)
     * @param {*} message The contents of the log message
     * @param {*} time The time it was sent/written. Default: current time.
     * @param {*} retry The retry attempts count. Default: 3
     */
    
    async _sendTestLogs (level, message='', time, attachment = undefined, retry = 3) {
        try {
            //process.stdout.write('['+filename+']enter reportPortal.sendTestLogs: '+message+'\n');
            if(this.launch !== undefined && this.launch.id !== undefined){
                let testId = (this._parentsIds.length > 0)?this._parentsIds[this._parentsIds.length-1]: this.launch.id;
            
                await this.client.sendLog(this.projectName, {
                    itemUuid:   testId,
                    launchUuid: this.launch.id,
                    level:      level,
                    message:    message,
                    time:       time,
                    file:       attachment
                });
            }
        } 
        catch (error) {
            if(retry - 1 > 0)
                await this.sendTestLogs(testId, level, message, time, attachment, retry - 1);
            else
                this.client.handleError(error);
        }
    }

    
    appendAction(actionType, msg='', args){
        if(actionType !== undefined){
            this._queue.push({action:actionType, time:this.client.now(), message:msg, obj:args});
            this.executeQueue();
        }
    }

    async executeQueue(){
        if(this._queue.length > 0 && this._waitingForReply === false){
            this._waitingForReply = true;
            const item = this._queue.shift();
            
            const actionType = item["action"];
            
            switch(actionType){
                case LogAppender.prototype.log.name:
                case LogAppender.prototype.debug.name:
                case LogAppender.prototype.info.name:
                case LogAppender.prototype.error.name:
                case LogAppender.prototype.fatal.name:        
                    await this._sendTestLogs(actionType, item["message"], item["time"], item["obj"]);
                    break;
                case LogAppender.prototype.group.name:
                    await this._startStep(item["message"], item["time"]);
                    break;
                case LogAppender.prototype.groupEnd.name:
                    await this._finishStep(item["time"]);
                    break;
                case LogAppender.prototype.startLaunch.name:
                    await this._startLaunch(item["time"]);
                    break;
                case LogAppender.prototype.finishLaunch.name: 
                    await this._finishLaunch(item["time"]);  
                    break;
                case LogAppender.prototype.startTest.name:
                    await this._startTest(item["message"],item["time"]);
                    break;
                case LogAppender.prototype.finishTest.name: 
                    await this._finishTest(item["message"],item["time"]);
                    break;
                case LogAppender.prototype.startSuite.name:
                    await this._startSuite(item["message"],item["time"]);
                    break;
                default:
                    process.stdout.write('ERROR: unknown action type: ' + actionType +'\n');
                
            }
            this._waitingForReply = false;
            this.executeQueue();
        }
    }
}

module.exports = ReportPortal;