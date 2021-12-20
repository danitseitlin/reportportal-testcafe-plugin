import { t } from 'testcafe';
import { cliArguments } from 'cli-argument-parser';
import { loadArguments } from '../utils/cli-loader';
const API = require('../../src/api.js');
let api: typeof API;
let projectName: string;
fixture `First fixture`
    .page('https://google.com')
    .before(async () => {
        //loadArguments();
        projectName = cliArguments.rproject;
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
    let logs = await api.getLogs(cliArguments.rproject);
    let log = logs.content.filter(l => l.message === logMsg);
    process.stdout.write(`\nFound ${log.length} occurances for message '${logMsg}'`);
    await t.expect(log.length).gte(1, 'Log appearances')
}