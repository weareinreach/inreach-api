export let send = function (req, res) {
    const API_KEY = process.env.MAILGUN_API_KEY
    const DOMAIN = process.env.MAILGUN_DOMAIN;
    const mailgun = require("mailgun-js")({apiKey: API_KEY, domain: DOMAIN});

    const {ownerStatus} = req?.params;
    const {org} = req?.params;
    const {user} = req?.body;
    let subject;
    let messageBody;

    // Approve or deny affiliation
    switch(ownerStatus) {
        case 'approve':
            subject = `You are now affiliated with ${org} on AsylumConnect`;
            messageBody = `Thank you for requesting to join ${org} on the AsylumConnect Catalog. Our team has approved your request and your AsylumConnect user account is now connected to ${org}\'s profile page on AsylumConnect.`;
            break;
        case 'deny':
            subject = 'Follow Up Re: Request to Join Organization on AsylumConnect';
            messageBody = `Thank you for requesting to join ${org} on the AsylumConnect Catalog. Our team was not able to verify your connection to ${org} based on your initial registration information. Please reply to this email with more details on how exactly you are affiliated with ${org}.`
            break;
    }

    // Create email and send
    const data = {
        from: `AsylumConnect  <catalog@asylumconnect.org>`,
        to: `${user}`,
        subject: `${subject}`,
        text: `${messageBody}${user}`
    };
    mailgun.messages().send(data, function (err, body) {
        body = data.text;
        if (err) {
            res.status(err.status || 500)
            res.json({error: err});
            console.log(`An error occurred: ${err}`);
        } else {
            res.send('Message sent');
            console.log(body);
        }
    });
}
  