const axios = require('axios');

class UAT {
    constructor (options) {
        this.baseURL = `${options.protocol}://${options.domain}${options.apiPath}`;
        this.token = options.token;
        this.headers  = { 'Content-type': 'application/json' };
        this.displayDebugLogs = process.argv.find(arg => arg === '--display-debug-logs') !== undefined;
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: this.headers
        });
    }

    /**
     * Recreating the Axios client
     */
    recreateApiClient() {
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: this.headers
        });
    }

    /**
     * Setting UI token (Basic Authorization)
     * @param {*} token The UI token
     * @param {*} recreateClient If to recreate the client after set. Default: true
     */
    setUiToken(token, recreateClient = true) {
        this.headers.Authorization = `Basic ${token}`;
        if(recreateClient === true) {
            this.recreateApiClient();
        }
    }

    /**
     * Setting API token (Bearer Authorization)
     * @param {*} token The API token
     * @param {*} recreateClient If to recreate the client after set. Default: true 
     */
    setApiToken(token, recreateClient = true) {
        this.headers.Authorization = `Bearer ${token}`;
        if(recreateClient === true) {
            this.recreateApiClient();
        }
    }

    /**
     * Retrieving a user UAT token based on login credentials
     * @param {*} username The username of the user
     * @param {*} password The password of the user
     * @returns The UAT token of the user
     */
    async getApiToken(username, password) {
        try {
            const encodedURI = this.encodeURI({
                'grant_type': 'password',
                username: username,
                password: password
            })
            const token = Buffer.from('ui:uiman').toString('base64');
            this.setUiToken(token)
            const response = await this.client.post(`/sso/oauth/token?${encodedURI}`);
            return this.handleResponse(response);
        }
        catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Generating an API token
     * @param {*} token The UI token to authenticate with
     * @returns A response obj with the API token data
     */
    async generateApiToken(token) {
        this.setApiToken(token);
        try {
            const response = await this.client.post('/sso/me/apitoken?authenticated=true');
            return this.handleResponse(response);
        }
        catch(error) {
            return this.handleError(error); 
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
            responseData && typeof responseData === 'object' ? `: ${JSON.stringify(responseData)}` : ''}`;
    }

    /**
     * Handling an Axios error
     * @param {*} error The error response
     */
    handleError (error) {
        const parsedError = this.parseError(error);
        throw new Error(parsedError);
    }

    encodeURI(parameters) {
        let convertedParameters = '';
        for(const parameter in parameters) {
            const parameterValue = typeof parameters[parameter] === 'object' ? JSON.stringify(parameters[parameter]): parameters[parameter]
            convertedParameters += `${parameter}=${encodeURIComponent(parameterValue)}&`;
        }
        return convertedParameters.substring(0, convertedParameters.length-1);
    }
}

module.exports = UAT;
