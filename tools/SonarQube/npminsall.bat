:: ============================
:: Owner: sunyy-c
:: Co-Owner: 
:: ============================
@echo off
setlocal enabledelayedexpansion


cd %~dp0
set currentPath=%cd%
::这个相对路径要修改，要看免安装版的Nodejs放在哪里
cd..\..\ThirdParty\nodejs8.11.2
set nodePath=%cd%
set npmCommand=%nodePath%\npm

cd %currentPath%
%npmCommand%  install
