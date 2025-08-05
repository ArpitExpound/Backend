const crypto = require('crypto');

// In-memory token store: { token: { email, expiresAt } }
const tokenStore = {};

function generateToken(email, expiresInMinutes = 15) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;
  tokenStore[token] = { email, expiresAt };
  return token;
}

function validateToken(token) {
  const info = tokenStore[token];
  if (!info) return null;
  if (Date.now() > info.expiresAt) {
    delete tokenStore[token];
    return null;
  }
  return info.email;
}

function deleteToken(token) {
  delete tokenStore[token];
}

module.exports = { generateToken, validateToken, deleteToken };