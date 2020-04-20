// import jwt from 'jsonwebtoken';
// import config from '../utils/config';

// const {tokenSignature} = config;

/*
Middleware to verify the JSON Web Token and validate the client
*/
export default function verifyToken(req, res, next) {
  /**
   * Until the work is done to integrate the token here:
   * https://app.asana.com/0/1132189118126148/1169561089123225
   * we are going to comment out this middleware
   */
  return next();

  // // Get the token from the HTTP headers
  // const token = req.headers['x-json-web-token'];
  // if (!token) {
  //   res.status(400).send('Please provide a valid token.');
  // } else {
  //   // Verify if token exists
  //   jwt.verify(token, tokenSignature, (error, decoded) => {
  //     if (error) {
  //       res.status(500).send('There was an error processing your request.');
  //     } else {
  //       // If token exists proceed to next action
  //       next();
  //     }
  //   });
  // }
}
