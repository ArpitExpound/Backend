const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../data/User.csv');

function getUsers() {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, 'utf8').split('\n').slice(1).filter(Boolean);
  return data.map(line => {
    const [id, name, email, phone, dept_id] = line.split(',').map(f => f.trim().replace(/^"|"$/g, ''));
    return { id, name, email, phone, dept_id };
  });
}

function writeUsers(users) {
  const content = ['id,name,email,phone,dept_id', ...users.map(u =>
    `"${u.id}","${u.name}","${u.email}","${u.phone}","${u.dept_id}"`
  )].join('\n');
  fs.writeFileSync(filePath, content, 'utf8');
}

module.exports = { getUsers, writeUsers };