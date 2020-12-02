import { t } from 'testcafe';

fixture `sss`

test('fff', async () => {
    console.log('xxx');
})
test('fff2', async () => {
    console.log('xxx');
    throw new Error('x')
})

fixture `sss2`

test.skip('fff5', async () => {
    console.log('xxx');
})
test('fff32', async () => {
    console.log('xxx');
})