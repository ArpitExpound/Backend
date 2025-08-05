const bcrypt = require('bcryptjs');

// Hash for display (not for storage)
function hashPasswordForDisplay(password) {
  // Use a fixed salt for display hash to avoid generating a new salt every time
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

module.exports = { hashPasswordForDisplay };