const { getCredentials, addCredential, updateCredential } = require('../models/authModel');
const { getUsers, writeUsers } = require('../models/userModel');
const { getDepartments } = require('../models/departmentModel');
const { generateToken, validateToken, deleteToken } = require('../models/resetTokenModel');
const { hashPasswordForDisplay } = require('../utils/hashUtil');
const { sendResetEmail } = require('../utils/mailUtil');
 
function sendResponse(res, status, message, data = null) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status, message, data }));
}
 
function signup(req, res, body) {
  try {
    const { id, name, email, phone, dept_id, password, emp_type, reports_to } = JSON.parse(body);
 
    if (!email || !password || !id || !name || !phone || !dept_id || !emp_type) {
      return sendResponse(res, 400, 'All fields except reports_to are required');
    }
 
    const credentials = getCredentials();
    const users = getUsers();
    const departments = getDepartments();
 
    if (credentials.find(u => u.email === email)) {
      return sendResponse(res, 409, 'Email already exists');
    }
    if (users.find(u => u.id === id)) {
      return sendResponse(res, 409, 'User ID already exists');
    }
    if (!departments[dept_id]) {
      return sendResponse(res, 400, 'Invalid department ID');
    }
 
    // Validate emp_type values
    const validRoles = ['Director', 'Manager', 'Employee', 'Intern'];
    if (!validRoles.includes(emp_type)) {
      return sendResponse(res, 400, 'Invalid employee type');
    }
 
    // Validate reports_to based on emp_type
    if (emp_type === 'Director') {
      if (reports_to) {
        return sendResponse(res, 400, 'Director cannot report to anyone');
      }
    } else {
      // For other roles, reports_to is mandatory
      if (!reports_to) {
        return sendResponse(res, 400, 'reports_to is required for this employee type');
      }
 
      const supervisor = users.find(u => u.id === reports_to);
      if (!supervisor) {
        return sendResponse(res, 400, 'reports_to user does not exist');
      }
      if (emp_type === 'Manager' && supervisor.emp_type !== 'Director') {
        return sendResponse(res, 400, 'Manager must report to a Director');
      }
      if (emp_type === 'Employee' && supervisor.emp_type !== 'Manager') {
        return sendResponse(res, 400, 'Employee must report to a Manager');
      }
      if (emp_type === 'Intern' && supervisor.emp_type !== 'Employee') {
        return sendResponse(res, 400, 'Intern must report to an Employee');
      }
    }
 
    addCredential(email, password);
    const newUser = { id, name, email, phone, dept_id, emp_type, reports_to: reports_to || '' };
    users.push(newUser);
    writeUsers(users);
 
    const enrichedUser = {
      ...newUser,
      department_name: departments[dept_id] || 'Unknown'
    };
 
    sendResponse(res, 201, 'User registered successfully', enrichedUser);
  } catch {
    sendResponse(res, 500, 'Invalid signup data');
  }
}
 
function login(req, res, body) {
  try {
    const { email, password } = JSON.parse(body);
 
    const credentials = getCredentials();
    const users = getUsers();
    const departments = getDepartments();
 
    const cred = credentials.find(u => u.email === email && u.password === password);
    if (!cred) return sendResponse(res, 401, 'Invalid email or password');
 
    const user = users.find(u => u.email === email);
    if (!user) return sendResponse(res, 404, 'User not found');
 
    const enrichedUser = {
      ...user,
      department_name: departments[user.dept_id] || 'Unknown'
    };
 
    sendResponse(res, 200, 'Login successful', enrichedUser);
  } catch {
    sendResponse(res, 500, 'Invalid login data');
  }
}
 
async function requestReset(req, res, body) {
  try {
    const { email } = JSON.parse(body);
    const credentials = getCredentials();
    if (!credentials.find(u => u.email === email)) {
      return sendResponse(res, 404, 'Email not found');
    }
    const token = generateToken(email, 1);
    const resetLink = `http://localhost:5000/auth/reset-password?token=${token}`;
    await sendResetEmail(email, resetLink);
    sendResponse(res, 200, 'Reset link sent to email');
  } catch {
    sendResponse(res, 500, 'Error processing reset request');
  }
}
 
function resetPassword(req, res, body) {
  try {
    let token;
    if (req.url.includes('?token=')) {
      token = req.url.split('?token=')[1];
      if (token.includes('&')) token = token.split('&')[0];
    }
    if (!token) return sendResponse(res, 400, 'Missing token');
    const email = validateToken(token);
    if (!email) return sendResponse(res, 403, 'Token expired or invalid');
    const { newPassword } = JSON.parse(body);
    if (!newPassword) return sendResponse(res, 400, 'Missing new password');
    const success = updateCredential(email, newPassword);
    if (!success) return sendResponse(res, 404, 'User not found');
    deleteToken(token);
    sendResponse(res, 200, 'Password reset successful');
  } catch {
    sendResponse(res, 500, 'Error resetting password');
  }
}
 
module.exports = { signup, login, requestReset, resetPassword };
