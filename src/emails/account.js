
const sgMail = require('@sendgrid/mail');


sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email,name) => {
    sgMail.send({
        to: email,
        from: 'quocviethebi@gmail.com',
        subject: 'Thanks for joining in !',
        text: `Welcome to the application, ${name}. Let me know how you get along with the app`
    });
};

const sendCancelEmail = (email,name) => {
    sgMail.send({
        to: email,
        from: 'quocviethebi@gmail.com',
        subject: 'Thanks for using the application',
        text: `Dear ${name}, gachi is manly`
    });
};

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
};

