const fs = require('fs');
const { promisify } = require('util');

// Promisifying open, read, and close functions
const open = promisify(fs.open);
const read = promisify(fs.read);
const close = promisify(fs.close);

// File paths for output files
const outputFilePath = './src/output.txt'; // File to store removed characters
const firstSixFilePath = './src/firstSix.txt'; // File to store the first five characters that match regex

// Regular expression: matches ', ", (, or "data"

const regex = /([\('"])data:/;

const filePath = './src/index.js';
const bufferSize = 1; // Read one character at a time (one byte at a time)
const buffer = Buffer.alloc(bufferSize);

async function readFileCharacterByCharacter() {
  const fd = await open(filePath, 'r');

  try {
    let bytesRead;
    let position = 0; // To keep track of where we are in the file
    let lastSixChars = ''; // To keep track of the last five characters of the file.

    do {
      // Read one byte (character) at a time
      const result = await read(fd, buffer, 0, bufferSize, position);
      bytesRead = result.bytesRead;

      if (bytesRead > 0) {
        const char = buffer.toString('utf8', 0, bytesRead); // Convert byte to string (character)

        // Update lastSixChars
        lastSixChars += char;

        if (lastSixChars.length === 6 && regex.test(lastSixChars)) {
          console.log('FOUND ONE');
          // If it matches, append to the firstFive file
          await fs.promises.writeFile(firstSixFilePath, lastSixChars);

          lastSixChars = '';
        } else {
          // If it doesn't match, remove the first character and append to the output file
          await fs.promises.appendFile(outputFilePath, lastSixChars[0]);
          if (lastSixChars.length === 6) lastSixChars = lastSixChars.slice(1);
        }
      } else await fs.promises.appendFile(outputFilePath, lastSixChars);

      position += bytesRead; // Update position after reading
    } while (bytesRead > 0);
  } finally {
    await close(fd); // Close the input file when done
  }
}

//('data:);

readFileCharacterByCharacter().catch((err) => console.error(err));
