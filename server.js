const http = require('http');
const userRouter = require('./routes/userRoutes');
const authRouter = require('./routes/authRoutes');
const { getOrgChart } = require('./controllers/userController')

const server = http.createServer((req, res) => {
  // CORS support for frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Ensure JSON response format for API
  if (req.url.startsWith('/users/org-chart') && req.method === 'GET') {
    return getOrgChart(req, res);
  } else if (req.url.startsWith('/users')) {
    userRouter(req, res);
  } else if (req.url.startsWith('/auth')) {
    authRouter(req, res);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 404, message: 'Route not found' }));
  }
});

server.listen(5000, () => {
  console.log('Server running at http://localhost:5000/');
});
