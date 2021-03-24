import { t } from 'testcafe';

fixture `First fixture`
.page('https://google.com')

test('Taking screenshot', async () => {
    console.log('About to take a screenshot');
    await t.takeScreenshot()
    console.log('The screenshot was succesfully taken!');
})
test('Negative testing, verifying Error display', async () => {
    console.log('About to fail..');
    console.log(`${{obj: 'X', obj2: { x: 'Y'}}}`)
    console.log({obj: 'X', obj2: { x: 'Y'}})
    await t.expect('X').eql('Y', 'OMG');
    console.log('The test failed!');
})

fixture `Second fixture`

test.skip('Skipping the test', async () => {
    console.log('The test is skipped. This log shoud not be appearing.');
})
test('Basic print', async () => {
    console.log('Printing the test contents');
})