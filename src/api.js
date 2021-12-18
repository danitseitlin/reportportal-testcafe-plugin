const axios = require('axios');
const fs = require('fs');

class API {
    constructor (options) {
        this.baseURL = `${options.protocol}://${options.domain}${options.apiPath}`;
        this.token = options.token;
        this.headers = { 'Content-type': 'application/json', 'Authorization': `Bearer ${options.token}` };
        this.displayDebugLogs = process.argv.find(arg => arg === '--display-debug-logs') !== undefined;
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: this.headers
        });
    }

    /**
     * Checking the connection to the report portal server
     */
    async checkConnect () {
        try {
            return this.handleResponse(await this.client.get('/user'));
        }
        catch (error) {
            if(this.displayDebugLogs === true){
                process.stdout.write(`[Connection Error]: ${this.parseError(error)}`);
            }
            return this.handleError(error);
        }
    }

    /**
     * Creating a launch
     * @param {*} projectName The name of the project
     * @param {*} options The options of the launch
     */
    async createLaunch (projectName, options) {
        try {
            return this.handleResponse(await this.client.post(`/${projectName}/launch`, options));
        }
        catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Finishing an existing launch
     * @param {*} projectName The name of the project
     * @param {*} launchId The id of the launch
     * @param {*} options The options of the launch
     */
    async finishLaunch (projectName, launchId, options) {
        try {
            return this.handleResponse(await this.client.put(`/${projectName}/launch/${launchId}/finish`, options));
        }
        catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Force stoping a launch
     * @param {*} projectName The name of the project 
     * @param {*} launchId The id of the launch
     * @param {*} options The options of the launch
     */
    async forceStopLaunch (projectName, launchId, options) {
        try {
            return this.handleResponse(await this.client.put(`/${projectName}/launch/${launchId}/stop`, options));
        }
        catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Creating a test item
     * @param {*} projectName The name of the project 
     * @param {*} options The options of the launch
     */
    async createTestItem (projectName, options) {
        try {
            return this.handleResponse(await this.client.post(`/${projectName}/item`, options));
        }
        catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Creating a child test item
     * @param {*} projectName The name of the project
     * @param {*} parentItem The parent item of the test item
     * @param {*} options The options of the child test item
     */
    async createChildTestItem (projectName, parentItem, options) {
        try {
            return this.handleResponse(await this.client.post(`/${projectName}/item/${parentItem}`, options));
        }
        catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Finishing a test item
     * @param {*} projectName The name of the project 
     * @param {*} testItemId The id of the test item
     * @param {*} options The options of the test item
     */
    async finishTestItem (projectName, testItemId, options) {
        try {
            return this.handleResponse(await this.client.put(`/${projectName}/item/${testItemId}`, options));
        }
        catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Building a multi part stream (JSON + file)
     * @param {*} jsonPart The JSON object of the stream
     * @param {*} filePart The file of the stream
     * @param {*} boundary The boundary of the stream
     */
    buildMultiPartStream (jsonPart, filePart, boundary) {
        const eol = '\r\n';
        const bx = `--${boundary}`;
        const buffers = [
            Buffer.from(
                bx + eol + 'Content-Disposition: form-data; name="json_request_part"' +
                eol + 'Content-Type: application/json' + eol +
                eol + eol + JSON.stringify(jsonPart) + eol
            ),
            Buffer.from(
                bx + eol + 'Content-Disposition: form-data; name="file"; filename="' + filePart.name + '"' + eol +
                'Content-Type: ' + filePart.type + eol + eol
            ),
            Buffer.from(filePart.content, 'base64'),
            Buffer.from(`${eol + bx}--${eol}`),
        ];

        return Buffer.concat(buffers);
    }

    /**
     * Sending logs to a test item
     * @param {*} projectName The name of the project
     * @param {*} options The options of the log item
     */
    async sendLog (projectName, options) {
        try {
            if(typeof options.message !== 'string')
                options.message = `${options.message}`;
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
    
    /**
     * Parsing an Axios error message
     * @param {*} error The error response
     * @returns A parsed error message
     */
    parseError(error) {
        const errorMessage = error.message;
        const responseData = error.response && error.response.data;
        return `${errorMessage}${
            responseData && typeof responseData === 'object' ? `: ${JSON.stringify(responseData)}` : ''}`
    }

    /**
     * Handling an Axios error
     * @param {*} error The error response
     */
    handleError (error) {
        const parsedError = this.parseError(error);
        throw new Error(parsedError);
    }
}

module.exports = API;
