const nodemailer = require('nodemailer');
const dontenv = require('dotenv');
dontenv.config({ path: './config.env' });
const catchAsync = require('./../utils/catchError');
const pug = require('pug');
const htmlTotext = require('html-to-text');
module.exports = class Email {
  constructor(user, url) {
    (this.to = user.email),
      (this.url = url),
      (this.firstName = user.name.split(' ')[0]);
    this.from = `rishabh mathur <${process.env.EMAIL_FROM}>`;
  }
  newTransport() {
    // if (process.env.NODE_ENV === 'production') {
    return nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
    // return nodemailer.createTransport(
    //   nodemailerSendgrid({
    //     user: process.env.SENDGRID_USERNAME,
    //     pass: process.env.SENDGRID_PASSWORD,
    //   })
    // );
    //sendgrid
    // } else {
    //   return nodemailer.createTransport({
    //     service: 'SendGrid',
    //     auth: {
    //       user: process.env.SENDGRID_USERNAME,
    //       pass: process.env.SENDGRID_PASSWORD,
    //     },
    //   });
    // return nodemailer.createTransport({
    //   host: process.env.EMAIL_HOST,
    //   port: process.env.EMAIL_PORT,
    //   auth: {
    //     user: process.env.EMAIL_USERNAME,
    //     pass: process.env.EMAIL_PASSWORD,
    //   },
    // });
    //  }
  }
  //send the actual email
  async send(template, subject) {
    //render the file
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    //mailoptions
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlTotext.fromString(html),
    };
    //create transport and send email
    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send('welcome', 'hello !!!welcome to natours ');
  }
  async passwordReset() {
    await this.send('passwordReset', 'Password Reset From NATOURS');
  }
};
