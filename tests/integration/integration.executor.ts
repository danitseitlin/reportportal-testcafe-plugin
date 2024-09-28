import { loadArguments } from '../utils/cli-loader';
import createTestCafe from 'testcafe';
import { cliArguments } from 'cli-argument-parser';
import { expect } from 'chai';
import ApiTestingClient from '../../src/api-testing-client.js'
let testcafeServer: TestCafe;

describe('Performing Integration testing', async function() {
    this.timeout(10 * 60 * 60 * 60);
    before(async () => {
        loadArguments();
        const client = new ApiTestingClient({
            protocol: cliArguments.rprotocol,
            domain:  cliArguments.rdomain,
            apiPath:  '/',
        });

        //Using the default user provided by report portal
        const token = await client.getApiToken('default', '1q2w3e');
        const apiToken = await client.createApiKey(token.access_token, 1, `testing-${new Date().getTime()}` );
        cliArguments.rtoken = apiToken.api_key;
        testcafeServer = await createTestCafe('localhost', 1337, 1338);
    });

    after(async () => {
        if(testcafeServer){
            await testcafeServer.close();
        }
    });

    it('Running TestCafe Tests', async () => {
        cliArguments.rlaunch="TestCafe Tests"
        const runner = testcafeServer.createRunner();
        const failedCount = await runner
        .src(['tests/integration/integration.testcafe.ts'])
        .browsers([`${cliArguments.browser}`])
        .reporter('reportportal-plugin')
        .run();
        expect(failedCount).to.eql(1, 'The count of failed testcafe tests')
        console.log('Tests failed: ' + failedCount);
    });
    it('Retry mechanism Tests', async () => {
        cliArguments.rlaunch="Retry mechanism Tests"
        const runner = testcafeServer.createRunner();
        const failedCount = await runner
        .src(['tests/integration/integration.retry.testcafe.ts'])
        .browsers([`${cliArguments.browser}`])
        .reporter('reportportal-plugin')
        .run();
        
        expect(failedCount).to.eql(0, 'The count of failed testcafe tests')
        console.log('Tests failed: ' + failedCount);
    });
});