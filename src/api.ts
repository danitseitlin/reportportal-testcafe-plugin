/* eslint-disable no-undefined */
import Axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import fs from 'fs';

export class API {
    options: Options
    baseURL: string
    token: string
    headers: {[key: string]: any}
    client: AxiosInstance

    constructor (options: Options) {
        this.baseURL = `${options.protocol}://${options.domain}${options.apiPath}`;
        this.token = options.token;
        this.headers = { 'Content-type': 'application/json', 'Authorization': `Bearer ${options.token}` };
        this.client = Axios.create({
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
            return this.handleError(error);
        }
    }

    /**
     * Creating a launch
     * @param {*} projectName The name of the project
     * @param {*} options The options of the launch
     */
    async createLaunch (projectName: string, options: CreateLaunchParameters) {
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
    async finishLaunch (projectName: string, launchId: string, options: FinishLaunchParameters) {
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
    async forceStopLaunch (projectName: string, launchId: string, options: FinishLaunchParameters) {
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
    async createTestItem (projectName: string, options: CreateTestItemParameters) {
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
     * @param {*} parentItemId The parent item of the test item
     * @param {*} options The options of the child test item
     */
    async createChildTestItem (projectName: string, parentItemId: string, options: CreateTestItemParameters) {
        try {
            return this.handleResponse(await this.client.post(`/${projectName}/item/${parentItemId}`, options));
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
    async finishTestItem (projectName: string, testItemId: string, options: FinishTestItemParameters) {
        try {
            return this.handleResponse(await this.client.put(`/${projectName}/item/${testItemId}`, options));
        }
        catch (error) {
            return this.handleError(error);
        }
    }

    /**
     * Building a multi part stream (JSON + file)
     * @param {*} jsonPart The JSON object
     * @param {*} filePart The file
     * @param {*} boundary The boundary
     */
    buildMultiPartStream (jsonPart: CreateLogParameters[], filePart: {name: string, type: string, content: any }, boundary: string) {
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

    /**
     * Sending logs to a test item
     * @param {*} projectName The name of the project
     * @param {*} options The options of the log item
     */
    async sendLog (projectName: string, options: CreateLogParameters) {
        try {
            options.message = this.isJSON(options.message) || Array.isArray(options.message) ? JSON.stringify(options.message) : options.message;
            if (options.file) {
                const MULTIPART_BOUNDARY = Math.floor(Math.random() * 10000000000).toString();
                const fullPath = options.file.path;
                const instance = Axios.create({
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
    isJSON (json: string): boolean {
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
    now (): number {
        return new Date().valueOf();
    }

    /**
     * Handling an Axios response
     * @param {*} response The object of the response
     */
    handleResponse (response: AxiosResponse) {
        return response.data;
    }
    
    /**
     * Handling an Axios error
     * @param {*} error The error response
     */
    handleError (error: AxiosError) {
        const errorMessage = error.message;
        const responseData = error.response && error.response.data;

        throw new Error(`${errorMessage}${
            responseData
                && typeof responseData === 'object'
                ? `: ${JSON.stringify(responseData)}`
                : ''}`);
    }
}

/**
 * The contructor options
 */
export type Options = { protocol: 'https' | 'http', domain: string, apiPath: string, token: string }

/**
 * The launch creation parameters
 */
export type CreateLaunchParameters = {
    name:        string,
    startTime:   number,
    description?: string,
    rerun?: boolean,
    rerunOf?: boolean,
    mode?: 'DEFAULT' | 'DEBUG',
    attributes?: ItemAttribute[],
    [key: string]: any
}

/**
 * The launch finish parameters
 */
export type FinishLaunchParameters = {
    attributes?: ItemAttribute[],
    description?: string,
    endTime: number,
    status?: TestItemStatus
}

/**
 * The item attribute object
 */
export type ItemAttribute = {
    key: string,
    system?: boolean,
    value: string 
}

/**
 * The item parameter object
 */
export type ItemParameter = {
    key: string,
    value?: string
}

/**
 * The test item creation parameters
 */
export type CreateTestItemParameters = {
    attributes?: ItemAttribute[],
    codeRef?: string,
    description?: string,
    hasStats?: boolean,
    launchUuid: string,
    name: string,
    parameters: ItemParameter[],
    retry?: boolean,
    retryOf?: string,
    startTime?: string,
    testCaseId: string,
    type: TestItemType,
    uniqueId?: string
}

/**
 * The test item finish parameters
 */
export type FinishTestItemParameters = {
    attributes?: ItemAttribute[],
    endTime: number,
    issue: {
        autoAnalyzed?: boolean,
        comment?: string,
        externalSystemIssues: {
            btsProject?: string,
            btsUrl?: string,
            submitData?: number,
            ticketId?: string,
            url?: string
        },
        ignoreAnalyzer?: boolean,
        issueType: string
    },
    launchUuid: string,
    retry?: boolean,
    retryOf?: boolean,
    testCaseId?: string,
    status?: TestItemStatus
}

/**
 * The log creation parameters
 */
export type CreateLogParameters = {
    file: { name: string, [key: string]: any },
    itemUuid?: string,
    launchUuid: string,
    level?: LogLevel,
    message?: string,
    time: string,
    uuid?: string
}

/**
 * The available test item types
 */
export type TestItemType = 'SUITE' | 'STORY' | 'TEST' | 'SCENARIO' | 'STEP' | 'BEFORE_CLASS' | 'BEFORE_GROUPS' | 'BEFORE_METHOD' | 'BEFORE_SUITE' | 'BEFORE_TEST' | 'AFTER_CLASS' | 'AFTER_GROUPS' | 'AFTER_METHOD' | 'AFTER_SUITE' | 'AFTER_TEST';

/**
 * The available log levels
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'fatal' | 'unknown';

/**
 * The available test item statuses
 */
export type TestItemStatus = 'PASSED'| 'FAILED'| 'STOPPED'| 'SKIPPED'| 'INTERRUPTED'| 'CANCELLED'| 'INFO'| 'WARN';