// models/userModel.js
const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../data/User.csv');
 
function getUsers() {
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, 'utf8')
    .split('\n')
    .slice(1)
    .filter(Boolean);
 
  return data.map(line => {
    const [id, name, email, phone, dept_id, emp_type, reports_to] = line
      .split(',')
      .map(f => f.trim().replace(/^"|"$/g, ''));
    return { id, name, email, phone, dept_id, emp_type, reports_to };
  });
}
 
function writeUsers(users) {
  const header = 'id,name,email,phone,dept_id,emp_type,reports_to';
  const content = [header, ...users.map(u =>
    `"${u.id}","${u.name}","${u.email}","${u.phone}","${u.dept_id}","${u.emp_type || ''}","${u.reports_to || ''}"`
  )].join('\n');
  fs.writeFileSync(filePath, content, 'utf8');
}
 
module.exports = { getUsers, writeUsers };
 