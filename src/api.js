
const axios = require('axios');

class API {

    constructor (options) {
        this.client = axios.create({
            protocol: options.protocol,
            baseURL:  `${options.domain}`,
            headers:  { 'Content-type': 'application/json' }
        });
    }

    async checkConnect () {
        return await this.client.get('/');
    }

    async createLaunch (projectName, options) {
        return await this.client.post(`/api/v1/${projectName}/launch`, options);
    }

    async finishLaunch (projectName, launchId, options) {
        ///v1/{projectName}/launch/{launchId}/finish
        return await this.client.put(`/api/v1/${projectName}/launch/${launchId}/finish`, options);
        //console.log('running finishLaunch');
        //console.log(this.launch.tempId);
        //await this.client.finishLaunch(this.launch.tempId, {
        //    endTime: await this.client.helpers.now()
        //});
    }

    async forceStopLaunch (projectName, launchId, options) {
        ///v1/{projectName}/launch/{launchId}/finish
        return await this.client.put(`/api/v1/${projectName}/launch/${launchId}/stop`, options);
        //console.log('running finishLaunch');
        //console.log(this.launch.tempId);
        //await this.client.finishLaunch(this.launch.tempId, {
        //    endTime: await this.client.helpers.now()
        //});
    }

    async createTestItem (projectName, options) {
        //console.log('running startTest');
        //this.curTest = await this.client.startTestItem({
        //    name:      name,
        //    startTime: await this.client.helpers.now(),
        //    type:      'TEST'
        //}, this.launch.tempId, this.suite.tempId);
        return await this.client.post(`/api/v1/${projectName}/item`, options);
    }

    async finishTestItem (projectName, testItemId, options) {
        ///v1/{projectName}/item/{testItemId}
        return await this.client.put(`/api/v1/${projectName}/item/${testItemId}`, options);
        //console.log(`running finishTest, testId: ${testId}, status: ${status}`);
        //await this.client.finishTestItem(testId, {
        //    status: status
        //});
    }

    async sendLogs (projectName, options) { ///v1/{projectName}/log
        return await this.client.post(`/api/v1/${projectName}/log`, options);
        //console.log('running sendTestLogs');
        //await this.client.sendLog(testId, {
        //    level:   level,
        //    message: message,
        //    time:    await this.client.helpers.now()
        //});
    }

    now () {
        return new Date().valueOf();
    }
}

module.exports = API;
