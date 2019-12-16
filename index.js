const url = require('url');
const fetch = require("node-fetch");
const path = require ('path');
const electron = require('electron');
const  {app, BrowserWindow, Menu, ipcMain} = electron;

// Main Window
let mainWindow;
const startingWindow = 'src/views/mainWindow.html';

// Listen for app to be opened

if(app!=undefined) {

    app.on('ready', () => {
        
        mainWindow = new BrowserWindow({
            webPreferences: {
                nodeIntegration: true,
                nodeIntegrationInWorker: true,
                sandbox: false
            }
        });


        //Loads first window in the app
        mainWindow.webContents.openDevTools();
        mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, startingWindow),
            protocol: 'file:',
            slashes: true
        }));

        const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
        Menu.setApplicationMenu(mainMenu);

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
        label: 'Reload',
        click() {
            mainWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'src/views/popUp.html'),
                protocol: 'file:',
                slashes: true
            }));
        }
    },
    {
        label: 'Test',
        submenu: [
            {
                label: 'Test acquisition',
                click() {
                    console.log("Acquisition requested ->")
                    userAction();
                }
            }, 
            {
                label: 'Test analisis',
                click() {
                    console.log("Still in developement");
                }
            },
            {
                label: 'Test resolution',
                click() {
                    console.log("Still in developement");
                }
            }
        ]
    },
    {
        label: 'Quit',
        click() {
            app.quit();
        }
    }
];

async function userAction(resource, args) {
    console.log(`Calling API -> ${args[0]} -> ${args[1]} -> ${args[2]}`);
    console.log(resource);
    const response = await fetch(`http://localhost:8081/api/${resource}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify( {options: { nWorkers: args[0], tMin: args[1], tMax: args[2]}})
    });
    const myJson = await response.json();
    console.log(`MyJson: ${JSON.stringify(myJson)}`);
    console.log("REST request ended");
    return myJson;
}

// Message Exchange

ipcMain.on("requestSimulation", (e, id) => {

    var secondarywin = new BrowserWindow({width:600, height:800, webPreferences: {nodeIntegration: true} });
    secondarywin.webContents.openDevTools();
    let mode;

    secondarywin.loadURL(url.format({
        pathname: path.join(__dirname, `src/views/popUp${id}.html`),
        protocol: 'file:',
        slashes: true
    }));

    ipcMain.once("requestAcquisitionSimulation", (ev, args) => {

        const run = async () => {

        console.log(`Test arguments for acquisition simulation being: ${args}`);
        mode = 'acquisition';
        let simRes = await userAction(mode, args);
        console.log(simRes);
        ev.sender.send('acquisitionSimulationResult', simRes);

        }
        run();

    });

    ipcMain.once("requestAnalysisSimulation", (ev, args) => {

        const run = async () => {

        console.log(`Test arguments for analysis simulation being: ${args}`);
        mode = 'analysis';
        let simRes = await userAction(mode, args);
        ev.sender.send('acquisitionSimulationResult', simRes);

        }
        run();

    });

    ipcMain.once("requestResolutionSimulation", (ev, args) => {

        const run = async () => {

        console.log(`Test arguments for resolution simulation being: ${args}`);
        mode = 'resolution';
        let simRes = await userAction(mode, args);
        ev.sender.send('acquisitionSimulationResult', simRes);

        }
        run();

    });

});



