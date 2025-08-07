// utils/hashUtil.js
const bcrypt = require('bcryptjs');

function hashPasswordForDisplay(password) {
  if (typeof password !== 'string' || password.trim() === '') {
    return null; // instead of throwing error, return null to handle gracefully
  }
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

module.exports = { hashPasswordForDisplay };
