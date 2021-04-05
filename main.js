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

    // Catch item:add
    ipcMain.on('Convert',function(e){
        filename = filename.replace('wav', 'mp3');
        const output = "./audio-files/" + filename;
        const encoder = new Lame({
            output: output,
            bitrate: 128,
        }).setFile(convname);

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

ipcMain.handle('file-open', async (event) => {
    // ファイルを選択
    const paths = dialog.showOpenDialogSync(mainWindow, {
      buttonLabel: '開く',  // 確認ボタンのラベル
      filters: [
        { name: 'Text', extensions: ['audiofiles', 'wav'] },
      ],
      properties:[
        'openFile',         // ファイルの選択を許可
        'createDirectory',  // ディレクトリの作成を許可 (macOS)
      ]
    });

    // キャンセルで閉じた場合
    if( paths === undefined ){
      return({status: undefined});
    }

    // ファイルの内容を返却
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