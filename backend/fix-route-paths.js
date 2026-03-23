const fs = require('fs');
const path = require('path');
const routeFiles = fs.readdirSync('routes').filter(f => f.endsWith('.js'));
for (const f of routeFiles) {
  const p = path.join('routes', f);
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(/require\('\.\/([a-zA-Z0-9_]+)\.controller'\)/g, "require('../controllers/$1.controller')");
  c = c.replace(/require\('\.\/([a-zA-Z0-9_]+)\.middleware'\)/g, "require('../middleware/$1.middleware')");
  c = c.replace(/require\('\.\/([a-zA-Z0-9_]+)\.service'\)/g, "require('../services/$1.service')");
  if (c !== fs.readFileSync(p, 'utf8')) {
    fs.writeFileSync(p, c, 'utf8');
  }
}
console.log('patched route paths');