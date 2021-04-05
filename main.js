const electron = require("electron");
const url = require('url');
const Lame = require("node-lame").Lame;

const {app, BrowserWindow, ipcMain, dialog} = electron;
const nodepath = require('path');

let { convname,filename} = '';

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
        pathname: nodepath.join(__dirname, 'mainWindow.html'),
        protocol:'file:',
        slashes: true
    }));
    // Quit app when closed
    mainWindow.on('closed', function(){
        app.quit();
    });

    // Catch Convert 
    ipcMain.on('Convert',function(e){
        // Replace wav to mp3 (WIP)
        filename = filename.replace('wav', 'mp3');
        // Set output location (path)
        const output = "./audio-files/" + filename;

        // Set target file by path
        const encoder = new Lame({
            output: output,
            bitrate: 128,
        }).setFile(convname);

        // Encode by node-lame
        encoder.encode()
            .then(() => {
                // Encoding finished
                console.log("success");
            })
            .catch((error) => {
                // Something went wrong
                console.log(error);
            });
    });

});

ipcMain.handle('file-open', async (event) => {
    // Open dialog
    const paths = dialog.showOpenDialogSync(mainWindow, {
      buttonLabel: 'open',
      filters: [
        { name: 'Audiofiles', extensions: ['audiofiles', 'wav'] },
      ],
      properties:[
        'openFile',
        'createDirectory',
      ]
    });

    // when closes dialog without opening a file
    if( paths === undefined ){
      return({status: undefined});
    }

    // get files contents
    try {
      const path = paths[0];
      convname = path;
      filename = nodepath.basename(path);

      return({
        status: true,
        path: path,
        name: filename
      });
    }
    catch(error) {
      return({status:false, message:error.message});
    }
  });