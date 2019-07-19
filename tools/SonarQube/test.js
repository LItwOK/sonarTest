let path=require('path');
let fs = require('fs');
let info=path.resolve(__dirname, './configs/EmailInfo.json');
let infodata=require(info);

var lo=new Array();
class Good
{
    constructor(love,ok)
    {
        this.love=love;
        this.ok=ok;
    }
}
var good1=new Good("1","2");
var good2=new Good("3","4");
var good3=new Good("5","6");
lo.push(good1);
lo.push(good2);
lo.push(good3);
fs.writeFileSync(info,JSON.stringify(lo),'utf8');
console.log('OK');