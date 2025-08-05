const fs = require('fs');
const path = require('path');
const authFile = path.join(__dirname, '../data/Auth.csv');

function getCredentials() {
  if (!fs.existsSync(authFile)) return [];
  const data = fs.readFileSync(authFile, 'utf8')
    .split('\n')
    .slice(1)
    .filter(Boolean);

  return data.map(line => {
    const [email, password] = line.split(',').map(f => f.trim().replace(/^"|"$/g, ''));
    return { email, password };
  });
}

function addCredential(email, password) {
  if (!fs.existsSync(authFile)) {
    fs.writeFileSync(authFile, 'email,password\n', 'utf8');
  }
  const line = `"${email}","${password}"\n`;
  fs.appendFileSync(authFile, line, 'utf8');
}

function updateCredential(email, newPassword) {
  const creds = getCredentials();
  const idx = creds.findIndex(u => u.email === email);
  if (idx === -1) return false;
  creds[idx].password = newPassword;
  const content = ['email,password', ...creds.map(u => `"${u.email}","${u.password}"`)].join('\n');
  fs.writeFileSync(authFile, content, 'utf8');
  return true;
}

module.exports = { getCredentials, addCredential, updateCredential };