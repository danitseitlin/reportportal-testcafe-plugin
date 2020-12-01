import { cliArguments } from 'cli-argument-parser'
export class ReportPortal { 
    constructor() {
        const RPClient = require('reportportal-js-client');
        this.client = new RPClient({
            token: cliArgument.srtoken,
            endpoint: `${cliArguments.rendpoint}/api/v1`,
            launch: cliArguments.rlaunch,
            project: cliArguments.rproject,
        });
        this.launchName = cliArguments.rlaunch;
        this.projectName = cliArguments.rproject;
    }

    async connect() {
        this.client.checkConnect().then((response) => {
            console.log('You have successfully connected to the server.');
            console.log(`You are using an account: ${response.fullName}`);
        }, (error) => {
            console.log('Error connection to server');
            console.dir(error);
        });
    }

    async startLaunch() {
        this.launch = this.client.startLaunch({
            startTime: this.client.helpers.now(),
            description: `Running ${this.launchName} tests`,
        });
        this.suite = this.startSuite(this.launch.tempId);
    }

    async startSuite(launchId) {
        return this.client.startTestItem({
            startTime: rpClient.helpers.now(),
            type: 'SUITE'
        }, launchId);
    }

    async finishLaunch() {
        rpClient.finishLaunch(this.launch.tempId, {
            endTime: this.client.helpers.now()
        });
    }

    async startTest() {
        this.curTest = this.client.startTestItem({
            startTime: this.client.helpers.now(),
            type: 'TEST'
        }, this.launch.tempId, this.suite.tempId);
    }

    async finishTest(testId, status) {
        this.client.finishTestItem(testId, {
            status: status
        })
    }

    async sendTestLogs(testId, level, message) {
        this.client.sendLog(testId, {
            level: level,
            message: message,
            time: this.client.helpers.now()
        })
    }


}