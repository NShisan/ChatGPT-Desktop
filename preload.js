const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    setProxy: (proxy) => ipcRenderer.send('set-proxy', proxy),
})