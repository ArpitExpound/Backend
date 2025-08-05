const {
  getAllUsers,
  getUserById,
  addUser,
  updateUser,
  deleteUser,
  downloadUsersAsExcel
} = require('../controllers/userController');

function userRouter(req, res) {
  const { url, method } = req;

  if (url === '/users' && method === 'GET') return getAllUsers(req, res);
  if (url === '/users/download' && method === 'GET') return downloadUsersAsExcel(req, res);

  if (url.startsWith('/users/') && method === 'GET') {
    const id = url.split('/')[2];
    return getUserById(req, res, id);
  }

  if (url === '/users' && method === 'POST') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => addUser(req, res, body));
    return;
  }

  if (url.startsWith('/users/') && method === 'PUT') {
    const id = url.split('/')[2];
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => updateUser(req, res, id, body));
    return;
  }

  if (url.startsWith('/users/') && method === 'DELETE') {
    const id = url.split('/')[2];
    return deleteUser(req, res, id);
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 404, message: 'Route not found' }));
}

module.exports = userRouter;