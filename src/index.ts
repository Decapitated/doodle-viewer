import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { parseSimplifiedDrawings, Drawing, drawStrokes } from './api/parseData';
// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

const createWindow = (): void => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        height: 600,
        width: 800,
        webPreferences: {
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
        },
    });

    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

    // Open the DevTools.
    mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    ipcMain.handle('dialog:openDataset', openDoodleDataset);
    ipcMain.handle('outputDrawing', outputDrawing);
    createWindow();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

interface OpenDoodlesReturn {
    drawings: Drawing[];
    datasetPath: string;
}
function openDoodleDataset() {
    return new Promise<OpenDoodlesReturn>(async (resolve, reject) => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            filters: [{
                name: 'Newline Delimited JSON',
                extensions: ['ndjson']
            }]
        });
        if (canceled) {
            console.info("Open dataset cancelled");
            reject("Open dataset cancelled");
        } else {
            const datasetPath = filePaths[0];
            parseSimplifiedDrawings(datasetPath).then((drawings) => {
                console.log("# of drawings:", drawings.length);
                resolve({
                    drawings: drawings,
                    datasetPath: datasetPath
                });
            }).catch((e) => {
                console.error(e);
                reject(e);
            });
        }
    });
}

function outputDrawing(_: Electron.IpcMainInvokeEvent, identifier: string, d: Drawing) {
    return new Promise(async (resolve, reject) => {
        try {
            resolve(await drawStrokes(identifier, d));
        }catch(e) {
            reject(e);
        }
    });
}

export interface API {
    openDataset: () => Promise<OpenDoodlesReturn>;
    outputDrawing: (identifier: string, d: Drawing) => Promise<string>;
}

declare global {
    interface Window { electronAPI: API; }
}