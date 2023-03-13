const { contextBridge, ipcRenderer } = require('electron');
import { Drawing } from "./api/parseData";

contextBridge.exposeInMainWorld('electronAPI', {
    openDataset: () => ipcRenderer.invoke('dialog:openDataset') as Promise<Drawing[]>,
    outputDrawing: (identifier: string, drawing: Drawing) => ipcRenderer.invoke('outputDrawing', identifier, drawing) as Promise<string>,
});