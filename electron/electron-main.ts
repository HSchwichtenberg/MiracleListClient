import {app, BrowserWindow, Menu, dialog, ipcMain, Tray, screen} from "electron";
import {MiracleListMenu} from "./MiracleListMenu";
import * as username from "username";
import ShowMessageBoxOptions = Electron.ShowMessageBoxOptions;
import * as fs from "fs";
import * as moment from "moment";

const path = require('path');
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: Electron.BrowserWindow;

function createWindow() {

 // Create the electron browser window
 console.log("!!!Electron/Main:createWindow");
 const {width, height} = screen.getPrimaryDisplay().workAreaSize;

 console.log("OS:", process.platform);
 console.log("Screen:" + width + "x" + height);
 console.log("Anwendungspfad:" + __dirname);
 console.log("Aktueller Benutzer:" + username.sync());
 console.log("User Home Dir:" + app.getPath("documents"));
 writeLog('Anwendungstart');

 var favicon : string = path.join(__dirname, 'favicon.ico');
 win = new BrowserWindow({
  width: 900,
  height: 600,
  frame: true, // false für frameless Window
  icon: favicon,
  webPreferences: {
   nodeIntegration: true,
   preload: path.join(__dirname, 'preload.js')
  }

 });
 win.setTitle(app.getName() + " v" + app.getVersion() + " auf " + process.platform);


 // Datenübergabe an Renderer mit dynamischen Objekt
 var env: any = new Object();
 env.version = process.versions['electron'];
 env.os = process.platform;
 env.appversion = app.getVersion();
 (<any>win).env = env;

console.log("Lade Index.html...");


 // and load the index.html of the app.
 win.loadURL(url.format({
  pathname: path.join(__dirname, 'index.html'),
  protocol: 'file:',
  slashes: true
 }));


 let contents = win.webContents;

 // =================== Anwendungsmenü einbinden
 var menuTemplate = MiracleListMenu.CreateMenu(app, win);
 const menu = Menu.buildFromTemplate(menuTemplate);
 Menu.setApplicationMenu(menu);

 // =================== Traymenü erstellen
 // siehe auch https://github.com/electron/electron/blob/master/docs/api/tray.md
 let tray = new Tray(favicon);
 const contextMenu: Electron.Menu = Menu.buildFromTemplate([
  {
   label: 'Über diese Anwendung', click: () => {
   const options : ShowMessageBoxOptions = {
       type: 'info',
       title: 'Cross-Plattform-Desktop-Variante der Beispielanwendung MiracleList',
       buttons: ['Ok'],
       message: '(C) Dr. Holger Schwichtenberg 2017\nDetails siehe Anwendungsmenü!\nSystembenutzer: ' + username.sync() + ''
   }
   dialog.showMessageBox(options, function() {})
  }
  },
  {
   label: 'Verstecken', click: () => {  win.minimize(); }
  },
  {
   label: 'Wiederherstellen', click: () => {  win.restore(); }
  },
  {
   label: 'Maximieren', click: () => {  win.maximize(); }
  },
  {
   label: 'Abmelden', click: () => { contents.send('logout', {msg: ''});  }
  },
  {
   label: 'Beenden', click: () => {  app.quit(); }
  },

 ]);

 tray.setToolTip('MiracleList');
 tray.setContextMenu(contextMenu);

 // =================== Globaler Shortcut
 // TODO: https://github.com/electron/electron/blob/master/docs/api/global-shortcut.md

 // Open the DevTools.
 // win.webContents.openDevTools()

 // Emitted when the window is closed.
 win.on('closed', () => {
  // Dereference the window object, usually you would store windows
  // in an array if your app supports multi windows, this is the time
  // when you should delete the corresponding element.
  win = null;
 });

// -------------- Reaktion auf Events

 ipcMain.on('export', (event, arg) => {
  console.log("export-event", arg);
  let file = path.join(app.getPath("documents"), 'miraclelist_export.json');
  let text = JSON.stringify(arg);
  fs.appendFile(file,text, (err) => {
   if (err) throw err;
  });
  event.sender.send('export-reply', 'Aufgaben exportiert in Datei ' + file);
 });

 console.log("Electron/Main:createWindow END");
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
 writeLog("Anwendungsende");
 // On macOS it is common for applications and their menu bar
 // to stay active until the user quits explicitly with Cmd + Q
 if (process.platform !== 'darwin') {
  app.quit();
 }
});

app.on('activate', () => {
 // On macOS it's common to re-create a window in the app when the
 // dock icon is clicked and there are no other windows open.
 if (win === null) {
  console.log("Electron/Main:activate");
  createWindow();
 }
});

function writeLog(logtext: string)
{
 logtext = moment().format("DD.MM.YYYY HH:mm:ss") + ": " +  logtext + "\r\n";
 let logfile = path.join(app.getPath("documents"), 'miraclelist_log.txt')
 console.log(logfile);
 fs.appendFile(logfile,logtext , (err) => {
  if (err) throw err;
 });
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

