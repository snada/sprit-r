'use strict';

const custom_menus = require('./config/menus');

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({width: 800, height: 600, show: false});

  var template = custom_menus.getMenu();

  if (process.platform == 'darwin') {
    template.unshift(custom_menus.getOsXMenu(app));
  }

  var menu = electron.Menu.buildFromTemplate(template);
  electron.Menu.setApplicationMenu(menu);

  mainWindow.loadURL('file://' + __dirname + '/index.html');
  mainWindow.webContents.on('did-finish-load', function() {
    setTimeout(function(){
        mainWindow.show();
    }, 40);
  });

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
