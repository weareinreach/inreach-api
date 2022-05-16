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
				from: 'InReach Support <hello@inreach.org>',
				to: req.body.email,
				subject: `Password reset for ${req.body.email}`,
				html: `
      <p>Hello, Bonjour, Hola!</p>
      <p>This notification is on behalf of InReach to let you know that your account password has been
      successfully reset to <strong>${newPassword}</strong>. Please use this password to log back into the
      <a href="https://catalog.inreach.org/" target="_blank">InReach App</a> where you can create a new password for your account.
      <p>If you did not reset your account password, please contact InReach immediately at <a href="mailto:hello@inreach.org?subject=Problem%20with%20password%20reset">hello@inreach.org</a>.</p>
      <p>Thank you, Merci, Gracias!</p>
      <p>The InReach Team</p>
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
	<p>This notification is on behalf of InReach to let you know that someone has shared ${resourceType} with you. You can view the ${resourceType} 
	<a href=${shareUrl} target="_blank">here</a>.</p>
	<p>The InReach Team</p>`;
};

export const shareResource = (
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
			from: 'InReach Support <hello@inreach.org>',
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
