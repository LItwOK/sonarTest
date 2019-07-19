rem @echo off

set oldPath=%cd%
cd  /d %~dp0

rem set environment variables:
set _devenv="C:\Program Files (x86)\Microsoft Visual Studio 14.0\Common7\IDE\devenv.com"
set _solution_file=%~1
set _configuration=%~2
set _platform=%~3
set _log=%~4

set _configPlatform="%_configuration%|%_platform%"
echo _devenv=%_devenv% >%_log%
echo _solution_file=%_solution_file% >>%_log%
echo _configPlatform=%_configPlatform% >>%_log%
echo _log=%_log% >>%_log%

echo [%DATE% %Time%] Start compile sequence >>%_log%
echo Used compile configuration is %buildAnyCPU% >>%_log%

rem Start compile************************************************
%_devenv% %_solution_file% /Rebuild %_configPlatform% /Out %_log%
if not %errorlevel% == 0 echo %_solution_file% failed! Error: %errorlevel% >>%_log%
if %errorlevel% == 0 echo %_solution_file% compiled successful >>%_log%
rem If compile failed stop processing:
echo [%DATE% %Time%] Finished compile sequence >>%_log%

cd  /d %oldPath%