const {Worker, parentPort, workerData} = require('worker_threads');

// Get working data
process.on("data", (data) => {
    console.log("Data: ")
    console.log(data);

    process.send("mesage", "done")

});

// Return results

let result = 1;

parentPort.postMessage(result);