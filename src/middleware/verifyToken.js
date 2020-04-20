/*
Middleware to verify the JSON Web Token and validate the client
*/
import jsonwebtoken from 'jsonwebtoken';

export default function verifyToken (req, res, next) {
// Get the token from the HTTP headers
  const SECRET_KEY = process.env.TOKEN_SIGNATURE || 'ssshhh';
  var token = req.headers['x-json-web-token'];
  if (!token) {
    res.status(404).send('Please provide a valid token.')
  } else {
// Verify if token exists
    jsonwebtoken.verify(token, SECRET_KEY, (error, decoded) => {
      if (error) {
        console.log(SECRET_KEY);
        res.status(500).send('There was an error processing your request.');
      } else {
// If token exists proceed to next action
        // res.send(decoded);
        next();
      };
    });
  };
};
