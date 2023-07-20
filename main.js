// Main Process
const { app, BrowserWindow, ipcMain, dialog, Menu, Tray } = require('electron');
const path = require('path');
const isDev = !app.isPackaged;
const fs = require('fs').promises;
const { fetchData, authorize, parseSpreadSheetLink } = require('./auth.js');
const settings = require('electron-settings');

const dockIcon = path.join(__dirname, 'assets', 'images', 'budgetToolLogo.png');
const trayIcon = path.join(__dirname, 'assets', 'images', 'budget_icon.jpg');

createJsonStorageVariable('isDev', false);
createJsonStorageVariable('isStaging', false);

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        backgroundColor: 'white',
        webPreferences: {
            nodeIntegration: false,
            worldSafeExecuteJavaScript: true,
            //is a feature that ensures that both, your preload scripts and Electron
            //internal logic run in seperate context
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })
    win.loadFile('index.html');
    isDev && win.webContents.openDevTools();
    return win;
}

if (isDev) {
    if (process.platform !== 'darwin')
        require('electron-reload')(__dirname, {
            electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
        })
}

if (process.platform === 'darwin') {
    app.dock.setIcon(dockIcon);
}

let tray = null;

app.whenReady().then(async () => {
    const template = require('./utils/menu').createTemplate(app);
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    tray = new Tray(trayIcon)
    tray.setContextMenu(menu)
    createWindow();

    await setEnv()
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
});

/**
 *  IPC Handlers
 * 
 *  Set DEBUG_IPC_HANDLERS=true for debug output.
 */

const DEBUG_IPC_HANDLERS = false;

ipcMain.handle('save-credentials', async () => {
    try {
        const gSecretsPath = await dialog.showOpenDialog({ properties: ['openFile'] })
        const gSecrets = JSON.parse(await fs.readFile(gSecretsPath.filePaths[0], 'utf-8'));
        await settings.set('credentials', JSON.stringify(gSecrets))
        return true;
    } catch (error) {
        console.error(error)
        return false;
    }
})

ipcMain.handle('authorize-google', async () => {
    try {
        await authorize()
        return true;
    } catch (error) {
        console.error(error)
        return false;
    }
})


ipcMain.handle('checkCredentials', async (event, args) => {
    try {
        return await settings.has('credentials');
    } catch (err) {
        return false
    }
})

ipcMain.handle('checkToken', async (event, args) => {
    try {
        const state = await settings.has('token');
        let auth = null;
        if (state)
            auth = await authorize();
        return { state, authClient: auth };
    } catch (err) {
        return { state: false, authClient: null }
    }
})

ipcMain.handle('getSheetInfo', async (evemt, args) => {
    try {
        if (DEBUG_IPC_HANDLERS) console.log('Getting Link in Main:', await args);

        const result = await parseSpreadSheetLink(args);
        if (result === undefined) {
            const result = 'error'
            return { result };
        }
        const { spreadSheetTitle, sheetName, spreadsheetId, tabId } = result
        const rawData = await fetchData(spreadsheetId, sheetName);
        return { spreadSheetTitle, sheetName, spreadsheetId, tabId, rawData }

    } catch (error) {
        return { error };
    }
})

ipcMain.handle('reset-credentials', async () => {
    try {
        await settings.unset();
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
})

ipcMain.on('open-link', () => {
    require('electron').shell.openExternal('https://developers.google.com/workspace/guides/create-credentials#desktop-app')
})

ipcMain.handle('open-wallet-link', (event, args) => {
    require('electron').shell.openExternal(`https://gnosis-safe.io/app/eth:${args.address}/home`)
})

ipcMain.handle('open-dashboard-link', async (event, args) => {
    let resourceType = 'core-unit';
    if (args.resource.type === 'CoreUnit') {
        resourceType = 'core-unit'
    } else if (args.resource.type === 'EcosystemActor') {
        resourceType = 'ecosystem-actors'
    }
    require('electron').shell.openExternal(await settings.get('isDev') && await settings.get('isStaging') === false ?
        `https://expenses-dev.makerdao.network/${resourceType}/${args.resource.shortCode}/finances/reports`
        :
        await settings.get('isDev') === false && await settings.get('isStaging') === false ?
            `https://expenses.makerdao.network/${resourceType}/${args.resource.shortCode}/finances/reports`
            :
            `https://expenses-staging.makerdao.network/${resourceType}/${args.resource.shortCode}/finances/reports`
    )
});

ipcMain.handle('get-app-version', () => {
    return app.getVersion()
})

ipcMain.handle('open-github-release', (event, args) => {
    require('electron').shell.openExternal(args.link)
})


function getNextStorageId(set) {
    if (!Array.isArray(set)) {
        return 1;
    }

    let nextId = 1;
    for (const element of set) {
        if (element.id && element.id >= nextId) {
            nextId = element.id + 1;
        }
    }

    return nextId;
}

function createJsonStorageVariable(name, defaultValue, isCollection = false) {
    /**
     *  Save storage value
     */
    ipcMain.handle(`save-${name}`, async (event, args) => {
        try {
            if (DEBUG_IPC_HANDLERS) console.log("Storing " + name, args);
            await settings.set(name, JSON.stringify(args))

        } catch (error) {
            // If an error occurs, clear the storage.
            if (DEBUG_IPC_HANDLERS) console.log(`save-${name} error`, error);
            await settings.set(name, null)
            return { error }
        }
    });

    /**
     *  Get storage value
     */
    ipcMain.handle(`get-${name}`, async (event, args) => {
        try {
            const result = await settings.get(name);
            if (DEBUG_IPC_HANDLERS) console.log("Getting " + name, result, " => ", (result ? JSON.parse(result) : defaultValue));
            return (result ? JSON.parse(result) : defaultValue);

        } catch (error) {
            // If an error occurs, clear the storage.
            if (DEBUG_IPC_HANDLERS) console.log(`get-${name} error`, error);
            await settings.set(name, null)
            return { error }
        }
    });

    /**
     *  Clear storage value
     */
    ipcMain.handle(`reset-${name}`, async (event, args) => {
        try {
            if (DEBUG_IPC_HANDLERS) console.log("Resetting " + name);
            await settings.set(name, null)
        } catch (error) {
            if (DEBUG_IPC_HANDLERS) console.log(`reset-${name} error`, error);
            return { error }
        }
    });

    if (isCollection) {

        /**
         *  Add a value to the storage array and return its ID
         */
        ipcMain.handle(`add-${name}`, async (event, args) => {
            try {
                const existingRawValue = await settings.get(name);
                const existingValue = existingRawValue ? JSON.parse(existingRawValue) : [];
                const set = Array.isArray(existingValue) ? existingValue : [];
                const newId = getNextStorageId(set);

                set.push({
                    id: newId,
                    value: args
                });

                if (DEBUG_IPC_HANDLERS) console.log(`Adding record ${newId} to ${name}`, set);
                await settings.set(name, JSON.stringify(set));

                return newId;

            } catch (error) {
                // If an error occurs, clear the storage.
                if (DEBUG_IPC_HANDLERS) console.log(`add-${name} error`, error);
                await settings.set(name, null)
                return { error }
            }
        });

        /**
         *  Remove a value from the storage array by ID
         */
        ipcMain.handle(`delete-${name}`, async (event, args) => {
            try {
                const existingRawValue = await settings.get(name);
                const existingValue = existingRawValue ? JSON.parse(existingRawValue) : [];
                const removalId = args[0] ? Number(args[0]) : 0;
                const set = Array.isArray(existingValue) ? existingValue.filter(record => record.id != removalId) : [];

                if (DEBUG_IPC_HANDLERS) console.log(`Removing record ${removalId} from ${name}`, set);
                await settings.set(name, JSON.stringify(set));

            } catch (error) {
                // If an error occurs, clear the storage.
                if (DEBUG_IPC_HANDLERS) console.log(`delete-${name} error`, error);
                await settings.set(name, null);
                return { error };
            }
        });
    }
}

async function setEnv() {
    await settings.set('isDev', isDev);
    await settings.set('isStaging', false)
}

createJsonStorageVariable('api-credentials', null);
createJsonStorageVariable('gsheet-links', [], true);
createJsonStorageVariable('selectedValue', null);
