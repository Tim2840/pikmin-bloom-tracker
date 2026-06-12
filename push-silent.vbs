Set oShell = CreateObject("WScript.Shell")
oShell.Run "cmd.exe /c cd /d ""C:\Users\user\Desktop\hexschool_ReactProjects\pikmin-bloom-tracker"" && git -c credential.helper=manager push origin main > ""C:\Users\user\Desktop\hexschool_ReactProjects\pikmin-bloom-tracker\push-result.txt"" 2>&1", 0, True
