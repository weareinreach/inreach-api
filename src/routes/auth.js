import jwt from 'jsonwebtoken';
import config from '../utils/config';

const {tokenSignature} = config;

/*
Get JSON Web Token
*/
export const getToken = (req, res) => {
  jwt.sign({id: req.id}, tokenSignature, {expiresIn: 86400}, (error, token) => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.send(token);
    }
  });
};
