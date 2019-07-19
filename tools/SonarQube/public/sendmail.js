let mailer = require("nodemailer");
let smtpTransport = require('nodemailer-smtp-transport');

exports.sendMail = (mail, callback) => {
    let login = {
        host: "mail.glodon.com",
        port: 587,
        auth: {
            user: "GBMPBuilder1",
            pass: "shennong@123.com"
        }
    };
    let tranporter = mailer.createTransport(smtpTransport(login));
    if (callback === undefined)
        callback = (err,response)=>{};
    tranporter.sendMail(mail, callback);
    tranporter.close();
};


//e.g 下面是一个被注释掉的例子工程，使用者可直接拿去运行
// let sendEmail = require('./sendMail');
// var myDate = new Date().toLocaleString();//获取日期与时�?
// let msg = myDate + "email send successful!";
// let mail = {
//     from :"<GBMPBuilder@glodon.com>",
//     to : "xuxt@glodon.com",
//     subject: "test email: " ,
//     priority: 'high',
//     html: `<p style = "color:red;font-size:150%;"><bold>${msg}</bold></p>`,
//     generateTextFromHtml: true
// }
// function testEmail(){  
//     sendEmail.sendMail(mail);
// }
// testEmail();



