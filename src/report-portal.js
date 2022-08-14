const RPClient = require("./api");
const { LMdebug, LogActions } = require("./log-appender");
const path = require("path");
const filename = path.basename(__filename);

const {rtoken: cliRtoken, rproject: cliRproject, rlaunch: cliRlaunch,
   rdomain: cliRdomain,["rlaunch-id"]: cliRlaunchId, rsuite: cliRsuite,
   rdebug: cliRdebug, rprotocol: cliProtocol} = require("cli-argument-parser").cliArguments;
const rprotocol = cliProtocol || 'https';

const isLocalUser = cliRproject.toUpperCase().includes("PERSONAL");
const STATUS_PASSED = 'passed';
const STATUS_FAILED = 'failed';

class ReportPortal {
  
  constructor() {
    process.stdout.write("ReportPortal ctor\n");
    this.initReportPortalArguments();
    this.connected = true;
    this._itemsIds = []; //stack of parents

    if (cliRsuite){
      this.suiteName = cliRsuite;
      this._suiteStatus = STATUS_PASSED;
    }

    this._fixture = undefined;
    this._debug = cliRdebug === "true" ? true : false;
    this._queue = []; //msgs queue
    this._waitingForReply = false;
    this._testStatus = STATUS_PASSED;
    this._completedLaunch = false;
    this.client = new RPClient({
      protocol: rprotocol,
      domain: cliRdomain,
      apiPath: "/api/v1",
      //synchronous api
      token: this.rtoken
    }, this._debug);
  } //Verifying the connection to Report Portal

    async verifyConnection() {
        try {
            await this.client.checkConnect();
            this.connected = true;
        } catch (error) {
            process.stdout.write(
                "Error connection to the Report Portal server\n"
            );
            console.dir(error);
            this.connected = false;
        }
    }

    //Starting a new launch
    async _startLaunch(time) {
        await this.verifyConnection();
        if (!this.connected) throw Error("Report portal is not connected!");
        if (this.projectName !== undefined && this.launchName !== undefined) {
            this.launch = await this.client.createLaunch(this.projectName, {
                name: this.launchName,
                startTime: time,
                description: `Running ${this.launchName} tests`,
            });
            this._completedLaunch = false;
        } else
            this.launch = {
                id: this.rlaunchId,
            };

        if (isLocalUser) this.addLinkToLaunchReport();

        // Adding suite with the attributes
        const launchAttributes = await this.client.getLaunchAttributes(
            this.projectName,
            this.launch.id
        );
        const FFaddingLaunchInfo = false;

        if (FFaddingLaunchInfo) {
            if (launchAttributes.length > 0) {
                const suiteDescription = `
            ${launchAttributes.map((attr) => {
                return `* ${attr.key}: ${attr.value} \n`;
            })}
          `.replace(/\n,/g, "\n");
                const launchInfoSuite = await this.client.createTestItem(
                    this.projectName,
                    {
                        launchUuid: this.launch.id,
                        name: "Launch Info:",
                        startTime: time,
                        description: suiteDescription,
                        type: "SUITE",
                    }
                );
                await this.client.finishTestItem(
                    this.projectName,
                    launchInfoSuite.id,
                    {
                        launchUuid: this.launch.id,
                        status: STATUS_PASSED,
                        endTime: time,
                    }
                );
            }
        }

        this._itemsIds.push({
            type: "LAUNCH",
            id: this.launch.id,
        });

        if (this._debug == true)
            process.stdout.write(
                `\n[${filename}]startLaunch id:${this.launch.id}\n`
            );
        if (this.suiteName) await this._startSuite(this.suiteName, time);
    }
    /**
     * Creating a new suite
     * @param {*} name The name of the suite
     */

    async _startSuite(name, time) {
        this.suite = await this.client.createTestItem(this.projectName, {
            launchUuid: this.launch.id,
            name: name,
            startTime: time,
            type: "SUITE",
        });
        if (this.suite && this.suite.id) {
            this._itemsIds.push({
                type: "SUITE",
                id: this.suite.id,
            });
        }
        if (this._debug == true)
            process.stdout.write(
                `\n[${filename}]launch ${this.launch.id} startSuite ${this.suite.id}  \n`
            );
    }

    async _startFixturePreTest(time, name = "Before Test") {
        //need to close former fixture
        await this._finishFixture(time);

        if (this.launch !== undefined && this.launch.id !== undefined) {
            const options = {
                launchUuid: this.launch.id,
                name: name,
                startTime: time,
                type: "before_test",
            };
            if (this.suiteName)
                this._fixture = await this.client.createChildTestItem(
                    this.projectName,
                    this.suite.id,
                    options
                );
            else
                this._fixture = await this.client.createTestItem(
                    this.projectName,
                    options
                );

            this._itemsIds.push({
                type: "FIXTURE",
                id: this._fixture.id,
            });

            if (this._debug == true)
                process.stdout.write(
                    `\n[${filename}] startFixturePreTest ${this._fixture.id} \n`
                );
        }
    }
    /**
     * Starting a new test
     * @param {*} name The name of the test
     */
    async _startTest(time, name = "START TEST") {
        //need to close former fixture
        await this._finishFixture(time);
        this._testStatus = STATUS_PASSED;
        if (this.launch !== undefined && this.launch.id !== undefined) {
            const options = {
                launchUuid: this.launch.id,
                name: name,
                startTime: time,
                type: "STEP",
            };

            //Incase the test needs to be under a suite
            if (this.suiteName)
                this.test = await this.client.createChildTestItem(
                    this.projectName,
                    this.suite.id,
                    options
                );
            else
                this.test = await this.client.createTestItem(
                    this.projectName,
                    options
                );
            this._itemsIds.push({
                type: "STEP",
                id: this.test.id,
                isTest: true,
            });
            if (this._debug == true)
                process.stdout.write(
                    `\n[${filename}] startTest ${this.test.id} \n`
                );
        }
    }
    /**
     * Starting a new step
     * @param {*} name The name of the step
     */

    async _startStep(time, name = "'->") {
        // Adding gaurd of the length of the group name (on overflow, it will break the launch report)
        if (name.length > 120) {
            name = name.substring(0, 120);
        }
        const options = {
            launchUuid: this.launch.id,
            name: name,
            startTime: time,
            type: "STEP",
            hasStats: false,
        };
        const stepParent = this.getLastItem();
        if (stepParent) {
            let step = await this.client.createChildTestItem(
                this.projectName,
                stepParent.id,
                options
            );
            if (step !== undefined && step.id !== undefined) {
                this._itemsIds.push({
                    type: "STEP",
                    id: step.id,
                });

                if (this._debug == true)
                    process.stdout.write(
                        `\n[${filename}] startStep ${step.id}\n`
                    );
            }
        }
    }

    async _finishStep(time, stepStatus = "passed") {
        const lastItem = this.getLastItem();
        if (lastItem) {
            if (lastItem.type == "STEP") {
                if (this._debug == true)
                    process.stdout.write(
                        `\n[${filename}] finish step. status: ${stepStatus}\n`
                    );
                await this.client.finishTestItem(
                    this.projectName,
                    lastItem.id,
                    {
                        launchUuid: this.launch.id,
                        status: stepStatus,
                        endTime: time,
                    }
                );
                this._itemsIds.pop();
            }
        }
    }

    async _finishFixture(time) {
        //close all open steps if exist
        if (this._fixture) {
            this.fxStatus = await this._checkFixtureStatus();
            await this._finishNestedSteps(this.fxStatus);
            const lastItem = this.getLastItem();

            if (lastItem.type == "FIXTURE") {
                if (this._debug == true)
                    process.stdout.write(
                        `\n[${filename}] finish fixture ${lastItem.id} \n`
                    );
                await this.client.finishTestItem(
                    this.projectName,
                    lastItem.id,
                    {
                        launchUuid: this.launch.id,
                        status: this.fxStatus,
                        endTime: time,
                    }
                );
                this._itemsIds.pop();
                this._fixture = undefined;
            }
        }
    }
    //set status of a fixture based on Error existance in the queue
    async _checkFixtureStatus() {
        try{
            if(this._queue[0] && this._queue[0].action==='error'){
                return STATUS_FAILED;
            }
          }
          catch(error){
            if (this._debug == true) process.stdout.write(`\n[${filename}] Error in getting Fixture status from queue\n`);
        }
        return STATUS_PASSED;
    }

    //Finishing a launch
    async _finishLaunch(status, time) {
        await this._finishFixture(time);

        if (this.suiteName) {
            if (this._suiteStatus === STATUS_FAILED || status === STATUS_FAILED)
                status = STATUS_FAILED;
            if (this.suite !== undefined && this.suite.id !== undefined)
                await this._finishSuite(this.suite.id, status, time);
        }
        if (this.launchName) {
            if (this._debug == true)
                process.stdout.write(
                    `\n[${filename}] finishLaunch. status: ${status}\n`
                );
            await this.client.finishLaunch(this.projectName, this.launch.id, {
                endTime: time,
            });
        }

        if (isLocalUser) this.addLinkToLaunchReport();

        this._itemsIds = [];
        this._completedLaunch = true;
    }
    /**
     * Finishing a test
     * @param {*} testId The id of the test
     * @param {*} status The final status of the test
     */

    async _finishTest(status, time) {
        if (status !== undefined) {
            this._testStatus = status;
        }

        await this._finishNestedSteps(status);
        let item = this.getLastItem();
        if (item && item.isTest) {
            if (this._debug == true)
                process.stdout.write(
                    `\n[${filename}] finish test ${item.id}. status: ${this._testStatus}\n`
                );
            await this.client.finishTestItem(this.projectName, item.id, {
                launchUuid: this.launch.id,
                status: this._testStatus,
                endTime: time,
            });
            this._itemsIds.pop();
        }
    }

    async _finishNestedSteps(status) {
        while (
            this._itemsIds.length > 0 &&
            this._itemsIds[this._itemsIds.length - 1].type == "STEP" &&
            !this._itemsIds[this._itemsIds.length - 1].isTest
        ) {
            // in case there was an exception inside a group and groupEnd wasnt called.
            await this._finishStep(this.client.now(), status);
            LMdebug("note: closing nested step by reportportal");
        }
    }
    /**
     * Finishing a suite
     * @param {*} suiteId The id of the suite
     * @param {*} status The final status of the suite
     */

    async _finishSuite(suiteId, status, time) {
        //in case there is steps under suite
        await this._finishNestedSteps(status);
        await this._finishFixture(time);
        if (this._itemsIds[this._itemsIds.length - 1].type == "SUITE") {
            if (this._debug == true)
                process.stdout.write(
                    `\n[${filename}] finish suite. status: ${status}\n`
                );
            await this.client.finishTestItem(this.projectName, suiteId, {
                launchUuid: this.launch.id,
                status: status,
                endTime: time,
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

    async _sendTestLogs(
        level,
        time,
        message = "",
        attachment = undefined,
        retry = 3
    ) {
        if (this.launch !== undefined && this.launch.id !== undefined) {
            const lastItem = this.getLastItem();
            let lastItemId =
                lastItem && lastItem.id ? lastItem.id : this.launch.id;
            try {
                await this.client.sendLog(this.projectName, {
                    itemUuid: lastItemId,
                    launchUuid: this.launch.id,
                    level: level,
                    message: message,
                    time: time,
                    file: attachment,
                });
            } catch (error) {
                if (retry - 1 > 0)
                    await this._sendTestLogs(
                        level,
                        message,
                        time,
                        attachment,
                        retry - 1
                    );
                else this.client.handleError(error);
            }
        }
    }

    getLastItem() {
        if (this._itemsIds.length > 0)
            return this._itemsIds[this._itemsIds.length - 1];
        return undefined;
    }

    isCompleted() {
        return this._completedLaunch;
    }

    // all actions are inserted into a queue
    async appendAction(actionType, msg, fileobj) {
        if (actionType !== undefined) {
            this._queue.push({
                action: actionType,
                time: this.client.now(),
                message: msg,
                obj: fileobj,
            });
            await this.executeQueue();
        }
    }

    // send actions to reportportal one by one(wait for completion)
    async executeQueue() {
        if (this._queue.length > 0 && this._waitingForReply === false) {
            this._waitingForReply = true;
            const item = this._queue.shift();

            switch (item.action) {
                case LogActions.LOG:
                    await this._sendTestLogs("debug", item.time, item.message);
                    break;
                case LogActions.DEBUG:
                    await this._sendTestLogs("debug", item.time, item.message);
                    break;
                case LogActions.INFO:
                    await this._sendTestLogs("info", item.time, item.message);
                    break;
                case LogActions.WARNING:
                    await this._sendTestLogs("warn", item.time, item.message);
                    break;
                case LogActions.FATAL:
                    await this._sendTestLogs("fatal", item.time, item.message);
                    break;
                case LogActions.ERROR:
                    await this._sendTestLogs("error", item.time, item.message);
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
                    await this._finishLaunch(item.message, item.time);
                    break;
                case LogActions.START_FIXTURE:
                    await this._startFixturePreTest(item.time, item.message);
                    break;
                case LogActions.START_TEST:
                    await this._startTest(item.time, item.message);
                    break;
                case LogActions.FINISH_TEST:
                    await this._finishTest(item.message, item.time);
                    break;
                case LogActions.START_SUITE:
                    await this._startSuite(item.message, item.time);
                    break;
                case LogActions.ADD_SCREENSHOT:
                    await this._sendTestLogs(
                        "debug",
                        item.time,
                        item.message,
                        item.obj
                    );
                    break;
                default:
                    process.stdout.write(
                        `\n[${filename}]ERROR: unknown action type: ${actionType}\n`
                    );
            }
            this._waitingForReply = false;
            await this.executeQueue();
        }
    }

    initReportPortalArguments(){
        const {rtoken: envRtoken, rproject: envRproject, rdomain: envRdomain, rlaunch_id: envRlaunchId} = process.env;
      
        this.rtoken = cliRtoken || envRtoken;
        if (!this.rtoken) throw new Error("Missing argument --rtoken");
      
        this.projectName = cliRproject || envRproject;
        if (!this.projectName) throw new Error("Missing argument --rproject");
      
        this.rdomain = cliRdomain || envRdomain;
        if (!this.rdomain) throw new Error("Missing argument --rdomain");
      
        this.rlaunchId = cliRlaunchId || envRlaunchId;
        if (!cliRlaunch && !this.rlaunchId)
            throw new Error("Missing argument --rlaunch/--rlaunch-id");
      
        this.launchName = cliRlaunch;
        this.rpojectName = cliRproject;
    }

    addLinkToLaunchReport() {
        process.stdout.write(
          `Report portal launch --> \x1b[34m${rprotocol}://${cliRdomain}/ui/#${cliRproject}/launches/all/${this.launch.id}\x1b[39m \n`
      );
    }

}

module.exports = ReportPortal;