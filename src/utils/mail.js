const API_KEY = process.env.MAILGUN_API_KEY;
const DOMAIN = process.env.MAILGUN_DOMAIN;
const mailgun = require('mailgun-js')({apiKey: API_KEY, domain: DOMAIN});

exports.sendEmail = (recipient, subject, message, html) =>
	new Promise((res, rej) => {
		const data = {
			from: 'AsylumConnect <catalog@asylumconnect.org>',
			to: recipient,
			subject: subject,
			text: message,
			html: html
		};

		mailgun.messages().send(data, (err) => {
			if (err) {
				//console.log(err);
				return rej(err);
			}
			return res();
		});
	});
