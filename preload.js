const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  authenticate: () => ipcRenderer.invoke('authorize-google'),
  saveOAuthCredentials: () => ipcRenderer.invoke('save-credentials'),
  resetCredentials: () => ipcRenderer.invoke('reset-credentials'),
  checkCredentials: () => ipcRenderer.invoke('checkCredentials'),
  checkToken: () => ipcRenderer.invoke('checkToken'),
  getSheetInfo: (link) => ipcRenderer.invoke('getSheetInfo', { link }),
  openLink: () => ipcRenderer.send('open-link'),
  openWalletLink: (address) => ipcRenderer.invoke('open-wallet-link', { address }),
  saveApiCredentials: (credentials) => ipcRenderer.invoke('save-api-credentials', credentials),
  getApiCredentials: () => ipcRenderer.invoke('get-api-credentials'),
  resetApiCredentials: () => ipcRenderer.invoke('reset-api-credentials'),
  openDashboardLink: (resource) => ipcRenderer.invoke('open-dashboard-link', { resource }),
  getIsDev: () => ipcRenderer.invoke('get-isDev'),
  getIsStaging: () => ipcRenderer.invoke('get-isStaging'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  openGithubRelease: (link) => ipcRenderer.invoke('open-github-release', { link }),

  saveGsheetLinks: (links) => ipcRenderer.invoke('save-gsheet-links', links),
  getGsheetLinks: () => ipcRenderer.invoke('get-gsheet-links'),
  resetGsheetLinks: () => ipcRenderer.invoke('reset-gsheet-links'),
  addGsheetLink: (link) => ipcRenderer.invoke('add-gsheet-links', link),
  deleteGsheetLink: (linkId) => ipcRenderer.invoke('delete-gsheet-links', linkId),
  saveSelectedValue: (selectedValue) => ipcRenderer.invoke('save-selectedValue', selectedValue),
  getSelectedValue: () => ipcRenderer.invoke('get-selectedValue'),
  deleteSelectedValue: (selectedValue) => ipcRenderer.invoke('reset-selectedValue', selectedValue),
})
