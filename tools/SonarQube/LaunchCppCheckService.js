// Owner: luoty
// Co-Owner: 
let later = require('later');
let CppCheckService = require("./CppCheckService");

let textSched = later.parse.text('every 30 sec');
later.setInterval(CppCheckService.runCppCheckService, textSched);
//BuildService.runBuildService();
