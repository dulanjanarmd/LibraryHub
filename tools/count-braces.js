const fs = require('fs');
const path = require('path');
const code = fs.readFileSync(path.resolve(__dirname, '../app/src/pages/Admin.jsx'), 'utf8');
const counts = { '{':0, '}':0, '(':0, ')':0, '[':0, ']':0 };
for (const ch of code) if (counts.hasOwnProperty(ch)) counts[ch]++;
console.log(JSON.stringify(counts,null,2));
// print surrounding context near first occurrence of problematic char sequences
function find(str){ const idx = code.indexOf(str); if(idx>=0){ const start=Math.max(0,idx-40); const end=Math.min(code.length, idx+40); console.log('\nContext for "'+str+'" at '+idx+':\n'+code.slice(start,end)); } }
find('/* Pending membership');
find('/* Reports */');
find('return (\n    <div>\n      <div style');
