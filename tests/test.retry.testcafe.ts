import { t } from 'testcafe';

fixture `Testing the retry mechanism`
.page('https://google.com')

test('Retry mechanism', async() => {
    console.log('Triggering retry mechanism...')
})