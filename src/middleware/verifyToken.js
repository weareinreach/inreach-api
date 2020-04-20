/*
Middleware to verify the JSON Web Token and validate the client
*/
import jsonwebtoken from 'jsonwebtoken';
import config from '../utils/config';

const {tokenSignature} = config;

export default function verifyToken (req, res, next) {
// Get the token from the HTTP headers
  const token = req.headers['x-json-web-token'];
  if (!token) {
    res.status(400).send('Please provide a valid token.')
  } else {
// Verify if token exists
    jsonwebtoken.verify(token, tokenSignature, (error, decoded) => {
      if (error) {
        res.status(500).send('There was an error processing your request.');
      } else {
// If token exists proceed to next action
        next();
      };
    });
  };
};
