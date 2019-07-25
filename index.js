const electron = require('electron');
const url = require('url');
const path = require ('path');

const{app, BrowserWindow, Menu, ipcMain} = electron;
let mainWindow;

// Main Window
const startingWindow = 'src/views/mainWindow.html';

// Listen for app to be opened

if(app!=undefined) {

    app.on('ready', () => {
        
        mainWindow = new BrowserWindow({
            webPreferences: {
                nodeIntegration: true
            }
        });


        //Loads first window in the app
        mainWindow.webContents.openDevTools();
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, startingWindow),
            protocol: 'file:',
            slashes: true
        }));
 /*       
        ipcMain.on('tubeclick', (e, id) => {
            console.log(`El id es: ${id}`);
            mainWindow = null;
        
            mainWindow = new BrowserWindow({
                webPreferences: {
                    nodeIntegration: true
                }
            });

            mainWindow.webContents.loadURL(url.format({
                pathname: path.join(__dirname, 'src/views/calendarWindow.html'),
                protocol: 'file:',
                slashes: true
            }), {"extraHeaders" : "pragma: no-cache\n"} );
        
            ipcMain.on('requestCurrentTube', (event) => {
                console.log('Responding with Current Tube: '+id);
                event.sender.send('responseRequestCurrentTube', id);
            });
        
        });        
*/
        const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
        Menu.setApplicationMenu(mainMenu);
        require('./src/controllers/MainWindowController');

    });

    app.on('closed', function() {
        mainWindow = null;
    });

}

const mainMenuTemplate = [
    {
        label:'Menu',
        click() {
            mainWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'src/views/mainWindow.html'),
                protocol: 'file:',
                slashes: true
            }));
        }
    },
    {

        label:'Options',
        submenu:[
            { 
                label: 'Change User',
                click() {
                    mainWindow.loadURL(url.format({
                        pathname: path.join(__dirname, 'src/views/changeUserWindow.html'),
                        protocol: 'file',
                        slashes: true
                    }));
                }
            },
        ]

    },
    {
        label: 'Reload',
        click() {
            mainWindow.webContents.reloadIgnoringCache();
        }
    },
    {
        label: 'Quit',
        click() {
            app.quit();
        }
    }
];

// IPCRenderer

if(ipcMain!=undefined) {


ipcMain.on('tubeclick', (e, id) => {
    console.log(`El id es: ${id}`);
    let mainWindow = BrowserWindow.getFocusedWindow();

    mainWindow.webContents.loadURL(url.format({
        
        pathname: path.join(__dirname, 'src/views/calendarWindow.html'),
        protocol: 'file:',
        slashes: true
    }), {"extraHeaders" : "pragma: no-cache\n"} );

    ipcMain.on('requestCurrentTube', (event) => {
        console.log('Responding with Current Tube: '+id);
        event.sender.send('responseRequestCurrentTube', id);
    });

});


ipcMain.on('userclick', (e, id) => {

    console.log(`Cambiado usuario a: ${id}`);
    
    ipcMain.on('requestCurrentUser', (event) => {
        event.sender.send('responseRequestCurrentUser', id);
    });

});

ipcMain.on('analyzedTubeclick', (e, id) => {

    var secondarywin = new BrowserWindow({width:600, height:800, webPreferences: {nodeIntegration: true} });
    secondarywin.webContents.openDevTools();
    secondarywin.loadURL(url.format({
        pathname: path.join(__dirname, 'src/views/analyzedTubeWindow.html'),
        protocol: 'file:',
        slashes: true
    }));
    
    ipcMain.on('requestAnalyzedTubeId', (event) => {
        console.log('Analyzed Tube Init Id has been sent with id: '+id);
        event.sender.send('responseRequestAnalyzedTubeId', id);
    });

});

ipcMain.on('requestNewAnalisys', (event) => {
    let mainWindow = BrowserWindow.getFocusedWindow();
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'src/views/newAnalisysWindow.html'),
        protocol: 'file:',
        slashes: true
    }));    
}); 

module.exports = ipcMain;

}

