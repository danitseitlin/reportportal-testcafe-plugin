/* eslint-disable no-console */
/* eslint-disable no-undefined */
const RPClient = require('./api');
const cliArguments = require('cli-argument-parser').cliArguments;
const filterArguments = require('cli-argument-parser').filterArguments;

class ReportPortal { 
    constructor () {
        if (!cliArguments.rdomain)
            throw new Error('Missing argument --rdomain');
        if (!cliArguments.rtoken)
            throw new Error('Missing argument --rtoken');
        if (!cliArguments.rlaunch && !cliArguments['rlaunch-id'])
            throw new Error('Missing argument --rlaunch/--rlaunch-id');
        if (!cliArguments.rproject)
            throw new Error('Missing argument --rproject');

        this.liveReporting = filterArguments('--', '')['disable-live-reporting'] === undefined;
        this.client = new RPClient({
            protocol: (cliArguments.rprotocol) ? cliArguments.rprotocol: 'https',
            domain:   cliArguments.rdomain,
            apiPath:  '/api/v1',
            token:    cliArguments.rtoken,
        });
        this.connected = true;
        this.launchName = cliArguments.rlaunch;
        this.projectName = cliArguments.rproject;
        if (cliArguments.rsuite) {
            this.suiteName = cliArguments.rsuite;
            this.suiteStatus = 'passed';
        }
    }

    /**
     * Verifying the connection to Report Portal
     */
    async verifyConnection () {
        try {
            await this.client.checkConnect();
            this.connected = true;
        } 
        catch (error) {
            console.log('Error connection to the Report Portal server');
            console.dir(error);
            this.connected = false;
        }
    }

    /**
     * Starting a new launch
     */
    async startLaunch () {
        await this.verifyConnection();
        if (!this.connected) throw Error('Report portal is not connected!');
        if (this.launchName) {
            this.launch = await this.client.createLaunch(this.projectName, {
                name:        this.launchName,
                startTime:   this.client.now(),
                description: `Running ${this.launchName} tests`,
            });
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
    async startSuite (name) {
        this.suite = await this.client.createTestItem(this.projectName, {
            launchUuid: this.launch.id,
            name:       name,
            startTime:  this.client.now(),
            type:       'SUITE'
        });
    }

    /**
     * Finishing a launch
     */
    async finishLaunch () {
        if (this.suiteName)
            await this.finishSuite(this.suite.id, this.suiteStatus);
        if (this.launchName)
            await this.client.finishLaunch(this.projectName, this.launch.id, { endTime: this.client.now() });
    }

    /**
     * Starting a new test
     * @param {*} name The name of the test
     */
    async startTest (name) {
        const options = {
            launchUuid: this.launch.id,
            name:       name,
            startTime:  this.client.now(),
            type:       'TEST'
        };

        //Incase the test needs to be under a suite
        if (this.suiteName)
            this.test = await this.client.createChildTestItem(this.projectName, this.suite.id, options);
        else
            this.test = await this.client.createTestItem(this.projectName, options);
    }

    /**
     * Finishing a test 
     * @param {*} testId The id of the test 
     * @param {*} status The final status of the test
     */
    async finishTest (testId, status) {
        if (this.suiteName && status === 'failed')
            this.suiteStatus = 'failed';

        await this.client.finishTestItem(this.projectName, testId, {
            launchUuid: this.launch.id,
            status:     status,
            endTime:    this.client.now()
        });
    }

    /**
     * Finishing a suite
     * @param {*} suiteId The id of the suite 
     * @param {*} status The final status of the suite
     */
    async finishSuite (suiteId, status) {
        await this.client.finishTestItem(this.projectName, suiteId, {
            launchUuid: this.launch.id,
            status:     status,
            endTime:    this.client.now()
        });
    }

    /**
     * Sending testing logs
     * @param {*} testId The id of the test
     * @param {*} level The level of the log (error/info/waiting, etc.)
     * @param {*} message The contents of the log message
     * @param {*} time The time it was sent/written. Default: current time.
     * @param {*} retry The retry attempts count. Default: 3
     */
    async sendTestLogs (testId, level, message, time = this.client.now(), attachment, retry = 3) {
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
                await this.sendTestLogs(testId, level, message, time, attachment, retry - 1)
            else
                this.client.handleError(error);
        }
    }
}

module.exports = ReportPortal;
