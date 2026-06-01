const fs = require('fs');
const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/href="[^"]*#events"\s+class="nav-a"\s+data-close/g, 'href="events.html" class="nav-a" data-close');
  content = content.replace(/href="events\.html"\s+class="nav-a"\s+data-close/g, 'href="events.html" class="nav-a' + (f === 'events.html' ? ' active' : '') + '" data-close');
  fs.writeFileSync(f, content);
});
console.log('Mobile nav updated');
