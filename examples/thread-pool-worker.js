// worker.js
const { parentPort } = require('worker_threads');

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    // The maximum is exclusive and the minimum is inclusive
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Asynchronous function to perform a task
async function performTask(data) {
    // Simulate an asynchronous operation (e.g., fetch data, file I/O, etc.)
    const timeOut = getRandomInt(1000, 2000);

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(timeOut); // Example operation
        }, timeOut); // Simulated delay
    });
}

parentPort.on('message', async (message) => {
    try {
        const result = await performTask(message);
        parentPort.postMessage(result); // Send the result back to the parent
    } catch (error) {
        parentPort.postMessage({ error: error.message });
    }
});
