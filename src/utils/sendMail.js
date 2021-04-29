var API_KEY = process.env.MAILGUN_API_KEY || Cypress.env('MAILGUN_API_KEY');
var DOMAIN = process.env.MAILGUN_DOMAIN || Cypress.env('MAILGUN_DOMAIN');
var mailgun = require('mailgun-js')({apiKey: API_KEY, domain: DOMAIN});

import {User} from '../mongoose';
import {handleBadRequest, handleErr} from './index';

export const generatePasswordResetMail = async (req, res) => {
	try {
		const generateRandomString = () => {
			var randomString = Math.random().toString(25).substr(2, 8);
			return randomString;
		};
		const newPassword = generateRandomString();

		const sendPasswordReset = () => {
			const data = {
				from: 'AsylumConnect Support <catalog@asylumconnect.org>',
				to: req.body.email,
				subject: `Password reset for ${req.body.email}`,
				html: `
      <p>Hello, Bonjour, Hola!</p>
      <p>This notification is on behalf of AsylumConnect to let you know that your account password has been
      successfully reset to <strong>${newPassword}</strong>. Please use this password to log back into the
      <a href="https://catalog.asylumconnect.org/" target="_blank">AsylumConnect Catalog</a> where you can create a new password for your account.
      <p>If you did not reset your account password, please contact AsylumConnect immediately at <a href="mailto:catalog@asylumconnect.org?subject=Problem%20with%20password%20reset">catalog@asylumconnect.org</a>.</p>
      <p>Thank you, Merci, Gracias!</p>
      <p>The AsylumConnect Team</p>
      `
			};

			mailgun.messages().send(data, (error, body) => {
				res.status(200).send(body);
			});
		};
		const user = await User.findOne({email: req.body.email});
		if (!user) {
			res.status(400).send('That email does not exist!');
			return;
		}
		user.setPassword(newPassword);
		await user.save();
		await sendPasswordReset();
	} catch (error) {
		res.status(500).send(error);
	}
};

const genereateEmailContent = (shareUrl, resourceType) => {
	return ` <p>Hello, Bonjour, Hola!</p>
	<p>This notification is on behalf of AsylumConnect to let you know that someone has shared ${resourceType} with you. You can view the ${resourceType} 
	<a href=${shareUrl} target="_blank">here</a>.</p>
	<p>The AsylumConnect Team</p>`;
};

export const shareUserList = (
	email = null,
	shareType = null,
	shareUrl = null,
	resource = null,
	res = null
) => {
	try {
		if (!email || !shareType || !shareUrl || !res) {
			return handleBadRequest();
		}
		const resourceType =
			shareType === 'collection' ? 'a list of resources' : 'an organization';
		const html = genereateEmailContent(shareUrl, resourceType);
		const data = {
			from: 'AsylumConnect Support <catalog@asylumconnect.org>',
			to: email,
			subject: `Someone just shared ${resourceType} with you!`,
			html: html
		};
		return mailgun.messages().send(data, (error, body) => {
			if (error || !body || !body?.id || !body?.message) {
				handleErr(error, res);
			}
			res.json({updated: true, resource, sent: true});
		});
	} catch (error) {
		return error;
	}
};
