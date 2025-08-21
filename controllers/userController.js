const { getUsers, writeUsers } = require('../models/userModel');
const { getDepartments } = require('../models/departmentModel');
const { getCredentials } = require('../models/authModel');
const { hashPasswordForDisplay } = require('../utils/hashUtil');
const ExcelJS = require('exceljs');
 
function sendResponse(res, statusCode, message, data = null) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: statusCode, message, data }));
}
 
function getAllUsers(req, res) {
  const users = getUsers();
  const credentials = getCredentials();
  const departments = getDepartments();
  const emailToPassword = {};
  credentials.forEach(cred => {
    emailToPassword[cred.email] = hashPasswordForDisplay(cred.password);
  });
  const enriched = users.map(u => ({
    ...u,
    department_name: departments[u.dept_id] || 'Unknown',
    password: emailToPassword[u.email] || null
  }));
  sendResponse(res, 200, 'Fetched all users', enriched);
}
 
function getUserById(req, res, id) {
  const users = getUsers();
  const credentials = getCredentials();
  const departments = getDepartments();
  const user = users.find(u => u.id === id);
  if (!user) return sendResponse(res, 404, 'User not found');
  const cred = credentials.find(c => c.email === user.email);
  const enriched = {
    ...user,
    department_name: departments[user.dept_id] || 'Unknown',
    password: cred ? hashPasswordForDisplay(cred.password) : null
  };
  sendResponse(res, 200, 'User fetched successfully', enriched);
}
 
function addUser(req, res, body) {
  try {
    const { id, name, email, phone, dept_id } = JSON.parse(body);
    const departments = getDepartments();
    if (!dept_id || !departments[dept_id]) {
      return sendResponse(res, 400, 'Invalid department ID');
    }
 
    const users = getUsers();
    if (users.find(u => u.id === id)) {
      return sendResponse(res, 409, 'User ID already exists');
    }
    if (users.find(u => u.email === email)) {
      return sendResponse(res, 409, 'User email already exists');
    }
    users.push({ id, name, email, phone, dept_id });
    writeUsers(users);
 
    sendResponse(res, 201, 'User added successfully', {
      id, name, email, phone, dept_id, department_name: departments[dept_id]
    });
  } catch {
    sendResponse(res, 500, 'Error adding user');
  }
}
 
function updateUser(req, res, id, body) {
  const users = getUsers();
  const departments = getDepartments();
  let newData;
  try {
    newData = JSON.parse(body);
  } catch {
    return sendResponse(res, 400, 'Invalid JSON data');
  }
  let found = false;
 
  const updated = users.map(user => {
    if (user.id === id) {
      found = true;
      return { ...user, ...newData };
    }
    return user;
  });
 
  if (!found) return sendResponse(res, 404, 'User not found');
  writeUsers(updated);
  sendResponse(res, 200, 'User updated successfully');
}
 
function deleteUser(req, res, id) {
  const users = getUsers();
  const updated = users.filter(u => u.id !== id);
  if (updated.length === users.length) return sendResponse(res, 404, 'User not found');
  writeUsers(updated);
  sendResponse(res, 200, 'User deleted successfully');
}
 
async function downloadUsersAsExcel(req, res) {
  const users = getUsers();
  const credentials = getCredentials();
  const departments = getDepartments();
  const emailToPassword = {};
  credentials.forEach(cred => {
    emailToPassword[cred.email] = hashPasswordForDisplay(cred.password);
  });
  const enriched = users.map(u => ({
    ...u,
    department_name: departments[u.dept_id] || 'Unknown',
    password: emailToPassword[u.email] || null
  }));
 
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Users');
 
  if (enriched.length > 0) {
    sheet.columns = Object.keys(enriched[0]).map(key => ({
      header: key.replace(/_/g, ' ').toUpperCase(),
      key: key
    }));
    enriched.forEach(row => sheet.addRow(row));
  }
 
  res.writeHead(200, {
    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'Content-Disposition': 'attachment; filename="users.xlsx"'
  });
  await workbook.xlsx.write(res);
  res.end();
}
 
// NEW: Org chart JSON builder
function getOrgChart(req, res) {
  try {
    const users = getUsers();
 
    function getChildrenByType(parentId, childType) {
      return users
        .filter(u => u.reports_to === parentId && u.emp_type.toLowerCase() === childType)
        .map(u => {
          let childrenKey = '';
          switch(childType) {
            case 'director': childrenKey = 'managers'; break;
            case 'manager': childrenKey = 'employees'; break;
            case 'employee': childrenKey = 'interns'; break;
            case 'intern': childrenKey = ''; break;
            default: childrenKey = '';
          }
          const node = { id: u.id, name: u.name };
          if (childrenKey) {
            node[childrenKey] = getChildrenByType(u.id, childrenKey.slice(0, -1));
          }
          return node;
        });
    }
 
    const directors = users
      .filter(u => u.emp_type.toLowerCase() === 'director')
      .map(d => ({
        id: d.id,
        name: d.name,
        managers: getChildrenByType(d.id, 'manager')
      }));
 
    const orgChart = {
      organization: "Expound Technivo",
      directors
    };
 
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(orgChart));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 500, message: 'Failed to build org chart' }));
  }
}
 
module.exports = {
  getAllUsers,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
  downloadUsersAsExcel,
  getOrgChart
};
 
 