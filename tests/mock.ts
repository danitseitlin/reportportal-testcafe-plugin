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
    statusCode: (Math.floor(Math.random() * 10) === 5) ? 500: 200,
    response: (req: Request) => {
        process.stdout.write(`[Server]${JSON.stringify(req.body)} \n`)
        process.stdout.write(`[Server][${(req.body as any).level}] log sent: ${(req.body as any).message} \n`)
        return {
            id: 134,
            message: (req.body as any).message
        }
    }
},{
    path: '/api/v1/retry/launch',
    method: 'post',
    response: {
        id: 113
    }
},{
    path: '/api/v1/retry/113/finish',
    method: 'put',
    response: {
        id: 113
    }
},{
    path: '/api/v1/retry/item',
    method: 'post',
    response: {
        id: 123
    }
},{
    path: '/api/v1/retry/item/123',
    method: 'put',
    response: {
        id: 123
    }
},{
    path: '/api/v1/retry/item/123',
    method: 'put',
    response: {
        id: 123
    }
},{
    path: '/api/v1/retry/log',
    method: 'post',
    statusCode: (Math.floor(Math.random() * 10) === 4) ? 500: 200,
    response: (req: Request) => {
        process.stdout.write(`[Server][${(req.body as any).level}] log sent: ${(req.body as any).message} \n`)
        return {
            id: 134,
            message: (req.body as any).message
        }
    }
}]