
const { timeEnd } = require('console');
const fs = require('fs');
const path = require('path')

function bak (b) {
  console.log(b)
}

bak(8)
// const appDirectory = fs.realpathSync(process.cwd());
// const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
// const pathi = resolveApp('build')
// console.log(appDirectory)
// console.log(pathi)
// const start = new Date().getTime()
console.time('st')
// const Dir = fs.realpathSync(process.cwd());
// const joinPath = (...paths) => path.join(Dir, ...paths) 
const joinPath = (...paths) => path.join(__dirname, ...paths) 

const ts = joinPath('yi', 'jehs', 'index.js')
console.timeEnd('st')
// const end = new Date().getTime()
// console.log(end - start)
console.log(ts)
// console.log(start)
