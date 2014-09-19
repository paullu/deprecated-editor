global.shellStartTime = Date.now();

var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var crashReporter = require('crash-reporter');

var mainWindow = null;

// Report crashes to our server.
crashReporter.start();

// Quit when all windows are closed.
app.on('window-all-closed', function() {
    app.quit();
});

//
app.on('ready', function() {
    mainWindow = new BrowserWindow( { 
        title: "Fireball-x",
        width: 1280, 
        height: 720,
        show: false,
        resizable: true,
        // frame: false,
    } );
    mainWindow.on('closed', function() {
        // TODO: close all window
        // app.quit();
    });

    // mainWindow.loadUrl('file://' + __dirname + '/index.html');
    mainWindow.show();
});
