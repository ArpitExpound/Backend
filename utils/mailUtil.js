const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "arptripathi15@gmail.com",
    pass: "bjaz mivl tgmx nztp"
  }
});

async function sendResetEmail(to, link) {
  const mailOptions = {
    from: 'Harsh Dubey',
    to,
    subject: 'Password Reset',
    html: `<p>You requested a password reset. Click <a href="${link}">here</a> to reset your password. This link expires in 15 minutes.</p>`
  };
  return await transporter.sendMail(mailOptions);
}

module.exports = { sendResetEmail };