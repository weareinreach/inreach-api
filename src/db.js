import mongoose from 'mongoose';

const mongoURI = process.env.MONGODB_URI || '';

mongoose.connect(mongoURI, {
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

// eslint-disable-next-line
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', () => {
  // eslint-disable-next-line
  console.log(`Connected to database: ${mongoURI}`);
});
