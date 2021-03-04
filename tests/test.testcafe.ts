import { t } from 'testcafe';

fixture `sss`
.page('https://google.com')

test('fff', async () => {
    console.log('xxx');
    await t.takeScreenshot()
})
test('fff2', async () => {
    console.log('xxx');
    await t.expect('X').eql('Y', 'OMG')
})

fixture `sss2`

test.skip('fff5', async () => {
    console.log('xxx');
})
test('fff32', async () => {
    console.log('xxx');
})