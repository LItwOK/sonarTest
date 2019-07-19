:: ============================
:: Owner: sunyy-c
:: Co-Owner: 
:: ============================
::@echo off
call md cppCheckReport
echo "starting to cppCheck......" >>.\cppCheckReport\cppCheckTime.txt
set str_time_first_bit="%time:~0,1%" 
if %str_time_first_bit%==" " ( 
set str_date_time=%date:~0,4%%date:~5,2%%date:~8,2%_0%time:~1,1%%time:~3,2%%time:~6,2% 
)else ( 
set str_date_time=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2% 
) 
set logname=%str_date_time%.log 

echo %str_date_time% >>.\cppCheckReport\cppCheckTime.txt
call cppcheck --project=..\..\bin\X64BuildProject\GBMP.sln --xml-version=2  2>.\cppCheckReport\cppCheckReport.xml >.\cppCheckReport\cppCheckLog.txt
echo "Ending to cppCheck......" >>.\cppCheckReport\cppCheckTime.txt
set str_time_first_bit="%time:~0,1%" 
if %str_time_first_bit%==" " ( 
set str_date_time=%date:~0,4%%date:~5,2%%date:~8,2%_0%time:~1,1%%time:~3,2%%time:~6,2% 
)else ( 
set str_date_time=%date:~0,4%%date:~5,2%%date:~8,2%_%time:~0,2%%time:~3,2%%time:~6,2% 
) 
set logname=%str_date_time%.log  

echo %str_date_time% >>.\cppCheckReport\cppCheckTime.txt

call sonar-scanner -Dsonar.analysis.mode=preview -Dsonar.issuesReport.html.enable=true
call md issues-report-copy
call xcopy .\issues-report\* .\issues-report-copy /A /E /Y
call sonar-scanner
