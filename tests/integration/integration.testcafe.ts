import { t } from 'testcafe';
import { cliArguments } from 'cli-argument-parser';
const API = require('../../src/api.js');
let api: typeof API;
fixture `First fixture`
    .page('https://google.com')
    .before(async () => {
        //loadArguments();
        api = new API({
            protocol: 'http',
            domain: 'localhost:8080',
            apiPath: '/api/v1',
            token: cliArguments.rtoken,
        })
    });
test('Taking screenshot', async () => {
    await logAndVerify('About to take a screenshot');
    await t.takeScreenshot()
    await logAndVerify('The screenshot was succesfully taken!');
})
test('Negative testing, verifying Error display', async () => {
    await logAndVerify('About to fail..');
    await logAndVerify(`${{obj: 'X', obj2: { x: 'Y'}}}`)
    await logAndVerify({obj: 'X', obj2: { x: 'Y'}})
    await t.expect('X').eql('Y', 'OMG');
    await logAndVerify('The test failed!');
})

fixture `Second fixture`
test.skip('Skipping the test', async () => {
    await logAndVerify('The test is skipped. This log shoud not be appearing.');
})
test('Basic print', async () => {
    await logAndVerify('Printing the test contents');
})

/**
 * Logging a message via console.log and verifying it exists in report portal
 * @param logMsg The log message
 */
async function logAndVerify(logMsg: any) {
    console.log(logMsg);
    await sleepInSeconds(5 * 1000);
    let logs = await api.getLogs(cliArguments.rproject);
    let log = logs.content.filter(l => l.message === logMsg);
    process.stdout.write(`\n[Test logs]: Found ${log.length} occurances for message '${logMsg}'\n`);
    await t.expect(log.length).gte(1, `Log appearances for '${logMsg}'`);
}

/**
 * Stopping the code from continueing for a number of miliseconds
 * @param miliseconds The number of miliseconds to stop to code for
 */
async function sleepInSeconds(miliseconds: number): Promise<any> {
    return new Promise(resolve => setTimeout(resolve, miliseconds))
}