const electron = require("electron");
const url = require('url');
const path = require('path');
const Lame = require("node-lame").Lame;

const {app, BrowserWindow, ipcMain} = electron;

let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol:'file:',
        slashes: true
    }));
    // Quit app when closed
    mainWindow.on('closed', function(){
        app.quit();
    });

    // Catch item:add
    ipcMain.on('Convert',function(e, item, name){
        name = name.replace('wav', 'mp3');
        const output = "./audio-files/" + name;
        const encoder = new Lame({
            output: output,
            bitrate: 128,
        }).setFile(item);

        encoder.encode()
            .then(() => {
                // Encoding finished
                console.log("success");
            })
            .catch((error) => {
                // Something went wrong
                console.log(error);
                console.log(encoder);
            });
    });

});