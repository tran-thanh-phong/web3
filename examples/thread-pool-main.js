// main.js
const { Worker } = require('worker_threads');

// Function to create a worker and run a task
function runWorker(taskData) {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./examples/thread-pool-worker.js');
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
                console.log(`#${task} - Task result: ${result}`);
            } catch (error) {
                console.error(`Task error: ${error}`);
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

// Example tasks
const tasks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

// Run tasks in a thread pool with 3 workers
runInThreadPool(tasks, 3).then(() => {
    console.log('All tasks completed.');
});
