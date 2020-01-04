'use strict';

import Hapi from 'hapi';
import HapiServerSession from 'hapi-server-session';
import Inert from '@hapi/inert';

import { HelloWorld, GenerateUrls, ExecuteTermRangesHandler, ConsoleLog } from './app/index.mjs'

const init = async () => {
    const HOST_NAME = `localhost`;
    const PORT = 8089;

    const server = Hapi.server({
        port: PORT,
        host: HOST_NAME
    });

    await server.register(Inert);

    await server.register({
        plugin: HapiServerSession,
        options: {
          cookie: {
            isSecure: false, // never set to false in production
          },
        },
      });

    server.route({
        method: 'GET',
        path: '/api/v1/js',
        handler: (request, h) => {
            request;
            return h.file('./app/dist/url-generator-browser-script.min.js');
        }
    });

    server.route({
        method: 'GET',
        path: '/app/v1',
        handler: (request, h) => {
            request;
            return h.file('./app/html/index.html');
        }
    });

    server.route({
        method: 'GET',
        path: '/_health',
        handler: HelloWorld
    });

    server.route({
        method: 'POST',
        path: '/api/v1/execute',
        handler: ExecuteTermRangesHandler
    });

    server.route({
        method: 'GET',
        path: '/api/v1/{urlFormat}',
        handler: GenerateUrls
    });

    await server.start();
    ConsoleLog(`Server running on ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
    ConsoleLog(err, true);
    process.exit(1);
});

init();
