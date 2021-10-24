import { MockServer } from 'dmock-server';
import { mock } from './mock';
import { loadArguments } from './utils/cli-loader';
import createTestCafe from 'testcafe';
let reportPortalServer: MockServer;
let testcafeServer: TestCafe;

describe('Performing E2E testing', async function() {
    this.timeout(10 * 60 * 60 * 60);
    before(async () => {
        loadArguments();
        reportPortalServer = new MockServer({
            hostname: 'localhost',
            port: 1234,
            routes: mock
        });
        reportPortalServer.start()
        testcafeServer = await createTestCafe('localhost', 1337, 1338);
    });

    after(async () => {
        if(testcafeServer)
            await testcafeServer.close();
        reportPortalServer.stop()
    });

    it('Running TestCafe Tests', async () => {
        const runner = testcafeServer.createRunner();
        const failedCount = await runner
        .src(['tests/test.testcafe.ts'])
        .browsers(['firefox:headless'])
        .reporter('reportportal-plugin')
        .run();

        console.log('Tests failed: ' + failedCount);
    });
    it('Retry mechanism Tests', async () => {
        const runner = testcafeServer.createRunner();
        const failedCount = await runner
        .src(['tests/test.retry.testcafe.ts'])
        .browsers(['firefox:headless'])
        .reporter('reportportal-plugin')
        .run();

        console.log('Tests failed: ' + failedCount);
    });
});