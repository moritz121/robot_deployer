const {Worker, parentPort, workerData} = require('worker_threads');

// Get working data
try {

    console.log("Worker started");

    const data = workerData;

    console.log("Processing data -> "+data);

    // Return results

    let result = 2;
    parentPort.postMessage(result);

} catch(err){
    parentPort.postMessage({'error': err});
}