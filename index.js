const url = require('url');
const fetch = require("node-fetch");
const path = require ('path');
const ora = require('ora');
const mysql = require('mysql');
const electron = require('electron');
const NS_PER_SEC = 1e9;
const request = require('request');
const {Worker, parentPort, workerData, isMainThread} = require('worker_threads');
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
  //          mainWindow.webContents.reloadIgnoringCache();
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

// SQL Connection

/*

const connection = mysql.createConnection({
    host: '34.77.222.32',
    user: 'root',
    password: 'root',
    database: 'db_nuclear_analisys'
    });

connection.connect(function(err) {
if (err) {
    console.error('error connecting: ' + err.stack);
    return;
}

console.log('connected as id ' + connection.threadId);
});

*/

// Functions

function queryDB(query) {
    return new Promise((resolve, reject) => { 
        connection.query(query, function (error, results, fieldds) {
            if (error) reject("Query promise rejected -> "+error);
            resolve(results);    
        });
    });
}

const userAction = async () => {
    console.log("Calling API ->");
    const response = await fetch('http://localhost:8081/api/acquisition', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify( {options: { nWorkers: 2, tMin: 1000, tMax: 3000, type: 'acquisition'}})
    });
    const myJson = await response.json();
    console.log(myJson);
    console.log("REST request ended");
}

// Message Exchange

ipcMain.on("requestSimulation", (e, id) => {

    var secondarywin = new BrowserWindow({width:600, height:800, webPreferences: {nodeIntegration: true} });
    secondarywin.webContents.openDevTools();

    secondarywin.loadURL(url.format({
        pathname: path.join(__dirname, `src/views/popUp${id}.html`),
        protocol: 'file:',
        slashes: true
    }));

    ipcMain.on("requestAcquisitionSimulation", (ev, args) => {

        console.log(`Test arguments for acquisition simulation being: ${args}`);
        //    console.log("Acquisition requested ->")
        //    userAction();
        ev.sender.send('acquisitionSimulationResult', 'results');

    });

    ipcMain.on("requestAnalysisSimulation", (ev, args) => {

        console.log(`Test arguments for analysis simulation being: ${args}`);
        //    console.log("Acquisition requested ->")
        //    userAction();
        ev.sender.send('acquisitionSimulationResult', 'results');

    });

    ipcMain.on("requestResolutionSimulation", (ev, args) => {

        console.log(`Test arguments for resolution simulation being: ${args}`);
        //    console.log("Acquisition requested ->")
        //    userAction();
        ev.sender.send('acquisitionSimulationResult', 'results');

    });



//    console.log("Acquisition requested ->")
//    userAction();

});



