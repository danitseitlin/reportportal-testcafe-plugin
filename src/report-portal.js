const RPClient = require('./api');
const Arguments = require('cli-argument-parser').cliArguments;

class ReportPortal { 
    constructor () {
        console.log(Arguments);
        this.client = new RPClient({
            protocol: 'https',
            domain:   Arguments.rdomain,
            //token:    Arguments.rtoken,
            //endpoint: `https://${Arguments.rdomain}/api/v2`,
            //launch:   Arguments.rlaunch,
            //project:  Arguments.rproject,
            //debug:    true
        });
        this.connected = true;
        console.log('connecting....');
        this.client.checkConnect().then((response) => {
            this.connected = true;
            console.log('You have successfully connected to the server.');
            console.log(`You are using an account: ${response.fullName}`);
        }, (error) => {
            console.log('Error connection to server');
            console.dir(error);
            this.connected = false;
        });
        this.launchName = Arguments.rlaunch;
        this.projectName = Arguments.rproject;
    }

    async connect () {
        await this.client.checkConnect().then((response) => {
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
        this.launch = await this.client.createLaunch(this.projectName, {
            startTime:   this.client.now(),
            description: `Running ${this.launchName} tests`,
        });
        //this.suite = this.createSuite(this.launch.tempId);
    }

    async startSuite (name) {
        console.log(`running startSuite, launchId: ${this.launch.tempId}`);
        this.suite = await this.client.createTestItem(this.projectName, this.launch.tempId, {
            name:      name,
            startTime: this.client.now(),
            type:      'SUITE'
        });
    }

    async finishLaunch () {
        console.log('running finishLaunch');
        console.log(this.launch.tempId);
        await this.client.finishLaunch(this.launch.tempId, {
            endTime: this.client.now()
        });
    }

    async startTest (name) {
        console.log('running startTest');
        this.curTest = await this.client.createTestItem({
            launchUuid: this.launch.tempId,
            name:       name,
            startTime:  this.client.now(),
            type:       'TEST'
        });
    }

    async finishTest (testId, status) {
        console.log(`running finishTest, testId: ${testId}, status: ${status}`);
        await this.client.finishTestItem(this.projectName, testId, {
            launchUuid: this.launch.tempId,
            status:     status
        });
    }

    async finishSuite (suiteId, status) {
        console.log(`running finishSuite, suiteId: ${suiteId}, status: ${status}`);
        await this.client.finishTestItem(this.projectName, suiteId, {
            launchUuid: this.launch.tempId,
            status:     status
        });
    }

    async sendTestLogs (testId, level, message) {
        console.log('running sendTestLogs');
        await this.client.sendLog(this.projectName, {
            launchUuid: this.launch.tempId,
            level:      level,
            message:    message,
            time:       this.client.now()
        });
    }
}

module.exports = ReportPortal;
