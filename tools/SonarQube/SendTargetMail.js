let fs=require('fs');
let path=require('path')
let ErrorList=require('./ErrorList')
let config = require("./configs/TargetMailConfig.json")

let emailInfoPath=path.resolve(__dirname,'./configs/EmailInfo.json');

class EmailInfo
{
    constructor(to, priority, subject, content)
    {
        this.to=to;
        this.priority=priority;
        this.subject=subject;
        this.content=content;
    }
}

function sendSucceedMailNoIssue(subjectMsg, msg) {
    var emailInfos=new Array();
    var content='<p style = "color:black;font-size:100%;"><bold>'+msg+'</bold></p>';
    var email=new EmailInfo(config.succeedReceiver,'normal',subjectMsg,content);
    emailInfos.push(email);
    fs.writeFileSync(emailInfoPath,Json.stringify(emailInfos),'utf8');
    console.log("sendSucceedMailNoIssue");
}

function sendSucceedMailNoNewIssue(subjectMsg, msg) {
    var emailInfos=new Array();
    var content='<p style = "color:black;font-size:100%;"><bold>'+msg+'</bold></p>';
    var email=new EmailInfo(config.succeedReceiver,'normal',subjectMsg,content);
    emailInfos.push(email);
    fs.writeFileSync(emailInfoPath,Json.stringify(emailInfos),'utf8');
    console.log("sendSucceedMailNoNewIssue");
}

function sendSucceedMailHaveNewIssue(subjectMsg, msgStart, msgEnd, reiceivers, infos) {
    var emailInfos=new Array();
    for(var i=0;i<reiceivers.length;++i)
    {
        var content='<p style = "color:black;font-size:100%;"><bold>'
            +msgStart+infos[i]+msgEnd+'</bold></p>';
        let email=new EmailInfo(reiceivers[i],'normal',subjectMsg,content);
        emailInfos.push(email);
    }
    fs.writeFileSync(emailInfoPath,Json.stringify(emailInfos),'utf8');
    console.log("sendSucceedMailHaveNewIssue");
}

function sendExceptionMailEx(subjectMsg, msg) {
    var emailInfos=new Array();
    var content='<p style = "color:red;font-size:150%;"><bold>'+msg+'</bold></p>';
    var email=new EmailInfo(config.succeedReceiver,'normal',subjectMsg,content);
    emailInfos.push(email);
    fs.writeFileSync(emailInfoPath,Json.stringify(emailInfos),'utf8');
    console.log("sendExceptionMail");
}

exports.sendSucceedMailNoIssue = sendSucceedMailNoIssue;
exports.sendSucceedMailNoNewIssue = sendSucceedMailNoNewIssue;
exports.sendSucceedMailHaveNewIssue = sendSucceedMailHaveNewIssue;
exports.sendExceptionMailEx = sendExceptionMailEx;