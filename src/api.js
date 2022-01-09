const axios = require("axios");

const fs = require("fs");

const path = require("path");

const filename = path.basename(__filename);

class API {
    constructor(options, debug) {
        this.baseURL = `${options.protocol}://${options.domain}${options.apiPath}`;
        this.token = options.token;
        this.headers = {
            "Content-type": "application/json",
            Authorization: `Bearer ${options.token}`,
        };
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: this.headers,
        });
        this._debug = debug || false;
    }

    /**
     * Checking the connection to the report portal server
     */

    async checkConnect() {
        if (this._debug == true) {
            process.stdout.write("[" + filename + "] check connect: /user\n");
        }

        try {
            return this.handleResponse(await this.client.get("/user"));
        } catch (error) {
            return this.handleError(error);
        }
    }
    /**
     * Creating a launch
     * @param {*} projectName The name of the project
     * @param {*} options The options of the launch
     */

    async createLaunch(projectName, options) {
        if (this._debug == true) {
            process.stdout
                .write(`[${filename}] createLaunch:post /${projectName}/launch\n 
                with options: ${JSON.stringify(options)}`);
        }
        try {
            return this.handleResponse(
                await this.client.post(`/${projectName}/launch`, options)
            );
        } catch (error) {
            return this.handleError(error);
        }
    }


   /**
   * Getting launch attributes
   * @param {*} projectName The name of the project
   * @param {*} launchId The id of the launch
   */
  async getLaunchAttributes(projectName, launchId) {
    if (this._debug == true) process.stdout.write(`[${filename}] getting launch attributes: ${projectName}/launch/${launchId}\n`);

    try {
      const res = await this.handleResponse(await this.client.get(`/${projectName}/launch/uuid/${launchId}`));
      return res.attributes;
    } catch (error) {
      return this.handleError(error);
    }
  }

    /**
     * Finishing an existing launch
     * @param {*} projectName The name of the project
     * @param {*} launchId The id of the launch
     * @param {*} options The options of the launch
     */

    async finishLaunch(projectName, launchId, options) {
        if (this._debug == true) {
            process.stdout
                .write(`[${filename}] finishLaunch:put ${projectName}/launch/${launchId}/finish\n 
                with options: ${JSON.stringify(options)} \n 
                with launchId: ${JSON.stringify(launchId)}`);
        }
        try {
            return this.handleResponse(
                await this.client.put(
                    `/${projectName}/launch/${launchId}/finish`,
                    options
                )
            );
        } catch (error) {
            return this.handleError(error);
        }
    }
    /**
     * Force stoping a launch
     * @param {*} projectName The name of the project
     * @param {*} launchId The id of the launch
     * @param {*} options The options of the launch
     */

    async forceStopLaunch(projectName, launchId, options) {
        if (this._debug == true) {
            process.stdout
                .write(`[${filename}]forceStopLaunch:put /launch/${launchId}/stop\n 
                with options: ${JSON.stringify(options)}\n 
                with launchId: ${JSON.stringify(launchId)}`);
        }
        try {
            return this.handleResponse(
                await this.client.put(
                    `/${projectName}/launch/${launchId}/stop`,
                    options
                )
            );
        } catch (error) {
            return this.handleError(error);
        }
    }
    /**
     * Creating a test item
     * @param {*} projectName The name of the project
     * @param {*} options The options of the launch
     */

    async createTestItem(projectName, options) {
        if (this._debug == true) {
            process.stdout.write(`[${filename}]launch:${
                options.launchUuid
            } createTestItem:post  /${projectName}/item\n 
            with options: ${JSON.stringify(options)}`);
        }
        try {
            return this.handleResponse(
                await this.client.post(`/${projectName}/item`, options)
            );
        } catch (error) {
            return this.handleError(error);
        }
    }
    /**
     * Creating a child test item
     * @param {*} projectName The name of the project
     * @param {*} parentItem The parent item of the test item
     * @param {*} options The options of the child test item
     */

    async createChildTestItem(projectName, parentItem, options) {
        if (this._debug == true) {
            process.stdout.write(`[${filename}]launch:${
                options.launchUuid
            } createChildTestItem:post /${projectName}/item/${parentItem}\n
            with options: ${JSON.stringify(options)}\n 
            time:${this.now()}\n`);
        }
        try {
            return this.handleResponse(
                await this.client.post(
                    `/${projectName}/item/${parentItem}`,
                    options
                )
            );
        } catch (error) {
            return this.handleError(error);
        }
    }
    /**
     * Finishing a test item
     * @param {*} projectName The name of the project
     * @param {*} testItemId The id of the test item
     * @param {*} options The options of the test item
     */

    async finishTestItem(projectName, testItemId, options) {
        if (this._debug == true) {
            process.stdout.write(`[${filename}]launch:${
                options.launchUuid
            } finishTestItem:put /${projectName}/item/${testItemId}\n
                with options: ${JSON.stringify(options)}\n `);
        }
        try {
            return this.handleResponse(
                await this.client.put(
                    `/${projectName}/item/${testItemId}`,
                    options
                )
            );
        } catch (error) {
            return this.handleError(error);
        }
    }
    /**
     * Building a multi part stream (JSON + file)
     * @param {*} jsonPart The JSON object of the stream
     * @param {*} filePart The file of the stream
     * @param {*} boundary The boundary of the stream
     */

    buildMultiPartStream(jsonPart, filePart, boundary) {
        if (this._debug == true) {
            process.stdout.write(`[${filename}]enter buildMultiPartStream \n`);
        }
        const eol = "\r\n";
        const bx = `--${boundary}`;
        const buffers = [
            Buffer.from(
                /* eslint-disable */
                bx +
                    eol +
                    'Content-Disposition: form-data; name="json_request_part"' +
                    eol +
                    "Content-Type: application/json" +
                    eol +
                    eol +
                    eol +
                    JSON.stringify(jsonPart) +
                    eol
            ),
            Buffer.from(
                bx +
                    eol +
                    'Content-Disposition: form-data; name="file"; filename="' +
                    filePart.name +
                    '"' +
                    eol +
                    "Content-Type: " +
                    filePart.type +
                    eol +
                    eol
            ),
            /* eslint-disable */
            Buffer.from(filePart.content, "base64"),
            Buffer.from(`${eol + bx}--${eol}`),
        ];
        return Buffer.concat(buffers);
    }
    /**
     * Sending logs to a test item
     * @param {*} projectName The name of the project
     * @param {*} options The options of the log item
     * request body should contain 2 params:
     * 1. json file with specific format:file,itemId,level,message,time
     * 2. all files to upload(file names should match file names from part 1)
     */

    async sendLog(projectName, options) {
        if (options !== undefined) {
            try {
                if (this._debug == true) {
                    process.stdout.write(
                        `[${filename}]enter sendLog under: ${
                            options.itemUuid
                        } time:${this.now()}\n`
                    );
                }
                if (typeof options.message !== "string")
                    options.message = `${options.message}`;

                if (
                    options.file !== undefined &&
                    options.file.path !== undefined
                ) {
                    const MULTIPART_BOUNDARY = Math.floor(
                        Math.random() * 10000000000
                    ).toString();
                    const fullPath = options.file.path;
                    const instance = await axios.create({
                        baseURL: this.baseURL,
                        headers: {
                            "Content-type": `multipart/form-data; boundary=${MULTIPART_BOUNDARY}`,
                            Authorization: `Bearer ${this.token}`,
                        },
                    }); //request body

                    await instance.post(
                        `${this.baseURL}/${projectName}/log`,
                        this.buildMultiPartStream(
                            [options],
                            {
                                name: options.file.name,
                                type: "image/png",
                                content: fs.readFileSync(fullPath),
                            },
                            MULTIPART_BOUNDARY
                        )
                    );
                } else {
                    this.handleResponse(
                        await this.client.post(`/${projectName}/log`, options)
                    );
                }
            } catch (error) {
                process.stdout.write(
                    `[api.js]sendLog error: ${error.message}\n`
                );
                this.handleError(error);
            }
        }
    }
    /**
     * Retrieving the timestamp right now
     */

    now() {
        return new Date().valueOf();
    }
    /**
     * Handling an Axios response
     * @param {*} response The object of the response
     */

    handleResponse(response) {
        if (this._debug == true) {
            process.stdout.write(
                `\n[${filename}] handle reponse:${JSON.stringify(
                    response.data
                )}\n with status: ${response.status}\n`
            );
        }

        return response.data;
    }
    /**
     * Handling an Axios error
     * @param {*} error The error response
     */

    handleError(error) {
        if (this._debug == true) {
            process.stdout.write(`[${filename}] handleERROR: ${error}\n`);
        }
        const errorMessage = error.message;
        const responseData = error.response && error.response.data;
        throw new Error(
            `${errorMessage}${
                responseData && typeof responseData === "object"? `: ${JSON.stringify(responseData)}`: ""}`
        );
    }
}

module.exports = API;
