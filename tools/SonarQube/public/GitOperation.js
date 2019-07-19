// Owner: xuxt
// Co-Owner: 
let execSync = require("child_process").execSync;

let month = new Array();
month['Jan'] = '01';
month['Feb'] = '02';
month['Mar'] = '03';
month['Apr'] = '04';
month['May'] = '05';
month['Jun'] = '06';
month['Jul'] = '07';
month['Aug'] = '08';
month['Sep'] = '09';
month['Oct'] = '10';
month['Nov'] = '11';
month['Dec'] = '12';

const displayCount = 500;
//时间格式转换
function toDateFormat(date,format) {
    var elemDates = date.split(" ");
    var length = elemDates.length;
    var dateYMD = elemDates[length-2] + month[elemDates[length-5]] + elemDates[length-4];
    if(format == "YMD") {
        return dateYMD;
    }
    else if(format == "YMDHMS") {
        return dateYMD + "_" + elemDates[length-3].replace(/:/g,"");
    }
    else {
        console.log("There is no this kind of format！");
        return "";
    }
}
//获得指定版本的git show命令的log信息，里面含有具体哪些文件在这次提交中的改动
function getGitShowLogContent(version){
    var versionCommand = `git show --stat=${displayCount}  ${version}`;
    var execContent = execSync(versionCommand);
    var versionContent = execContent.toString('utf8');
    return versionContent;
}
//获得当前工作目录所在分支的本地的最新提交的log信息
function getCurrentGitVersion() {
    "use strict";
    var versionCommand = `git log -1`;
    var execContent = execSync(versionCommand);
    var versionCommandContent = execContent.toString('utf8');
    var result = versionCommandContent.match(/commit ([a-z]|[0-9]){40}/gm);
    var versionList = result[0].replace("commit ","");
    return versionList;
}

//获得指定提交version的Author
function getAuthor(version) {
    "use strict";
    var versionCommandContent = getLogContent(version);
    //var author = versionCommandContent.match(/Author: (.)*@glodon.com>/gm);
    var author = versionCommandContent.match(/Author: (.)*>/gm);
    var commitAuthor = author[0].match(/ (.)* </m);
    var result = commitAuthor[0].replace(" ","");
    result = result.replace("<","");
    return result;
}

//获得指定提交version的Author Email
function getAuthorEmail(version) {
    "use strict";
    var versionCommandContent = getLogContent(version);
    //var author = versionCommandContent.match(/Author: (.)*@glodon.com>/gm);
    var author = versionCommandContent.match(/Author: (.)*>/gm);
    var commitAuthorEmail = author[0].match(/<(.)*>/m);
    var result = commitAuthorEmail[0].replace(" ","");
    result = result.replace("<","");
    result = result.replace(">","");
    return result;
}

//获得指定提交version的Date
function getDate(version,format) {
    "use strict";
    var versionCommandContent = getLogContent(version);
    var date = versionCommandContent.match(/Date:   (.)*\+0800/gm);
    var commitDate = toDateFormat(date[0],format);
    return commitDate;
}

//获得指定提交version的CommitDate
function getCommitDate(version,format) {
    "use strict";
    var versionCommand = `git log --pretty=fuller ${version} -1`;
    var execContent = execSync(versionCommand);
    var versionCommandContent = execContent.toString('utf8');
    var date = versionCommandContent.match(/CommitDate: (.)*/gm); 
    var pushDate = toDateFormat(date[0],format);
    return pushDate;
}

//获得指定版本提交说明
function getLogDescription(version) {
    "use strict";
    var versionCommand = `git log ${version} -1  --pretty=format:"%s"`;
    var execContent = execSync(versionCommand);
    var versionCommandContent = execContent.toString('utf8');
    return versionCommandContent;
}

//获得指定版本提交的log内容说明
function getLogContent(version) {
    "use strict";
    var versionCommand = `git log ${version} -1`;
    var execContent = execSync(versionCommand);
    var versionCommandContent = execContent.toString('utf8');
    return versionCommandContent;
}

//获的两个版本之间的提交,startVersion->endVersion 从老到新
function getGitVersionList(startVersion, endVersion) {
    "use strict";
    var versionList = [];
    var versionCommand = `git log ${startVersion}..${endVersion}`;
    var execContent = execSync(versionCommand);

    var version = execContent.toString('utf8');
    var result = version.match(/^commit ([a-z]|[0-9]){40}/gm);
    if (result != null) {
        for (var j = 0; j < result.length; ++j) {
            versionList[j] = result[j].replace("commit ", "");
        }
    }
    else {
        console.log("versionList is null!");
    }

    return versionList;
}
//将代码重置到指定版本
function ResetToSpecVersion(version) {
    var resetCommand = `git reset --hard ${version} && git submodule update`;
    var execContent = execSync(resetCommand);
    if(execContent.toString('utf8').indexOf("fatal") > -1) {
        return false;
    }
    else {
        return true;
    }
}

//在git工作目录下拉取远程最新代码,拉取成功返回true,失败返回false
function pullSource() {
    "use strict";
    var pullCommand = `git pull`;
    var execContent = execSync(pullCommand);
    var pullCommandStatusContent = execContent.toString('utf8');
    if(pullCommandStatusContent.indexOf("fatal") > -1) {
        return false;
    }
    else {
        return true;
    }
        
}

function getErrorCommitters(startVersion, endVersion, errFile, errLine)
{
    "use strict";
    var logCommand = `git log --pretty=format:"<%ce>" ${startVersion}..${endVersion} -L ${errLine},${errLine}:${errFile}`;
    var execContent = execSync(logCommand);
    var committers = execContent.match(/^<(.)*>)/gm);
    if (committers == null) {
        console.log("versionList is null!");
    }
    return committers;
}


exports.getCurrentGitVersion = getCurrentGitVersion;　//得到Git服务器上最新版本号
exports.pullSource = pullSource; //使用git拉取最新代码
//exports.ResetToSpecVersion = ResetToSpecVersion;　//将代码重置到指定版本
exports.getGitVersionList = getGitVersionList; //获的两个版本之间的提交
exports.getLogContent = getLogContent;　//获得指定版本提交的log内容
exports.getCommitDate = getCommitDate; //获得指定提交version的CommitDate
//exports.getDate = getDate;　//获得指定提交version的Date
exports.getAuthor = getAuthor; //获得指定提交version的Author
exports.getAuthorEmail = getAuthorEmail; //获得指定提交version的Author Email
exports.getLogDescription = getLogDescription; //获得指定版本提交说明
exports.getGitShowLogContent = getGitShowLogContent; //获得指定版本的git show命令的log信息，里面含有具体哪些文件在这次提交中的改动
//test only
exports.getErrorCommitters=getErrorCommitters;


