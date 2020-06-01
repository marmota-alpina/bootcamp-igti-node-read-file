const cp = require('child_process');

const download = (uri, filename) => new Promise ((resolve, reject)=> {
    try{
        const command = `curl -o ${filename}  '${uri}'`;
        const response = cp.execSync(command);
        resolve(response);

    }catch (e) {
        reject(e)
    }
});

module.exports = {
    Download: {
        curl: download,
    }
}