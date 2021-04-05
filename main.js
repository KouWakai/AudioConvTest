const electron = require("electron");
const url = require('url');
const Lame = require("node-lame").Lame;

const {app, BrowserWindow, ipcMain, dialog, Menu} = electron;
const nodepath = require('path');

let { convname,filename} = '';

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
        pathname: nodepath.join(__dirname, 'mainWindow.html'),
        protocol:'file:',
        slashes: true
    }));
    // Quit app when closed
    mainWindow.on('closed', function(){
        app.quit();
    });

    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    Menu.setApplicationMenu(mainMenu);
    mainWindow.removeMenu();

});

// Catch Convert
ipcMain.on('Convert',function(e){
  // Replace wav to mp3 (WIP)
  filename = filename.replace('wav', 'mp3');
  // Set output location (path)
  const output = "./output/" + filename;

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
          e.reply('convert-reply', 'complete!')
      })
      .catch((error) => {
          // Something went wrong
          console.log(error);
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

  const mainMenuTemplate = [
    {
      label : ' '
    }
  ]

  // Add developer tools option if in dev
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu:[
      {
        role: 'reload'
      },
      {
        label: 'Toggle DevTools',
        accelerator:process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      }
    ]
  });
}