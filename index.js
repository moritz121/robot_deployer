const electron = require('electron');
const url = require('url');
const path = require ('path');
const os = require('os');
const mysql = require('mysql');
const {Worker, isMainThread, parentPort, workerData} = require('worker_threads');
const{app, BrowserWindow, Menu, ipcMain} = electron;
const NS_PER_SEC = 1e9;

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

callWorkers(1);

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
            mainWindow.webContents.reloadIgnoringCache();
        }
    },
    {
        label: 'Work_debug',
        click() {
            callWorkers(1);
        }
    },
    {
        label: 'Quit',
        click() {
            app.quit();
        }
    }
];

// Message Exchange


// Workers 

function callWorkers(nWorkers) {

    let tubeArray = [];
    let workerIndex = 1;

    connection.query('select (ID_Tube) from Tube;', function (error, results, fields) {
        if (error) throw error;

        // Convert query results into array for posterior transformation

        for(let i = 0; i<Object.keys(results).length; i++) {
            tubeArray.push(results[i].ID_Tube);
        }

    connection.end();
    });

    //Simulate the adquisition of the tubes

    const simulateAdquisition = async (tubeArray, nWorkers) => { 
        return new Promise(async (parentResolve, parentReject) => {
    
            console.log('first promisse');
            workerPath = path.resolve(__dirname, 'adquisitionWorker.js');
            workLoadLength = Math.ceil(tubeArray.length / nWorkers);
            workLoads = [];
    
            for(let i = 0; i < nWorkers; i++) {
                pos = i*workLoadLength;
                let workLoad = tubeArray.slice(pos, pos + workLoadLength, workLoadLength);
                workLoads.push(workLoad);
            }
    
            var electronWorkers = require('electron-workers')({
                connectionMode: 'ipc',
                pathToScript: 'adquisitionWorker.js',
                timeout: 5000,
                numberOfWorkers: 1
            });

            try {
                const workResults = await Promise.all(workLoads.map(load => new Promise((resolve, reject) => {
                    load.push(workerIndex);
                    console.log(load);
                    workerIndex++;
                    
                    process.dlopen = () => {
                        throw new Error('La carga del módulo nativo no es segura')
                    }
    /*
                    const worker = new ElectronWorker(workerPath, {
                        workerData: load
                    });
    */
                    //Copiado
                    
                    electronWorkers.start(function(startErr) {
                        if (startErr) {
                        return console.error(startErr);
                        }
                    
                        // `electronWorkers` will send your data in a POST request to your electron script
                        electronWorkers.execute({ someData: 'someData' }, function(err, data) {
                        if (err) {
                            return console.error(err);
                        }
                    
                        console.log(JSON.stringify(data)); // { someData: 'someData' }
                        electronWorkers.kill(); // kill all workers explicitly
                        });
                    });

                    // Fin copiado

                    process.send("data", load);
                    process.on("mesage", resolve);
                    process.on("error", reject);
                    process.on("exit", (code) => {
                        if(code!=0) {
                            reject(new Error(`Worker stoped with exit code ${code}`));
                        }
                    }); 

                    console.log(resolve); 
                    parentResolve(resolve);

                })));
            } catch (e) {parentReject(e);}
            
            


        }); 
    }

    // Time calculation

    const benchmarkFunc = async (func, input1, input2) => {
        const tStart = process.hrtime();
        const tWork = await func(input1, input2); 
        const tDiff = process.hrtime(tStart); 
        const t = tDiff[0] * NS_PER_SEC + tDiff[1];
        return t;
    }

    const benchmarkTime = await benchmarkFunc(simulateAdquisition, tubeArray, nWorkers);
    console.log('Time is:' + Math.floot(benchmarkTime/1000000) + 'ms');

}

