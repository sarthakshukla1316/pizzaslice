const nodemailer = require("nodemailer");
require('dotenv').config();

module.exports = mailSender = (toEmail, content, subject) => {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_ID,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_ID,
        to: toEmail,
        subject: subject,
        html: content,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            throw error;
        }
    });
};
