import { t } from 'testcafe';
import { MockServer } from 'dmock-server';
import { mock } from './mock';
let server: MockServer = new MockServer({
    hostname: 'localhost',
    port: 1234,
    routes: mock
});
server.start()
fixture `sss`
.page('https://google.com')
.before(async () => {
    //server = new MockServer({
    //    hostname: 'localhost',
    //    port: 1234,
    //    routes: mock
    //});
    //server.start();
})
.after(async () => {
    //server.stop();
})

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
//server.stop();