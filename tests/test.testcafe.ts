import { t } from 'testcafe';

fixture `First fixture`
.page('https://google.com')

test('Taking screenshot', async () => {
    console.log('About to take a screenshot');
    await t.takeScreenshot()
})
test('Negative testing, verifying Error display', async () => {
    console.log('About to fail..');
    await t.expect('X').eql('Y', 'OMG')
})

fixture `Second fixture`

test.skip('Skipping the test', async () => {
    console.log('xxx');
})
test('Basic print', async () => {
    console.log('Printing the test contents');
})