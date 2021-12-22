/* eslint-disable no-console */
import mongoose from 'mongoose';
const mongoURI =
	process.env.ENV === 'TEST' ? process.env.TEST_DB_URI : process.env.DB_URI;

mongoose.connect(mongoURI, {
	useFindAndModify: false,
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error(s):'));

db.once('open', () => {
	process.env.ENV === 'TEST'
		? console.log('Connected to Docker database!')
		: console.log('Connected to database!');
});
