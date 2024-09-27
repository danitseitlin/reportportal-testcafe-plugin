import { loadArguments } from '../utils/cli-loader';
import createTestCafe from 'testcafe';
import { cliArguments } from 'cli-argument-parser';
import { expect } from 'chai';
import UAT from '../../src/uat.js'
let testcafeServer: TestCafe;

describe('Performing Integration testing', async function() {
    this.timeout(10 * 60 * 60 * 60);
    before(async () => {
        loadArguments();
        let client = new UAT({
            protocol: 'http',
            domain:  'localhost:8080',
            apiPath:  '/uat',
        });
        const token = await client.getApiToken('default', '1q2w3e');
        console.log(`Got the following token: ${JSON.stringify(token)}`)
        client = new UAT({
            protocol: 'http',
            domain:  'localhost:8080',
            apiPath:  '/',
        });
        const apiToken = await client.createApiToken(token.access_token, 1, 'testing'+new Date().getTime() );
        console.log(`Generated the following report portal token: ${JSON.stringify(apiToken)}`)
        cliArguments.rtoken = apiToken.api_key;
        console.log(`List of arguments: ${JSON.stringify(cliArguments)}`)
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