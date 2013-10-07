set THIS_FOLDER_TAIL=%~dp0
set THIS_FOLDER=%THIS_FOLDER_TAIL:~0,-1%

md node

curl -SsL --output cacert.pem  http://curl.haxx.se/ca/cacert.pem

::/wget http://nodejs.org/dist/v0.10.20/x64/node.exe
::curl -SsL --output node/node.exe  http://nodejs.org/dist/v0.10.20/x64/node.exe
call "node/node.exe" bootstrap.js

::curl -SsL --output GetGnuWin32.exe  sourceforge.net/projects/getgnuwin32/files/getgnuwin32/0.6.30/GetGnuWin32-0.6.3.exe

::unzip npm.zip -d node
::cleanup
::del npm.zip


::"7zip/7z.exe" x -ogetgunwin32 getgnuwin32.exe
::del getgnuwin32.exe



 ::curl -SsL --cacert cacert.pem --output PortableGit.7z  https://msysgit.googlecode.com/files/PortableGit-1.8.4-preview20130916.7z
::"7zip/7z.exe" x -ogit PortableGit.7z

::SET PATH=%PATH%;%APPDATA%\npm