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

// Signup remains unchanged
function signup(req, res, body) {
  try {
    const { id, name, email, phone, dept_id, password } = JSON.parse(body);

    if (!email || !password || !id || !name || !phone || !dept_id) {
      return sendResponse(res, 400, 'All fields are required');
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

    try {
      addCredential(email, password);
    } catch (err) {
      console.error("Failed to write to Auth.csv:", err);
      return sendResponse(res, 500, "Internal error writing auth credentials");
    }
    // Save to User.csv
    const newUser = { id, name, email, phone, dept_id };
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

// Request password reset
async function requestReset(req, res, body) {
  try {
    const { email } = JSON.parse(body);
    const credentials = getCredentials();
    if (!credentials.find(u => u.email === email)) {
      return sendResponse(res, 404, 'Email not found');
    }
    const token = generateToken(email, 15); // 15 min expiry
    const resetLink = `http://localhost:5000/auth/reset-password?token=${token}`;
    await sendResetEmail(email, resetLink);
    sendResponse(res, 200, 'Reset link sent to email');
  } catch {
    sendResponse(res, 500, 'Error processing reset request');
  }
}

// Reset password (via link)
function resetPassword(req, res, body) {
  try {
    let token;
    // Get token from query string
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