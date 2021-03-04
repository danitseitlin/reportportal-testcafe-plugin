import { Route } from 'dmock-server';

export const mock: Route[] = [{
    path: '/api/v1/user',
    method: 'get',
    response: {}
},{
    path: '/api/v1/tmp/launch',
    method: 'post',
    response: {
        id: 113
    }
},{
    path: '/api/v1/tmp/113/finish',
    method: 'put',
    response: {
        id: 113
    }
},{
    path: '/api/v1/tmp/item',
    method: 'post',
    response: {
        id: 123
    }
},{
    path: '/api/v1/tmp/item/123',
    method: 'put',
    response: {
        id: 123
    }
},{
    path: '/api/v1/tmp/item/123',
    method: 'put',
    response: {
        id: 123
    }
},{
    path: '/api/v1/tmp/log',
    method: 'post',
    response: {
        id: 134
    }
}]