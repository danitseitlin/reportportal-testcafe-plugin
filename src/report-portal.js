const RPClient = require('./api');
const Arguments = require('cli-argument-parser').cliArguments;

class ReportPortal { 
    constructor () {
        if (!Arguments.rdomain)
            throw new Error('Missing argument --rdomain');
        if (!Arguments.rtoken)
            throw new Error('Missing argument --rtoken');
        if (!Arguments.rlaunch)
            throw new Error('Missing argument --rlaunch');
        if (!Arguments.rproject)
            throw new Error('Missing argument --rproject');
        this.client = new RPClient({
            protocol: 'https',
            domain:   Arguments.rdomain,
            apiPath:  '/api/v1',
            token:    Arguments.rtoken,
        });
        this.connected = true;
        this.client.checkConnect().then(() => {
            this.connected = true;
        }, (error) => {
            console.log('Error connection to the Report Portal server');
            console.dir(error);
            this.connected = false;
        });
        this.launchName = Arguments.rlaunch;
        this.projectName = Arguments.rproject;
        if (Arguments.rsuite) {
            this.suiteName = Arguments.rsuite;
            this.suiteStatus = 'passed';
        }
    }

    async startLaunch () {
        if (!this.connected) throw Error('Report portal is not connected!');
        this.launch = await this.client.createLaunch(this.projectName, {
            name:        this.launchName,
            startTime:   this.client.now(),
            description: `Running ${this.launchName} tests`,
        });
        if (this.suiteName)
            await this.startSuite(this.suiteName);
    }

    async startSuite (name) {
        this.suite = await this.client.createTestItem(this.projectName, {
            launchUuid: this.launch.id,
            name:       name,
            startTime:  this.client.now(),
            type:       'SUITE'
        });
    }

    async finishLaunch () {
        if (this.suiteName)
            await this.finishSuite(this.suite.id, this.suiteStatus);
        await this.client.finishLaunch(this.projectName, this.launch.id, {
            endTime: this.client.now()
        });
    }

    async startTest (name) {
        const options = {
            launchUuid: this.launch.id,
            name:       name,
            startTime:  this.client.now(),
            type:       'TEST'
        };

        if (this.suiteName)
            this.curTest = await this.client.createChildTestItem(this.projectName, this.suite.id, options);
        else
            this.curTest = await this.client.createTestItem(this.projectName, options);
    }

    async finishTest (testId, status) {
        if (this.suiteName && status === 'failed')
            this.suiteStatus = 'failed';

        await this.client.finishTestItem(this.projectName, testId, {
            launchUuid: this.launch.id,
            status:     status,
            endTime:    this.client.now()
        });
    }

    async finishSuite (suiteId, status) {
        await this.client.finishTestItem(this.projectName, suiteId, {
            launchUuid: this.launch.id,
            status:     status,
            endTime:    this.client.now()
        });
    }

    async sendTestLogs (testId, level, message, time = this.client.now()) {
        await this.client.sendLog(this.projectName, {
            itemUuid:   testId,
            launchUuid: this.launch.id,
            level:      level,
            message:    message,
            time:       time
        });
    }
}

module.exports = ReportPortal;
