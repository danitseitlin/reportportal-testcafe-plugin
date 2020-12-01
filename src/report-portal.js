const RPClient = require('reportportal-js-client');
const Arguments = require('cli-argument-parser').cliArguments;

class ReportPortal { 
    constructor () {
        console.log(Arguments);
        this.client = new RPClient({
            token:    Arguments.rtoken,
            endpoint: `https://${Arguments.rdomain}/api/v1`,
            launch:   Arguments.rlaunch,
            project:  Arguments.rproject,
        });
        this.connected = true;
        this.client.checkConnect().then((response) => {
            this.connected = true;
            console.log('You have successfully connected to the server.');
            console.log(`You are using an account: ${response.fullName}`);
        }, (error) => {
            console.log('Error connection to server');
            console.dir(error);
            this.connected = false;
        });
        console.log(this.connected);
        console.log(Arguments);
        this.launchName = Arguments.rlaunch;
        this.projectName = Arguments.rproject;
    }

    async connect () {
        this.client.checkConnect().then((response) => {
            this.connected = true;
            console.log('You have successfully connected to the server.');
            console.log(`You are using an account: ${response.fullName}`);
        }, (error) => {
            console.log('Error connection to server');
            console.dir(error);
            this.connected = false;
        });
    }

    async startLaunch () {
        if (!this.connected) throw Error('Report portal is not connected!');
        this.launch = this.client.startLaunch({
            startTime:   this.client.helpers.now(),
            description: `Running ${this.launchName} tests`,
        });
        this.suite = this.startSuite(this.launch.tempId);
    }

    async startSuite (launchId) {
        return this.client.startTestItem({
            startTime: this.client.helpers.now(),
            type:      'SUITE'
        }, launchId);
    }

    async finishLaunch () {
        this.client.finishLaunch(this.launch.tempId, {
            endTime: this.client.helpers.now()
        });
    }

    async startTest () {
        this.curTest = this.client.startTestItem({
            startTime: this.client.helpers.now(),
            type:      'TEST'
        }, this.launch.tempId, this.suite.tempId);
    }

    async finishTest (testId, status) {
        this.client.finishTestItem(testId, {
            status: status
        });
    }

    async sendTestLogs (testId, level, message) {
        this.client.sendLog(testId, {
            level:   level,
            message: message,
            time:    this.client.helpers.now()
        });
    }
}

module.exports = ReportPortal;
