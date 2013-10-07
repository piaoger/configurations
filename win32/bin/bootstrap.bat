set THIS_FOLDER_TAIL=%~dp0
set THIS_FOLDER=%THIS_FOLDER_TAIL:~0,-1%

md node

curl -SsL --output cacert.pem  http://curl.haxx.se/ca/cacert.pem
call "node/node.exe" bootstrap.js