const fs = require('fs');
const path = require('path');
const { getUsers } = require('../models/userModel');
 
const orgChartFilePath = path.join(__dirname, '../data/orgChart.json');
 
function buildOrgChart() {
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
 
  return {
    organization: "Expound Technivo",
    directors
  };
}
 
function saveOrgChartToFile() {
  const orgChart = buildOrgChart();
  fs.writeFileSync(orgChartFilePath, JSON.stringify(orgChart, null, 2), 'utf8');
}
 
module.exports = { saveOrgChartToFile, orgChartFilePath };