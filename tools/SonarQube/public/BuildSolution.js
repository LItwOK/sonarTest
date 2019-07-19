// Owner: xuxt
// Co-Owner: 
let execSync = require('child_process').execSync;
let execFileSync = require('child_process').execFileSync;
let fs = require('fs');
let path = require('path');
let iconv = require('iconv-lite');
let config = require("../configs/BuildConfig.json");
let git = require("./GitOperation");


"use strict";
const displayCount = 500;

let isContinue = true;
let isBuildingCodeFailed = false;
let failedMsg = "";

let isNeedBuildGGP = false;
let isNeedBuildGBMP = false;
let isMustBuildGgp = false;
let isMustBuildGBMP = false;
let commitAuthor = "";
let commitDate = "";
let commitMsg = "";
let buildLogContent = "";

function generateProFile(version,configuration,ismustBuildGbmp,ismustBuildGgp)
{
    var buildBinFilePath = config.filePath + "\\bin";
    var buildLogFilePath = buildBinFilePath + "\\x64" + configuration + "Logs";
    var buildLogFileName = buildLogFilePath + "\\buildLog" + version + ".txt";
    var ggpBuildLogFileName = buildLogFilePath + "\\GgpBuildLog" + version + ".txt";

    isMustBuildGbmp = ismustBuildGbmp;
    isMustBuildGgp = ismustBuildGgp;
    if(isMustBuildGgp) {
        //删除上次自动生成的ggp_gbmp文件
        console.log("delete generated files by ggp");
        deleteFolder(config.ggpFilePath);
        console.log("delete generated files by ggp successful!");
        //生成GGP工程文件
        console.log("start run Update_GGP.bat");
        let batFilePath = config.filePath + "\\Update_GGP.bat";
        try{
            execFileSync(batFilePath);
        }
        catch(ex)
        {
            console.log(ex);
            isBuildingCodeFailed = true;
            return;
        }
        console.log("end run Update_GGP.bat");
        if (fs.existsSync(buildLogFileName)) {
            fs.unlinkSync(buildLogFileName);
            console.log("delete " + buildLogFileName);
        }
    }
    //生成GBMP.sln文件
    var trunkPath = config.filePath;
    if (isMustBuildGbmp) {
        console.log("delete " + trunkPath + "\\bin\\Win32BuildProject");
        deleteFolder(trunkPath + "\\bin\\Win32BuildProject");
        console.log("delete " + trunkPath + "\\bin\\X64BuildProject");
        deleteFolder(trunkPath + "\\bin\\X64BuildProject");

        console.log("start run Update_GBMP_X64.bat");
        let batFilePath = trunkPath + "\\Update_GBMP_X64.bat";
        try{
            execFileSync(batFilePath);
        }
        catch(ex)
        {
            console.log(ex);
            isBuildingCodeFailed = true;
            return;
        }
        console.log("end run Update_GBMP_X64.bat");

        if (fs.existsSync(ggpBuildLogFileName)) {
            fs.unlinkSync(ggpBuildLogFileName);
            console.log("delete " + ggpBuildLogFileName);
        }
    }

    
    
}


function buildSolution(version, buildLogFileName, ggpBuildLogFileName,configuration) {
    console.log("Git:"+version+" build solution.");
    var trunkPath = config.filePath;
    //生成GBMP.sln和NewGGP.sln文件
    //这里这个条件仅仅是针对现有服务的，通用性很差，有新的服务后需要调整
    if(!isMustBuildGbmp || !isMustBuildGgp) {
        console.log("start generate GBMP.sln!");
        generateProFile(version,configuration,isNeedBuildGBMP,isNeedBuildGGP);
        console.log("end generate GBMP.sln!");
    }

    var exePath = '"' + config.devenvExePath + '"';
    if (isNeedBuildGGP) {
        console.log("GGP  is building.......");
        var buildPath = path.resolve(trunkPath + "\\ggp_gbmp\\Build\\GGP_VS2015_X64", "NewGGP.sln");
        console.log(buildPath);
        if (configuration == "Debug") {
            var buildCommand = `${exePath} ${buildPath}  /Clean  "Debug|x64"`;
            execSync(buildCommand);

            let args = [];
            args.push(buildPath);
            args.push("Debug");
            args.push("x64");
            args.push(ggpBuildLogFileName);
            execFileSync('BuildSolution.bat', args);
        }
        else {
            var buildCommand = `${exePath} ${buildPath}  /Clean  "Release|x64"`;
            execSync(buildCommand);

            let args = [];
            args.push(buildPath);
            args.push("Release");
            args.push("x64");
            args.push(ggpBuildLogFileName);
            execFileSync('BuildSolution.bat', args);
        }


        readBuildLog(ggpBuildLogFileName, version);
    }

    if(!isContinue) {
        console.log("GGP build failed!")
        return isBuildingCodeFailed;
    }
    if (isNeedBuildGBMP) {
        console.log("GBMP is building.......");
        deleteFolder(trunkPath + "\\bin\\Intermediate");
        deleteFolder(trunkPath + "\\bin\\x64" + configuration);
        var buildPath = path.resolve(trunkPath + "\\bin\\X64BuildProject", "GBMP.sln");
        console.log(buildPath);
        if(configuration == "Debug") {
            var buildCommand = `${exePath} ${buildPath}  /Clean  "Debug|x64"`;
            execSync(buildCommand);
    
            let args = [];
            args.push(buildPath);
            args.push("Debug");
            args.push("x64");
            args.push(buildLogFileName);
            execFileSync('BuildSolution.bat', args);
        }
        else {
            var buildCommand = `${exePath} ${buildPath}  /Clean  "Release|x64"`;
            execSync(buildCommand);
    
            let args = [];
            args.push(buildPath);
            args.push("Release");
            args.push("x64");
            args.push(buildLogFileName);
            execFileSync('BuildSolution.bat', args);
        }

        readBuildLog(buildLogFileName, version);
        if(!isContinue) {
            console.log("GBMP build failed!")
            return isBuildingCodeFailed;
        }
    }
}

function buildSourceCode(version,configuration) {
    "use strict";
    var buildBinFilePath = config.filePath + "\\bin";
    var buildLogFilePath = buildBinFilePath + "\\x64" + configuration + "Logs";
    var buildLogFileName = buildLogFilePath + "\\buildLog" + version + ".txt";
    var ggpBuildLogFileName = buildLogFilePath + "\\GgpBuildLog" + version + ".txt";
    if (!fs.existsSync(buildBinFilePath)) {
        fs.mkdirSync(buildBinFilePath.toString(), 777, function (err) {
            if (err) {
                isContinue = false;
                failedMsg = "mkdirSync ${buildBinFilePath.toString()} failed with err ${err}";
                throw err;
            }
        });
    }

    if (!fs.existsSync(buildLogFilePath)) {
        fs.mkdirSync(buildLogFilePath.toString(), 777, function (err) {
            if (err) {
                isContinue = false;
                failedMsg = "mkdirSync ${buildLogFilePath.toString()} failed with err ${err}";
                throw err;
            }
        });
    }

    buildSolution(version, buildLogFileName, ggpBuildLogFileName,configuration);

    // if (isNeedBuildGBMP || isNeedBuildGGP) {
    //     readBuildLog(buildLogFileName, version);
    // }
}


function readBuildLog(logFilePath, version) {
    "use strict";
    console.log("logfilePath:" + logFilePath);

    if (!fs.existsSync(logFilePath)) {
        isContinue = false;
        failedMsg = failedMsg + "<br>" + logFilePath + " is not exist.";
        console.log(failedMsg);
        return;
    }

    let content = fs.readFileSync(logFilePath, 'utf8');
    
    var EOL = content.indexOf('\r\n') >= 0 ? '\r\n' : '\n';
    var fileContent = content.split(EOL);
    for (var i = 0; i < fileContent.length; ++i) {
        var failedResult = fileContent[i].match(/==========(.)*==========/gm);
        if (failedResult != null) {
            var numbers = failedResult[0].match(/[0-9]+/gm);
            if(numbers.length == 3 && numbers[1] == "0"){
                console.log("build successed by reading log file");
            }
            else {
                isContinue = false;
                isBuildingCodeFailed = true;
                console.log("Read " + path.basename(logFilePath) + ",compile the project failed!");
                break;
            }
        }
        else {
            continue;
        }
    }

    var EOL = content.indexOf('\r\n') >= 0 ? '\r\n' : '\n';
    var reg = new RegExp(EOL, 'igm');
    buildLogContent = content.replace(reg, "<br>");
    if (isBuildingCodeFailed) {
        if (!isContinue) {
            failedMsg = buildLogContent + "<br>" + failedMsg; //失败和异常信息都发送
            console.log("Compile the abnormal. ");
        }
        else {
            failedMsg = buildLogContent;
        }

        console.log("Read log txt,compile the project failed!");
    }

    return buildLogContent;
}

function deleteFolder(path) {
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) {
                deleteFolder(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
}

function initData() {
    isContinue = true;
    isBuildingCodeFailed = false;
    failedMsg = "";
    commitAuthor = "";
    commitDate = "";
    commitMsg = "";
}
//生成sln工程，并build。version表示编译的是哪次提交的；config决定编译的是debug的还是release的
function buildProject(version,configuration,ismustBuildGbmp,ismustBuildGgp){
    "use strict";
    isMustBuildGgp = ismustBuildGgp;
    isMustBuildGbmp = ismustBuildGbmp;
    //readBuildLog("E:\\git_trunk\\gm\\bin\\x64ReleaseLogs\\buildLog8d16e5f9a1c026207363063625437eab03022336.txt","8d16e5f9a1c026207363063625437eab03022336");
    console.log("Start building version:" + version);
    initData();

    //判断是否需要编译ggp
    isNeedBuildGBMP = false;
    const result = git.getGitShowLogContent(version);
    commitMsg = git.getLogContent(version);

    if (result.indexOf("ggp_gbmp") > -1) {
        isNeedBuildGGP = true;
        isNeedBuildGBMP = true;
    }
    else if (result.indexOf("source") > -1) {
        isNeedBuildGBMP = true;
    }

    if(isMustBuildGbmp)
        isNeedBuildGBMP = true;
    if(isMustBuildGgp)
        isNeedBuildGGP = true;
    console.log("version:" + version + " isNeedBuildGGP:" + isNeedBuildGGP.toString() + " isNeedBuildGBMP:" + isNeedBuildGBMP.toString());
    console.log("log:" + commitMsg);

    buildSourceCode(version,configuration);
    if (!isNeedBuildGBMP && !isNeedBuildGGP) {
        console.log("No source code update。Don't need to compile.");
        return isBuildingCodeFailed;
    }

    console.log("isBuildingCodeFailed: " + isBuildingCodeFailed.toString());
    return isBuildingCodeFailed;
}

exports.buildProject = buildProject; //从编译指定版本的GBMP源码
exports.generateProFile = generateProFile; //为指定版本生成工程文件

//buildProject("8d16e5f9a1c026207363063625437eab03022336","Release",false,false);



