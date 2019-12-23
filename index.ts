'use strict';

import Hapi from 'hapi';

import { HelloWorld, GenerateUrls, ExecuteTermRangesHandler } from './app/index.mjs'

// const Inert = require('@hapi/inert');

const init = async () => {
    const HOST_NAME = `localhost`;
    const PORT = 8081;

    const server = Hapi.server({
        port: PORT,
        host: HOST_NAME
    });

    server.route({
        method: 'GET',
        path: '/_health',
        handler: HelloWorld
    });

    server.route({
        method: 'POST',
        path: '/api/execute',
        handler: ExecuteTermRangesHandler
    });

    server.route({
        method: 'GET',
        path: '/{urlFormat}',
        handler: GenerateUrls
    });

    await server.start();
    console.log(`Server running on ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();
