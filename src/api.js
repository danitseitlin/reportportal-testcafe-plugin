/* eslint-disable no-undefined */

const axios = require('axios');
const fs = require('fs');

class API {

    constructor (options) {
        this.options = options;
        this.baseURL = `${options.protocol}://${options.domain}${options.apiPath}`;
        this.token = options.token;
        this.headers = { 'Content-type': 'application/json', 'Authorization': `Bearer ${options.token}` };
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: { 'Content-type': 'application/json', 'Authorization': `Bearer ${options.token}` }
        });
    }

    async checkConnect () {
        try {
            return this.handleResponse(await this.client.get('/user'));
        }
        catch (error) {
            return this.handleError(error);
        }
    }

    async createLaunch (projectName, options) {
        try {
            return this.handleResponse(await this.client.post(`/${projectName}/launch`, options));
        }
        catch (error) {
            return this.handleError(error);
        }
    }

    async finishLaunch (projectName, launchId, options) {
        try {
            return this.handleResponse(await this.client.put(`/${projectName}/launch/${launchId}/finish`, options));
        }
        catch (error) {
            return this.handleError(error);
        }
    }

    async forceStopLaunch (projectName, launchId, options) {
        try {
            return this.handleResponse(await this.client.put(`/${projectName}/launch/${launchId}/stop`, options));
        }
        catch (error) {
            return this.handleError(error);
        }
    }

    async createTestItem (projectName, options) {
        try {
            return this.handleResponse(await this.client.post(`/${projectName}/item`, options));
        }
        catch (error) {
            return this.handleError(error);
        }
    }

    async createChildTestItem (projectName, parentItem, options) {
        try {
            return this.handleResponse(await this.client.post(`/${projectName}/item/${parentItem}`, options));
        }
        catch (error) {
            return this.handleError(error);
        }
    }

    async finishTestItem (projectName, testItemId, options) {
        try {
            return this.handleResponse(await this.client.put(`/${projectName}/item/${testItemId}`, options));
        }
        catch (error) {
            return this.handleError(error);
        }
    }

    buildMultiPartStream (jsonPart, filePart, boundary) {
        const eol = '\r\n';
        const bx = `--${boundary}`;
        const buffers = [
            // eslint-disable-next-line function-paren-newline
            Buffer.from(
                // eslint-disable-next-line prefer-template
                bx + eol + 'Content-Disposition: form-data; name="json_request_part"'
                + eol + 'Content-Type: application/json' + eol
                + eol + eol + JSON.stringify(jsonPart) + eol,
            ),
            // eslint-disable-next-line function-paren-newline
            Buffer.from(
                // eslint-disable-next-line prefer-template
                bx + eol + 'Content-Disposition: form-data; name="file"; filename="' + filePart.name + '"' + eol
                + 'Content-Type: ' + filePart.type + eol + eol,
            ),
            Buffer.from(filePart.content, 'base64'),
            Buffer.from(`${eol + bx}--${eol}`),
        ];

        return Buffer.concat(buffers);
    }
    async sendLog (projectName, options) {
        try {
            options.message = this.isJSON(options.message) || Array.isArray(options.message) ? JSON.stringify(options.message) : options.message;
            if (options.file) {
                const MULTIPART_BOUNDARY = Math.floor(Math.random() * 10000000000).toString();
                const fullPath = options.file.path;
                const instance = axios.create({
                    baseURL: this.baseURL,
                    headers: { 'Content-type': `multipart/form-data; boundary=${MULTIPART_BOUNDARY}`, 'Authorization': `Bearer ${this.token}` }
                });
                
                await instance.post(`${this.baseURL}/${projectName}/log`, this.buildMultiPartStream([options], {
                    name:    options.file.name,
                    type:    'image/png',
                    content: fs.readFileSync(fullPath)
                }, MULTIPART_BOUNDARY));
            }
            else this.handleResponse(await this.client.post(`/${projectName}/log`, options));
        }
        catch (error) {
            this.handleError(error);
        }
    }
    
    /**
     * Checking if item is a valid JSON
     * @param {*} json The string of the JSON
     */
    isJSON (json) {
        try {
            JSON.parse(json);
            return true;
        }
        catch (e) {
            return false;
        }
    }

    /**
     * Retrieving the timestamp right now
     */
    now () {
        return new Date().valueOf();
    }

    /**
     * Handling an Axios response
     * @param {*} response The object of the response
     */
    handleResponse (response) {
        return response.data;
    }
    
    handleError (error) {
        const errorMessage = error.message;
        const responseData = error.response && error.response.data;

        throw new Error(`${errorMessage}${
            responseData
                && typeof responseData === 'object'
                ? `: ${JSON.stringify(responseData)}`
                : ''}`);
    }
}

module.exports = API;
