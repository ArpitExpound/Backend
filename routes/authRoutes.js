const { signup, login, requestReset, resetPassword } = require('../controllers/authController');

function authRouter(req, res) {
  const { url, method } = req;

  if (url === '/auth/signup' && method === 'POST') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => signup(req, res, body));
    return;
  }

  if (url === '/auth/login' && method === 'POST') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => login(req, res, body));
    return;
  }

  if (url === '/auth/request-reset' && method === 'POST') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => requestReset(req, res, body));
    return;
  }

  if (url.startsWith('/auth/reset-password') && method === 'POST') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => resetPassword(req, res, body));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 404, message: 'Auth route not found' }));
}

module.exports = authRouter;