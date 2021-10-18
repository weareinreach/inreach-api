import cors from 'cors';
import express from 'express';
import mongoSanitize from 'express-mongo-sanitize';

// Connect the database client
import './db';
import {baseRouter, versionOneRouter} from './routes';

const server = express();
const port = process.env.PORT || 8080;

// Set up cors
server.use(cors());

// Accept JSON
server.use(express.json());

// Remove unsafe characters from mongo queries
server.use(mongoSanitize());

// Set up routes
server.use(baseRouter);
server.use('/v1', versionOneRouter);

// Start server
server.listen(port, () =>
	// eslint-disable-next-line
	console.log(`Listening at: http://localhost:${port}`)
);
