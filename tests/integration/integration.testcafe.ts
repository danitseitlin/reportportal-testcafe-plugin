import { t } from 'testcafe';
import { cliArguments } from 'cli-argument-parser';
declare global {
    interface TestController {
        testRun: {
            name: string;
        };
    }
}
const API = require('../../src/api.js');
let api: typeof API;
fixture `First fixture`
    .page('https://google.com')
    .before(async () => {
        api = new API({
            protocol: cliArguments.rprotocol,
            domain:  cliArguments.rdomain,
            apiPath: '/api',
            token: cliArguments.rtoken,
        })
    });
test('Taking screenshot', async () => {
    await logAndVerify('Taking screenshot', 'About to take a screenshot');
    await t.takeScreenshot()
    await logAndVerify('Taking screenshot', 'The screenshot was succesfully taken!');
})
test('Negative testing, verifying Error display', async () => {
    await logAndVerify('Negative testing, verifying Error display', 'About to fail..');
    await logAndVerify('Negative testing, verifying Error display', `${{obj: 'X', obj2: { x: 'Y'}}}`)
    await logAndVerify('Negative testing, verifying Error display', {obj: 'X', obj2: { x: 'Y'}})
    await t.expect('X').eql('Y', 'OMG');
    await logAndVerify('Negative testing, verifying Error display', 'The test failed!');
})

fixture `Second fixture`
test.skip('Skipping the test', async () => {
    await logAndVerify('Skipping the test', 'The test is skipped. This log shoud not be appearing.');
})
test('Basic print', async () => {
    await logAndVerify('Basic print', 'Printing the test contents');
})

/**
 * Logging a message via console.log and verifying it exists in report portal
 * @param logMsg The log message
 */
async function logAndVerify(testName: string, logMsg: any) {
    const message = typeof logMsg !== 'string' ? JSON.stringify(logMsg): logMsg
    console.log(message);
    await sleepInSeconds(5 * 1000);
    let launches = await api.getLaunches(cliArguments.rproject);
    launches = launches.filter(l => l.name === cliArguments.rlaunch)
    const launchId = launches[0].id;
    const items = await api.getItems(cliArguments.rproject, launchId, testName)

    const item = items.find(item => item.name === testName && item.type === 'TEST')
    const logs = await api.getItemLogs(cliArguments.rproject, item.id)
    
    const filteredLogs = logs.filter(l => l.message === message);
    
    process.stdout.write(`\n[Test logs]: Found ${filteredLogs.length} occurances for message '${message}'\n`);
    await t.expect(filteredLogs.length).gte(1, `Log appearances for '${message}'`);
}

/**
 * Stopping the code from continueing for a number of miliseconds
 * @param miliseconds The number of miliseconds to stop to code for
 */
async function sleepInSeconds(miliseconds: number): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, miliseconds))
}