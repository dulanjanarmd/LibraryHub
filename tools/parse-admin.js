const fs = require('fs');
const path = require('path');
const parser = require(path.resolve(__dirname, '../app/node_modules/@babel/core/node_modules/@babel/parser'));
const code = fs.readFileSync(path.resolve(__dirname, '../app/src/pages/Admin.jsx'), 'utf8');
try {
  parser.parse(code, { sourceType: 'module', plugins: ['jsx', 'classProperties', 'dynamicImport', 'optionalChaining'] });
  console.log('Parse OK');
} catch (err) {
  console.error('Parse error:');
  console.error(err.message);
  if (err.loc) console.error('At', err.loc);
  // continue to print context
}
// print raw context around reported position
const idx = (function(){ try{ return require('fs').readFileSync(require('path').resolve(__dirname,'../app/src/pages/Admin.jsx'),'utf8').split('\n').slice(0,597).join('\n').length + 1 }catch(e){return 22959}})();
const start = Math.max(0, idx - 40);
const end = Math.min(code.length, idx + 40);
console.log('\nRaw context chars:');
console.log(code.slice(start,end));
console.log('\nChar codes:');
console.log(Array.from(code.slice(start,end)).map(c=>c.charCodeAt(0)).join(' '));
