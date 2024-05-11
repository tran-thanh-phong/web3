const { getWalletsByCategory } = require('../services/dataServiceAsync');

/////////////////////// WORKER ///////////////////////
const { Worker } = require('worker_threads');

// Function to create a worker and run a task
function runWorker(taskData) {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./workers/worker.js');
        worker.postMessage(taskData);

        worker.on('message', (result) => {
            if (result.error) {
                reject(new Error(result.error));
            } else {
                resolve(result);
            }
            worker.terminate();
        });

        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0)
                reject(new Error(`Worker stopped with exit code ${code}`));
        });
    });
}

// Function to manage a pool of workers
async function runInThreadPool(tasks, poolSize) {
    const taskQueue = [...tasks];
    const pool = [];
    
    // Function to process tasks
    const processTask = async () => {
        while (taskQueue.length > 0) {
            const task = taskQueue.shift();
            try {
                const result = await runWorker(task);
                console.log(`[${task?.Id}] - Task result: ${JSON.stringify(result)}`);
            } catch (error) {
                console.error(`Task error: ${JSON.stringify(error)}`);
            }
        }
    };

    // Create the pool
    for (let i = 0; i < poolSize; i++) {
        pool.push(processTask());
    }

    // Wait for all tasks to complete
    await Promise.all(pool);
}

async function swapHairy() {
    var data = await getWalletsByCategory('Self700');
    
    // Top 10
    const tasks = data; // .slice(0, 100)
    const poolSize = 50;

    const start = Date.now();
    console.log(`Total tasks: ${tasks.length}`);

    // Run tasks in a thread pool with 3 workers
    runInThreadPool(tasks, poolSize).then(() => {
        const end = Date.now();
        console.log(`All ${tasks.length} task(s) completed in ${end - start} miliseconds.`);
    });
}
  
swapHairy();
/////////////////////// WORKER ///////////////////////