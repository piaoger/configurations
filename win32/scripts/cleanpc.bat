
echo Start up to clean PC

del /f /s /q %systemdrive%\*.dmp
del /f /s /q %systemdrive%\*.tmp
del /f /s /q %systemdrive%\*._mp
del /f /s /q %systemdrive%\*.log
del /f /s /q %systemdrive%\*.gid
del /f /s /q %systemdrive%\*.chk
del /f /s /q %systemdrive%\*.old

echo "----------------------------"

del /f /s /q %systemdrive%\recycled\*.*
del /f /s /q %windir%\*.bak
del /f /s /q %windir%\prefetch\*.*
rd /s /q %windir%\temp & md %windir%\temp
del /f /q %userprofile%\cookies\*.*
del /f /q %userprofile%\recent\*.*
del /f /s /q "%userprofile%\Local Settings\Temporary Internet Files\*.*"
del /f /s /q "%userprofile%\Local Settings\Temp\*.*"
del /f /s /q "%userprofile%\recent\*.*"

rem the path of filecache is stored in registry:HKEY_LOCAL_MACHINE\SOFTWARE\Xoreax\IncrediBuild\Shadow\Folder
rem it can be set from Agent Settings -- Builder Helper - General - File Cache. Except that, you can also set File cache size.

rd/s/q "C:\Program Files\Xoreax\IncrediBuild\FileCache" & md "C:\Program Files\Xoreax\IncrediBuild\FileCache"

Echo vista
del /f /s /q "%userprofile%\AppData\Local\Microsoft\Windows\Temporary Internet Files\*.*"
rd /s /q "%userprofile%\AppData\Local\Temp" & md "%userprofile%\AppData\Local\Temp"
rd /s /q "%userprofile%\AppData\Local\Mozilla\Firefox\Profiles" & md "%userprofile%\AppData\Local\Mozilla\Firefox\Profiles"
rd /s /q "%userprofile%\AppData\Local\Microsoft\Windows\Temporary Internet Files" & md "%userprofile%\AppData\Local\Microsoft\Windows\Temporary Internet Files"

echo Finished!!!
echo. & pause