
const axios = require('axios');

class API {

    constructor (options) {
        this.client = axios.create({
            baseURL: `${options.protocol}://${options.domain}${options.apiPath}`,
            headers: { 'Content-type': 'application/json', 'Authorization': `Bearer ${options.token}` }
        });
    }

    async checkConnect () {
        try {
            return this.handleResponse(await this.client.get('/user'));
        }
        catch (error) {
            console.log(error);
            throw Error(error);
        }
    }

    async createLaunch (projectName, options) {
        try {
            return this.handleResponse(await this.client.post(`/${projectName}/launch`, options));
        }
        catch (error) {
            console.log(error);
            throw Error(error);
        }
    }

    async finishLaunch (projectName, launchId, options) {
        try {
            return this.handleResponse(await this.client.put(`/${projectName}/launch/${launchId}/finish`, options));
        }
        catch (error) {
            console.log(error);
            throw Error(error);
        }
    }

    async forceStopLaunch (projectName, launchId, options) {
        try {
            return this.handleResponse(await this.client.put(`/${projectName}/launch/${launchId}/stop`, options));
        }
        catch (error) {
            console.log(error);
            throw Error(error);
        }
    }

    async createTestItem (projectName, options) {
        try {
            return this.handleResponse(await this.client.post(`/${projectName}/item`, options));
        }
        catch (error) {
            console.log(error);
            throw Error(error);
        }
    }

    async createChildTestItem (projectName, parentItem, options) {
        try {
            return this.handleResponse(await this.client.post(`/${projectName}/item/${parentItem}`, options));
        }
        catch (error) {
            console.log(error);
            throw Error(error);
        }
    }

    async finishTestItem (projectName, testItemId, options) {
        try {
            return this.handleResponse(await this.client.put(`/${projectName}/item/${testItemId}`, options));
        }
        catch (error) {
            console.log(error);
            throw Error(error);
        }
    }

    async sendLog (projectName, options) {
        try {
            options.message = this.isJSON(options.message) || Array.isArray(options.message) ? JSON.stringify(options.message): options.message
            return this.handleResponse(await this.client.post(`/${projectName}/log`, options));
        }
        catch (error) {
            console.log(error);
            throw Error(error);
        }
    }
    
    isJSON(json) {
        try {
            JSON.parse(json)
            return true;
        }
        catch (e) {
            return false;
        }
    }
    now () {
        return new Date().valueOf();
    }

    handleResponse (response) {
        return response.data;
    }
}

module.exports = API;
