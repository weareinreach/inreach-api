import mongoose from 'mongoose';

const mongoURL = process.env.MONGODB_URL || '';

mongoose.connect(mongoURL, {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', () => {
  console.log(`Connected to database: ${mongoURL}`);
});
