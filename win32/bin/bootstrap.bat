set THIS_FOLDER_TAIL=%~dp0
set THIS_FOLDER=%THIS_FOLDER_TAIL:~0,-1%

md node

curl -SsL --output cacert.pem  http://curl.haxx.se/ca/cacert.pem
curl -SsL --output node/node.exe  http://nodejs.org/dist/v0.10.20/x64/node.exe
call "node/node.exe" bootstrap.js