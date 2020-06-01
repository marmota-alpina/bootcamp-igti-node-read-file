const fs = require('fs');

const mkdir = (dir_name, recursive = false) => new Promise((resolve, reject) => {
    fs.mkdir(dir_name, {recursive}, (err) => {
        if (err)
            reject(err)
        else
            resolve(dir_name);
    });
});

const rmDir = (path) => new Promise((resolve, reject) => {
    let deleteFolderRecursive = function(path) {
        if( fs.existsSync(path) ) {
            fs.readdirSync(path).forEach(function(file,index){
                let curPath = path + "/" + file;
                if(fs.lstatSync(curPath).isDirectory()) {
                    deleteFolderRecursive(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    };

    try{
        deleteFolderRecursive(path);
        resolve(true);
    }catch (e) {
        reject(e);
    }
});

const touch = async (file_name) => {

};

const cat = (file_name, encoding = 'utf8', callback = null) => {
    if (!callback) {
        callback = (err, data) => {
            if (!err) {
                console.log(data);
            }
        }
    }
    return fs.readFile(file_name, encoding, callback);
};

const read = (fileName) => new Promise((resolve, reject)=>{
   cat(fileName,'utf8', (err, data)=>{
        if(err)
            reject(err)
        else resolve(JSON.parse(data))
    });
});
const create =  (file_name, data) => new Promise((resolve, reject) => {
    fs.writeFile(file_name, data, function (err) {
        if (err) {
            reject(err);
        }
        resolve(file_name);
    });
});

async function ls(path, returned = false) {
    const dir = await fs.promises.opendir(path);
    let files = '';
    for await (const dirent of dir) {
        var file = `${dir.path}${dirent.name}`;
        if (!returned)
            console.log(file);
        files.concat(file);
    }
    return files;
}


//fs.readFile('package.json','utf8', (err, data) => { if (err) throw err; console.log(JSON.parse(data.toString()).description); });

module.exports = {
    FileSystem: {
        mkdir,
        touch,
        cat,
        ls,
        rmDir,
        create,
        read
    }
}