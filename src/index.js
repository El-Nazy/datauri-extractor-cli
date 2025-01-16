const fs = require('fs');
const { promisify } = require('util');

const open = promisify(fs.open);
const read = promisify(fs.read);
const close = promisify(fs.close);

const filePath = './src/index.js';
const chunkSize = 1; // Read one byte at a time
const buffer = Buffer.alloc(chunkSize);

async function readFileInChunks() {
  const fd = await open(filePath, 'r');
  try {
    let bytesRead;
    do {
      const result = await read(fd, buffer, 0, chunkSize, null);
      bytesRead = result.bytesRead;
      if (bytesRead > 0) {
        console.log(buffer.subarray(0, bytesRead)); // Process the chunk
      }
    } while (bytesRead > 0);
  } finally {
    await close(fd);
  }
}

readFileInChunks().catch(err => console.error(err));
