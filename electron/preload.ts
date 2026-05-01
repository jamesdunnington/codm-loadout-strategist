import { contextBridge, ipcRenderer } from 'electron'

interface ElectronAPI {
  copyToClipboard: (text: string) => Promise<boolean>;
}

contextBridge.exposeInMainWorld('electronAPI', {
  copyToClipboard: (text: string) => ipcRenderer.invoke('copy-to-clipboard', text),
} as ElectronAPI)

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
