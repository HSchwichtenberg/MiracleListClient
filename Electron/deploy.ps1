$erroractionpreference = "stop"
$lok = Get-Location
cd $PSScriptRoot\..
"--> Angular-Produktions-Build für Electron nach temp_electron..."
ng build --target=production --environment=prod --output-path=temp_electron --base-href .
& "$PSScriptRoot\copy-electronmain.ps1"
cd $PSScriptRoot\..
"--> Electron-Paket erstellen..."
electron-packager temp_electron MiracleListElectron --platform=win32,linux --arch=x64 --out=dist_electron4/ --overwrite --icon=Electron/src/img/icon --asar #win32,darwin,linux
"--> !!!FERTIG!!!"
cd $lok
& "$PSScriptRoot\..\dist_electron3\MiracleListElectron-win32-x64\MiracleListElectron.exe"
