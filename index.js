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
                label: 'Test adquisition',
                click() {
                    console.log("Adquisition requested ->")
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

// Functions

function queryDB(query) {
    return new Promise((resolve, reject) => { 
        connection.query(query, function (error, results, fieldds) {
            if (error) reject("Query promise rejected -> "+error);
            resolve(results);    
        });
    });
}
/*
const userAction = async () => {
    console.log("Calling API ->");
    const response = await fetch('http://localhost:8081/api/adquisition');
    const myJson = await response.json(); //extract JSON from the http response
    // do something with myJson
    console.log(myJson);
    console.log("REST request ended");
  }
*/

const userAction = async () => {
    console.log("Calling API ->");
    const response = await fetch('http://localhost:8081/api/adquisition', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify( {options: { nWorkers: 2, tMin: 1000, tMax: 3000, type: 'acquisition'}})
    });
    const myJson = await response.json(); //extract JSON from the http response
    // do something with myJson
    console.log(myJson);
    console.log("REST request ended");
}

// Message Exchange

ipcMain.on("requestAdquisition", (e) => {

    var secondarywin = new BrowserWindow({width:600, height:800, webPreferences: {nodeIntegration: true} });
    secondarywin.webContents.openDevTools();
    secondarywin.loadURL(url.format({
        pathname: path.join(__dirname, 'src/views/popUp.html'),
        protocol: 'file:',
        slashes: true
    }));

    ipcMain.on("reqiestAdquisitionSimulation", (e, args) => {

        console.log(`Test arguments for simulation being: ${args}`);

    });

//    console.log("Adquisition requested ->")
//    userAction();

});

// Workers 

async function callWorkers(nWorkers) {

    let tubeArray = [];
    let workerIndex = 1;

        // Convert query results into array for posterior transformation

        let results = await queryDB('select (ID_Tube) from Tube;');

        for(let i = 0; i<Object.keys(results).length; i++) {
            tubeArray.push(results[i].ID_Tube);
        }

    //Simulate the adquisition of the tubes
    
    workerPath = path.resolve('adquisitionWorker.js');
    workLoadLength = Math.ceil(tubeArray.length / nWorkers);
    workLoads = [];

    for(let i = 0; i < nWorkers; i++) {
        pos = i*workLoadLength;
        let workLoad = tubeArray.slice(pos, pos + workLoadLength, workLoadLength);
        workLoads.push(workLoad);
    }

    // Worker configuration

    let promisses = workLoads.map(load => new Promise((resolve, reject) => {
        load.push(workerIndex);
        workerIndex++;
        
    console.log("Hello");

        process.dlopen = () => {
            throw new Error('La carga del módulo nativo no es segura');
        }

        console.log('1');
        console.log(load);

        const worker = new Worker(workerPath, {
            workerData: load
        });

        console.log('2');
//        worker.postMessage("Start", load);

        // Fin copiado
        console.log('3');
        worker.on("message", resolve);
        worker.on("error", (error) => {
            console.log("reject catched -> "+error); 
            reject(new Error(`Worker stopped by catched error ${error}`));
        });
        worker.on("exit", (code) => {
            if(code!=0) {
                console.log("reject code -> "+code);
                reject(new Error(`Worker stoped with exit code ${code}`));
            }
        });
        console.log('4');   

    }));

    return Promise.all(promisses).then((values) => {
        console.log('5');
        console.log(values);
        return values;
    }).catch(() => {
        console.log("Fetch");
        return 0;
    });

}

// Time calculation

async function benchmarkFunc(nWorkers) {

    const spinner = ora(`Calculating...`).start();
    const tStart = process.hrtime();
    var variable = await callWorkers(1);
    console.log('Variable:');
    console.log(variable);
    const tDiff = process.hrtime(tStart);
    const t = tDiff[0] * NS_PER_SEC + tDiff[1];
     spinner.succeed(`Result done in: ${t}`);

}


/*
const run = async () => {
    console.log("Hi?");
  const {inputNumber} = await inquirer.prompt([
    {
      type: 'input',
      name: 'inputNumber',
      message: 'Deploy workers:',
      default: 1,
    },
  ]);

    console.log("Start benchmarking");
    const tDeploy = await benchmarkFunc(inputNumber);
    console.log(`tDeploy -> ${tDeploy}`);

}

run();
*/


/*
console.log("calling");
const userAction = async () => {
    console.log("hi");
    const response = await fetch('https://us-central1-client-server-tfg.cloudfunctions.net/adquisitionWorker/api/one');
    console.log(`response -> ${response}`);
    console.log(response);
    const myJson = await response.json(); //extract JSON from the http response
    // do something with myJson
    console.log(myJson);
  }


  console.log("const");
  userAction();

  */