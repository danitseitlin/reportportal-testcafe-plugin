const RPClient = require('./api');
const cliArguments = require('cli-argument-parser').cliArguments;
const LogActions = require('./log-appender').LogActions;
const path = require('path'); 
const filename = path.basename(__filename);

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
        this._itemsIds = [];
        this.launchName = cliArguments.rlaunch;
        this.projectName = cliArguments.rproject;
        if (cliArguments.rsuite) {
            this.suiteName = cliArguments.rsuite;
            this._suiteStatus = 'passed';
        }
        this._queue = [];
        this._waitingForReply = false;
        this._testStatus = "passed";
        this._completedLaunch = false;
    }

    
    
    //Verifying the connection to Report Portal     
    async verifyConnection () {
        try {
            await this.client.checkConnect();
            this.connected = true;
        } 
        catch (error) {
            process.stdout.write('Error connection to the Report Portal server\n');
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
            this._completedLaunch = false;
        }
        else
            this.launch = { id: cliArguments['rlaunch-id'] };
        if (this.suiteName)
            await this._startSuite(this.suiteName, time);
            
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
            this._itemsIds.push({type: "SUITE", id: this.suite.id});
        }
    }

     /**
     * Starting a new test
     * @param {*} name The name of the test
     */
      async _startTest (time, name='START TEST' ) {
        this._testStatus = "passed";
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
            this._itemsIds.push({type: "TEST", id: this.test.id});  
        }
    }

    /**
     * Starting a new step
     * @param {*} name The name of the step
     */
    
    async _startStep (time, name = "'->") {
        const options = {
            launchUuid: this.launch.id,
            name:       name,
            startTime:  time,
            type:       'STEP',
            hasStats:   false
        };

        if(this._itemsIds.length > 0){
            let stepParent = this._itemsIds[this._itemsIds.length-1];
            let step = await this.client.createChildTestItem(this.projectName, stepParent.id, options);
            if(step !== undefined && step.id !== undefined){
                this._itemsIds.push({type: "STEP", id: step.id});
            }
        }
    }

    async _finishStep (time, stepStatus='passed') {
        
        if(this._itemsIds.length > 0){
            const lastItem = this._itemsIds[this._itemsIds.length-1];
            if(lastItem.type == "STEP"){
                process.stdout.write(`[${filename}] finish step. status: ${stepStatus}\n`);
                await this.client.finishTestItem(this.projectName, lastItem.id, {
                    launchUuid: this.launch.id,
                    status:     stepStatus,
                    endTime:    time
                });
                this._itemsIds.pop();
            }
        }
    }

    
    //Finishing a launch
    async _finishLaunch (status, time) {
        if (this.launch.id){
            if(this._suiteStatus === 'failed' || status === 'failed')
                status = 'failed';
            
            if(this.suite !== undefined && this.suite.id !== undefined)
                await this._finishSuite(this.suite.id, status, time);
            process.stdout.write(`[${filename}] finish launch. status: ${status}\n`);
            await this.client.finishLaunch(this.projectName, this.launch.id, { endTime: time });
            this._itemsIds = [];
            this._completedLaunch = true;
        }
    }

   

    /**
     * Finishing a test 
     * @param {*} testId The id of the test 
     * @param {*} status The final status of the test
     */
    
    async _finishTest (status, time) {
        if (status !==undefined){
            this._testStatus = status;
        }
        
        await this._finishNestedSteps(status);
        let item = this._itemsIds[this._itemsIds.length-1];
        if(item.type == 'TEST'){ 
            process.stdout.write(`[${filename}] finish test. status: ${this._testStatus}\n`);
            await this.client.finishTestItem(this.projectName, item.id, {
                launchUuid: this.launch.id,
                status:     this._testStatus,
                endTime:    time
            });
            this._itemsIds.pop();
        }
    }

    async _finishNestedSteps(status){
        while(this._itemsIds.length > 0 && this._itemsIds[this._itemsIds.length-1].type == "STEP"){
            // in case there was an exception inside a group and groupEnd wasnt called.
            await this._finishStep(this.client.now(),status);
        }    
    }
    /**
     * Finishing a suite
     * @param {*} suiteId The id of the suite 
     * @param {*} status The final status of the suite
     */
    
    async _finishSuite (suiteId, status, time) {
        //in case there is steps under suite
        await this._finishNestedSteps(status);
        if(this._itemsIds[this._itemsIds.length-1].type == 'SUITE'){
            process.stdout.write(`[${filename}] finish suite. status: ${status}\n`);
            await this.client.finishTestItem(this.projectName, suiteId, {
                launchUuid: this.launch.id,
                status:     status,
                endTime:    time
            });
            this._itemsIds.pop();
            this.suite = undefined;
            this.suiteName = undefined;
        }
    }

    /**
     * Sending testing logs
     * @param {*} testId The id of the test
     * @param {*} level The level of the log (error/info/waiting, etc.)
     * @param {*} message The contents of the log message
     * @param {*} time The time it was sent/written. Default: current time.
     * @param {*} retry The retry attempts count. Default: 3
     */
    
    async _sendTestLogs (level, time, message='', attachment = undefined, retry = 3) {
        if(this.launch !== undefined && this.launch.id !== undefined){
            let testId = (this._itemsIds.length > 0)?this._itemsIds[this._itemsIds.length-1].id: this.launch.id;
        
            try {    
                    await this.client.sendLog(this.projectName, {
                        itemUuid:   testId,
                        launchUuid: this.launch.id,
                        level:      level,
                        message:    message,
                        time:       time,
                        file:       attachment
                    });
            } 
            catch (error) {
                if(retry - 1 > 0)
                    await this.sendTestLogs(level, message, time, attachment, retry - 1);
                else
                    this.client.handleError(error);
            }
        }
    }

    isCompleted(){
        return this._completedLaunch;
    }

    // all actions are inserted into a queue
    async appendAction(actionType, msg, args){
        if(actionType !== undefined){
            this._queue.push({action:actionType, time:this.client.now(), message:msg, obj:args});
            await this.executeQueue();
        }
    }

    // send actions to reportportal one by one(wait for completion)
    async executeQueue(){
        if(this._queue.length > 0 && this._waitingForReply === false){
            this._waitingForReply = true;
            const item = this._queue.shift();
            
            let actionType = item.action;
            
            switch(actionType){
                case LogActions.LOG:
                case LogActions.DEBUG:
                case LogActions.INFO:
                case LogActions.FATAL:
                    await this._sendTestLogs(actionType, item.time, item.message, item.obj);
                    break;
                case LogActions.ERROR:
                    //this._testStatus = "failed";
                    await this._sendTestLogs(actionType, item.time, item.message, item.obj);
                    break;
                case LogActions.GROUP:
                    await this._startStep(item.time, item.message);
                    break;
                case LogActions.GROUP_END:
                    await this._finishStep(item.time);
                    break;
                case LogActions.START_LAUNCH:
                    await this._startLaunch(item.time);
                    break;
                case LogActions.FINISH_LAUNCH: 
                    await this._finishLaunch(item.message,item.time);  
                    break;
                case LogActions.START_TEST:
                    await this._startTest(item.time, item.message);
                    break;
                case LogActions.FINISH_TEST: 
                    await this._finishTest(item.message,item.time);
                    break;
                case LogActions.START_SUITE:
                    await this._startSuite(item.message,item.time);
                    break;
                default:
                    process.stdout.write(`[${filename}]ERROR: unknown action type: ${actionType}\n`);
                
            }
            this._waitingForReply = false;
            await this.executeQueue();
        }
    }
}

module.exports = ReportPortal;