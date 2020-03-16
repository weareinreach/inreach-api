import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';

import './utils/db';
import router from './routes';

const server = express();
const port = process.env.PORT || 8080;

server.use(cors());
server.use(bodyParser.json());
server.use(router);

server.listen(port, () =>
  console.log(`Listening on port: http://localhost:${port}`)
);
