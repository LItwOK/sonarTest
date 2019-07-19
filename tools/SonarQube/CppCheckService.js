// Owner: luoty
// Co-Owner: 
let fs = require('fs');
let path = require('path');
var sleep = require('system-sleep');
let config = require("./configs/BuildConfig.json");
let git = require("./public/GitOperation");
let build = require("./public/BuildSolution.js")
let execSync = require('child_process').execSync;
let execFileSync = require('child_process').execFileSync;
let SendSonarQubeMail = require("./htmlForEmail");
var SendTargetMail = require('./SendTargetMail')
var ErrorList = require('./ErrorList')
"use strict";
let buildVersionJson = path.resolve(__dirname, './configs/BuildVersion.json');
let buildVersionData = require(buildVersionJson);
/*
let isContinue = true;
let isBuildingCodeFailed = false;
let failedMsg = "";

let commitAuthor = "";
let commitDate = "";
let commitMsg = "";
let buildLogContent = "";
*/
function saveBuildRevision(version) {
    "use strict";
    buildVersionData.version = version;
    fs.writeFileSync(buildVersionJson, JSON.stringify(buildVersionData), 'utf8');
}

function sendExceptionMail(e) {
    console.log(e.stack);
    console.log("JS throw exception send mail.");
    let subjectMsg = "exception";
    var reg = new RegExp("\r\n", 'igm');
    let msg = "JS throw exception" + ":<br>" + e.name + ":<br>" + e.message + "<br>" + e.stack.replace(reg, "<br>");
    SendTargetMail.sendExceptionMailEx(subjectMsg, msg);
}

function updateGbmpProjectConfiguration(version, configuration)
{
    "use strict";
    var start = new Date();
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
    console.log("start generate GBMP.sln!");
    build.generateProFile(version,configuration,true,false);
    console.log("end generate GBMP.sln!");
    var end = new Date();
    var elapsed = end.getTime() - start.getTime();
    console.log("updated Gbmp version " + version + " elapsed:" + elapsed.toString());
    saveBuildRevision(version);
}

function getCommitters(versionList)
{
    "use strict";
    var committerList = Array();
    for (var i = 0; i < versionList.length; i++) {
        var email = git.getAuthorEmail(versionList[i])
        committerList.push(email);
    }
    committerList = [...new Set(committerList)];
    return committerList;
}

function getGitInfo(versionList)
{
    "use strict";
    var gitInfo="<p><b>SVN 信息：</p></b>";
    gitInfo = gitInfo + "------------------------------------------------------------------------</br>";
    for (var i = 0; i < versionList.length; i++) {
        var author = git.getAuthor(versionList[i])
        var commitTime = git.getCommitDate(versionList[i], "YMDHMS");
        var log = git.getLogDescription(versionList[i])
        gitInfo = gitInfo + versionList[i] + "|" + author + "|" + commitTime + "</br></br></br>";
        gitInfo = gitInfo + log + "</br></br>";
        gitInfo = gitInfo + "------------------------------------------------------------------------</br>";
    }
    return gitInfo
}

function runCppCheckService() {
    "use strict";
    try {
        console.log("Begin runBuildService..........");
        isContinue = true;
        if(!git.pullSource()) {
            console.log("pull Source Code failed!");
            isContinue = false;
            return;
        }
        else {
            console.log("pull Source Code successful!");
            isContinue = true;
        }

        var maxVersion = git.getCurrentGitVersion();
        var lastBuildVersion = buildVersionData.version;
        var versionList = git.getGitVersionList(lastBuildVersion, maxVersion);//TODO: 错误定位
        //var committerList = getCommitters(versionList);
        var gitInfo = getGitInfo(versionList);

        if (versionList.length <= 0) {
            console.log("Don't need to compile.");
            return;
        }
        else if (versionList.length == 1) { //只有一个，但不包括lastBuildVersion时（手动调整lastBuildVersion时会出现此现象，非手动调整时不应出现此现象）
            if (lastBuildVersion == maxVersion) {
                console.log("Don't need to compile.");
                return;
            }
            else {
                versionList.push(maxVersion);
            }
        }

        var buildVersion = versionList[0];
        if(buildVersion == lastBuildVersion) {
            buildVersion = versionList[versionList.length-2];
            let subjectMsg = "BuildService occurs special status ,please be care for it!";
            sendExceptionMailEx(subjectMsg, "Extracted fatal buildversion!");
        }

        updateGbmpProjectConfiguration(buildVersion, "Release");

        let batFilePath = "runCppcheckAndSonarQube.bat";
        try{
            console.log("runCppcheckAndSonarQube.");
            execFileSync(batFilePath);
        }catch(e){
            console.log(e.stack);
        }

        //test only 建立错误和提交者的对应关系
        var checkResults=new Array();
        var errList=ErrorList.getErrorList(checkResults);
        var emailReceivers=new Map();
        for(var i=0;i<errList.length;++i)
        {
            var committers=git.getErrorCommitters(lastBuildVersion,maxVersion,errArray[i].fileName,errArray[i].lineId);
            for(var j=0;j<committers.length;++j)
            {
                var cmter=committers[j];
                if(!emailReceivers.has(cmter))
                {
                    let hisErrors=new Array();
                    hisErrors.push(errList[i]);
                    emailReceivers.set(cmter,hisErrors);
                }
                else
                {
                    let hisErrors=emailReceivers.get(cmter);
                    hisErrors.push(errList[i]);
                    emailReceivers.set(cmter, hisErrors);
                }
            }
        }

        //var committer="";
        //for(var i=0; i<committerList.length; i++) {
        //    committer += (committerList[i] + ";");
        //}

        SendSonarQubeMail.sendSonarQubeEmail(checkResults,emailReceivers, gitInfo);

        console.log("End runBuildService..........");
        sleep(10000);
    }
    catch (e) {
        sendExceptionMail(e);
    }
}
//runCppCheckService();
exports.runCppCheckService = runCppCheckService; //编译和打包上次成功后的下一个版本

