const fs = require('fs');
const path = require('path')

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
const pathi = resolveApp('build')
console.log(appDirectory)
console.log(pathi)


