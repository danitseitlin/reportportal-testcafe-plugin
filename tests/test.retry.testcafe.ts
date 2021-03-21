import { t } from 'testcafe';

fixture `Testing the retry mechanism`
.page('https://google.com')

test('Retry mechanism', async() => {
    console.log('Triggering retry mechanism...')
    console.log('[1] Triggering retry mechanism...')
    console.log('[2] Triggering retry mechanism...')
    console.log('[3] Triggering retry mechanism...')
    console.log('[4] Triggering retry mechanism...')
})