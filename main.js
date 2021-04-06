const electron = require("electron");
const url = require('url');
const Lame = require("node-lame").Lame;

const {app, BrowserWindow, ipcMain, dialog, Menu} = electron;
const path = require('path');

let { cnvfilename,filename} = '';
let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 650,
        height: 500,
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
    mainWindow.removeMenu();
});

// Catch Convert
ipcMain.on('Convert',function(e){
  // Replace wav to mp3 (WIP)
  filename = filename.replace('wav', 'mp3');
  // Set output location
  const output = "./output/" + filename;

  // Set target file by path
  const encoder = new Lame({
      output: output,
      bitrate: 128,
  }).setFile(cnvfilename);

  // Encode by node-lame
  encoder.encode()
      .then(() => {
          // Encoding finished
          console.log("success");
          e.reply('convert-reply', 'complete!')
      })
      .catch((error) => {
          // Something went wrong
          console.log(error);
      });
});

// File-open dialog
ipcMain.handle('file-open', async (event) => {
    const filepaths = dialog.showOpenDialogSync(mainWindow, {
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
    if( filepaths === undefined ){
      return({status: undefined});
    }

    // get files contents
    try {
      const  filepath = filepaths[0];
      cnvfilename = filepath;
      filename = path.basename(filepath);

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
