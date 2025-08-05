const fs = require('fs');
const path = require('path');
const departmentFile = path.join(__dirname, '../data/Department.csv');

function getDepartments() {
  if (!fs.existsSync(departmentFile)) return {};
  const data = fs.readFileSync(departmentFile, 'utf8').split('\n').slice(1);
  const deptMap = {};
  data.filter(line => line).forEach(line => {
    const [id, department_name] = line.split(',').map(field =>
      field.trim().replace(/^"|"$/g, '')
    );
    if (id) deptMap[id] = department_name;
  });
  return deptMap;
}

module.exports = { getDepartments };