const nodemailer = require("nodemailer");
require('dotenv').config();

async function mail(devFirstName, devLastName, clientEmail, subject, text) {

  
    
    let transporter = nodemailer.createTransport({
      host: "smtp-mail.outlook.com",
      port: 587,
      tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false,
      },
      secure: false, 
      auth: {
        user: process.env.LANCER_EMAIL_ADDRESS, 
        pass: process.env.LANCER_EMAIL_PW, 
      },
    });
    let info = await transporter.sendMail({
        from: `"${devFirstName} ${devLastName}" <LancerProjectManagement@outlook.com>`,// sender address
        to: clientEmail , 
        subject: subject, 
        text: text, 
      });
    
      console.log("Message sent: %s", info.messageId);
      
    }
    
module.exports = { mail }