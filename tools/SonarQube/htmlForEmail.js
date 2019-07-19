/**
 * Created by sunyy-c on 2017/9/26.
 */
var SendTargetMail = require('./SendTargetMail')
var ip = require('./configs/IpConfig');
var ErrorList = require('./ErrorList')
//console.log(text);

function sendSonarQubeEmail(checkResults,emailReceivers, svnInfo)
{
    var result = new Array();
    var receiverAdresses=new Array();
    var personalResults=new Array();

    for(var person in emailReceivers)
    {
        var errList=emailReceivers.at(person);
        let personalInfo="<tr>";
        for(var i=0;i<errList.length;++i)
        {
            var err=errList[i];
            personalInfo = personalInfo+"<td align=\"center\">" + err.issueName +"</td>";
            personalInfo = personalInfo+"<td align=\"center\">" + err.fileName+": "+err.lineId +"</td>";
            personalInfo = personalInfo+"<td align=\"center\">" + err.issueInfo+"</td>";
            personalInfo = personalInfo + "</tr>";
        }
        receiverAdresses.push(person);
        personalResults.push(personalInfo);
    }

    var emailResultStart = "Please click here. http://" + ip.serverIP + ":9000/component_issues?id=trunk#resolved=false </br>";
    emailResultStart = emailResultStart + "问题定位方法： 打开链接，逐个检查每一个问题（双击问题，即可定位到出错的代码），如果发现该问题是由自己提交的代码导致的，请及时修改，否则请忽略，谢谢！</br>";
    emailResultStart = emailResultStart + "如有疑问，请联系 孙玉阳（sunyy-c），谢谢！</br>";
    emailResultStart = emailResultStart +"<h4>Total Issues Report:</h4>"
    emailResultStart = emailResultStart + "<table border=\"1\" ><tr><th>New issues</th><th>Resolved issues</th><th>issues</th></tr>";
    emailResultStart = emailResultStart + "<tr><td align=\"center\">"+checkResults[0]+"</td><td align=\"center\">"+checkResults[1]+"</td><td align=\"center\">"+checkResults[2]+"</td></tr></table>";
    emailResultStart = emailResultStart +"<h4 >Issues Report for every rules:</h4>"
    emailResultStart = emailResultStart + "<table border=\"1\" ><tr><th>Issue</th><th>Location</th><th>Information</th></tr>";

    var emailResultEnd = "</table>";

    if(result[0] == 0 && result[2] == 0)
    {
        var emailResult=emailResultStart+emailResultEnd;
        SendTargetMail.sendSucceedMailNoIssue("",emailResult);
    }

    if(result[0] == 0 && result[2] != 0)
    {
        var subjectMsg = "Code Check: Have Issues [Total:" + checkResults[2] +", Resolved:"+ checkResults[1] + "]";
        var emailResult=emailResultStart+emailResultEnd;
        SendTargetMail.sendSucceedMailNoNewIssue(subjectMsg,emailResult);
    }

    if(result[0] != 0 )
    {
        var emailNewIssue = "您最近提交的代码可能导致了本次问题，请及时更正</br>";
        emailResultStart = emailNewIssue + emailResultStart;
        emailResultEnd = emailResultEnd + svnInfo;
        var subjectMsg = "[重要]Code Check: Have New Issues [New:" + checkResults[0] + ", Total" + checkResults[2] +", Resolved:"+ checkResults[1] + "]";
        SendTargetMail.sendSucceedMailHaveNewIssue(subjectMsg,emailResultStart,emailResultEnd,receiverAdresses,personalResults);
    }
}

exports.sendSonarQubeEmail = sendSonarQubeEmail;
