var fs = require('fs');
var exec = require('child_process').exec,
    child;
var packet = {
    module: {}
};
var fname = 'ipm.json';

if (fs.existsSync(fname)) {
    packet = JSON.parse(fs.readFileSync(fname))
}
var cmd = process.argv[2];
var git = process.argv[3];

function help() {
    console.log('indosystem package manager');
    console.log('      ipm install GITHUB_USER/REPONAME');
    console.log('      ipm remove GITHUB_USER/REPONAME');
    console.log('      ipm update GITHUB_USER/REPONAME');
    console.log('      ipm list');
}
if (!cmd || cmd == 'help') {
    help();
    process.exit();
}
var target = process.argv[4];
if (!target) {
    target = 'ipm_modules';
}

function updateConf(packet) {
    fs.writeFile(fname, JSON.stringify(packet), function (err) {
        if (err) throw err;
        console.log('success');
    });
}
var deleteFolderRecursive = function (path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

function gitClone(git, target, update) {    
    var url = 'git clone https://github.com/' + git + '.git ' + target;    
    child = exec(url,
        function (error, stdout, stderr) {
            console.log('install ' + git);
            console.log(stdout);
            if (error !== null) {
                console.log('->' + error);
            } else {
                update && updateConf(packet);
            }
        });
}

if (cmd == 'install' && git && git.indexOf('/') >= 0) {
    o = {};
    o.git = git;
    o.target = target;
    packet.module[git.replace('/', '.')] = o;
    gitClone(git, target, true);

} else
if (cmd == 'install' && !git) {
    for (var n in packet.module) {
        var o = packet.module[n];
        gitClone(o.git, o.target);

    }
} else
if (cmd == 'update' && git && git.indexOf('/') >= 0) {
    var names = git.split('/');
    var name = names[1];
    var pack = packet.module[git.replace('/', '.')];
    if (!pack) {
        console.log('module not exist');
        process.exit();
    }
    var tpath = pack.target;
    if (!tpath) {
        tpath = '.';
    }

    child = exec("cd " + tpath + " && git reset --hard && git pull origin master",
        function (error, stdout, stderr) {
            console.log('update ' + git);
            console.log(stdout);
            if (error !== null) {
                console.log('exec error: ' + error);
            } else {
                //update && updateConf(packet);
            }
        });
} else
if (cmd == 'list') {
    console.log(packet.module);
    process.exit();
} else
if (cmd == 'upgrade') {
    child = exec("wget  " + tpath + " && git reset --hard && git pull origin master",
        function (error, stdout, stderr) {
            console.log('update ' + git);
            console.log(stdout);
            if (error !== null) {
                console.log('exec error: ' + error);
            } else {
                //update && updateConf(packet);
            }
        });
} else
if (cmd == 'remove' && git && git.indexOf('/') >= 0) {
    var names = git.split('/');
    var name = names[1];
    var pack = packet.module[git.replace('/', '.')];
    if (!pack) {
        console.log('module not exist');
        process.exit();
    }
    var tpath = pack.target;
    if (!tpath) {
        tpath = '.';
    }
    delete packet.module[git.replace('/', '.')];
    deleteFolderRecursive(tpath + '/' + name);
    updateConf(packet);
} else {
    help();
}