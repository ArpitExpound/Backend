const fs = require('fs');
const path = require('path');
 
function serveOrgChart(req, res) {
  const filePath = path.join(__dirname, '../data/orgChart.json');
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 404, message: 'Org chart JSON not found' }));
  }
  const data = fs.readFileSync(filePath, 'utf8');
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(data);
}
 
function orgChartRouter(req, res) {
  const { url, method } = req;
  if (url === '/orgchart' && method === 'GET') {
    return serveOrgChart(req, res);
  }
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 404, message: 'Route not found' }));
}
 
module.exports = orgChartRouter;
 