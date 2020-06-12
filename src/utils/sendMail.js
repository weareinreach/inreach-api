var API_KEY = 'key-414b065823760eabf0b4eb07ba6f7c52';
var DOMAIN = 'email.asylumconnectcatalog.org';
var mailgun = require('mailgun-js')({apiKey: API_KEY, domain: DOMAIN});

import {User} from '../mongoose';

export const generatePasswordResetMail = async (req, res) => {
  var generateRandomString = () => {
    var randomString = Math.random().toString(25).substr(2, 8);
    return randomString;
  };
  var newPassword = generateRandomString();

  var sendPasswordReset = () => {
    const data = {
      from: 'AsylumConnect Support <catalog@asylumconnect.org>',
      to: req.body.email,
      subject: `Password reset for ${req.body.email}`,
      html: `
      <p>Hello, Bonjour, Hola!</p>
      <p>This notification is on behalf of AsylumConnect to let you know that your account password has been
      successfully reset to <strong>${newPassword}</strong>. Please use this password to log back into the
      <a href="https://catalog.asylumconnect.org/" target="_blank">AsylumConnect Catalog</a> where you can create a new password for your account.
      <p>If you did not reset your account password, please contact AsylumConnect immediately at <a href="mailto:ckraczucstudent@gmail.com?subject=Problem%20with%20password%20reset">catalog@asylumconnect.org</a>.</p>
      <p>Thank you, Merci, Gracias!</p>
      <p>The AsylumConnect Team</p>
      `
    };

    mailgun.messages().send(data, (error, body) => {
      res.status(200).send(body);
    });
  };

  await User.findOne({email: req.body.email})
    .then(async (user) => {
      if(!user){
        res.status(400).send('That email does not exist!');
      };

      user.setPassword(newPassword);

      await user
        .save()
        .then(() => sendPasswordReset())
        .catch((error) => res.status(500).send(error))
    })
    .catch((error) => res.status(500).send(error));

};
