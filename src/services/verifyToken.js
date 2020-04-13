/*
Middleware to verify the JSON Web Token and validate the client
*/
import jsonwebtoken from 'jsonwebtoken';

export default function verifyToken (req, res, next) {
// Get the token from the HTTP headers
  var secret = 'secretkey';
  var token = req.headers['x-json-web-token'];
  if (!token) {
    res.status(404).send('Please provide a valid token.')
  } else {
// Verify if token exists
    jsonwebtoken.verify(token, secret, (error, decoded) => {
      if (error) {
        res.status(500).send('There was an error processing your request.');
      } else {
// If token exists proceed to next action
        // res.send(decoded);
        next();
      };
    });
  };
};
