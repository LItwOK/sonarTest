var fs=require('fs');

let errorArray=new Array();

class CheckError
{
    constructor(fileName,lineId,issueName,issueInfo)
    {
        this.fileName;
        this.lineId;
        this.issueName;
        this.issueInfo;
    }
};

function getErrorList(results)
{
    var fileContent=fs.readFileSync('./issues-report.html','UTF-8');
    var EOL = fileContent.indexOf('\r\n') >= 0 ? '\r\n' : '\n'; 
    var fileContentTemp = fileContent.split(EOL);
    if(fileContentTemp.length <=0)
    {
        console.log("error: issues-report.html is null. ");
         return ;
    }

    var summaryFlag = false;
    var newErrorFlag=false;
    var errRecordFlag=false;

    var lineId;
    var fileName;
    var issueName;
    var issueInfo;
    for (var i=0; i<fileContentTemp.length; ++i)
    {
        if(fileContentTemp[i].indexOf('<span class="big') >=0 )
        {
            console.log(fileContentTemp[i]);
            var lineArray = fileContentTemp[i].split('>');

            var valueArray = lineArray[1].split('<');
            results.push(valueArray[0]);
        }
        if(fileContentTemp[i].indexOf('<div id="summary-per-file">') >=0 )
        {
            summaryFlag = true;
        }
        if(summaryFlag && fileContentTemp[i].indexOf('<table width="100%" class="data all" id="') >=0 )
        {
            newErrorFlag = true;
        }
        if(summaryFlag && newErrorFlag && fileContentTemp[i].indexOf('<div class="file_title">') >=0 )
        {
            //获得文件名<fileName>
            var lineArray=fileContentTemp[i+1].split('"');
            fileName=lineArray[3].replace("trunk:","");
        }
        if(summaryFlag && newErrorFlag && !errRecordFlag)
        {
            //在文件<fileName>中出现错误，定位到行号<lineId>
            var line=fileContentTemp[i].match(/<tr id=\"[0-9]*LV[0-9]*\" class=\"row\">/gm);
            if(!line)
                continue;
            var nums=line[0].match(/LV\d/);
            lineId=parseInt(nums[0].replace("LV",""));
            errRecordFlag=true;
        }
        if(summaryFlag && newErrorFlag && errRecordFlag
            && fileContentTemp[i].indexOf('<div class="issue"') >=0)
        {
            //读取错误信息<issueInfo>
            var line=fileContentTemp[i+3];
            issueInfo=line.replace("<span class=\"rulename\">","");
            issueInfo=issueInfo.replace("</span>","");
            issueInfo=issueInfo.replace(/^\s*/,'');
            //读取错误名称<issueName>
            line=fileContentTemp[i+14];
            issueName=line.replace("<span class=\"rule_key\">","");
            issueName=issueName.replace("</span>","");
            issueName=issueName.replace(/^\s*/,'');
            //建立新错误，并输入到错误列表
            let err=new CheckError(fileName,lineId,issueName,issueInfo);
            errorArray.push(err);
            errRecordFlag=true;
        }
        if(summaryFlag && newErrorFlag && errRecordFlag && fileContentTemp[i].indexOf('</tr>') >=0)
        {
            errRecordFlag=false;
        }
        if( summaryFlag && newErrorFlag && fileContentTemp[i].indexOf('</table>') >=0)
        {
            newErrorFlag=false;
        }
    }
    return errorArray;
}

exports.getErrorList=getErrorList;
exports.CheckError=CheckError;