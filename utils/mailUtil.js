const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "your_ethereal_user@ethereal.email",
    pass: "your_ethereal_password"
  }
});
async function sendResetEmail(to, link) {
  const mailOptions = {
    from: 'noreply@yourdomain.com',
    to,
    subject: 'Password Reset',
    html: `<p>You requested a password reset. Click <a href="${link}">here</a> to reset your password. This link expires in 15 minutes.</p>`
  };
  console.log(`Reset link for ${to}: ${link}`);
  return await transporter.sendMail(mailOptions);
}

module.exports = { sendResetEmail };