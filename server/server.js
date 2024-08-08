const express = require('express');
const dgram = require('dgram');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const RuidaClient = dgram.createSocket('udp4');

// Ruida configuration
const RuidaPort = 50207;
const RuidaAddress = "192.168.0.10";

// Server configuration
const PORT = 3000;
app.use(cors());
app.use(bodyParser.json());

// Function to send the initial handshake packet (0xCC)
function sendHandshake() {
  const handshakeCommand = Buffer.from([0xCC]); // Handshake command
  RuidaClient.send(handshakeCommand, 0, handshakeCommand.length, RuidaPort, RuidaAddress, (err) => {
    if (err) {
      console.error('Failed to send handshake packet:', err);
    }
  });
}

// Route to send commands with a delay
app.post('/runMirrorTest', async (req, res) => {
  const listOfCommands = [
    [0xA5, 0x50, 0x03, 0xA5, 0x50, 0x01],
    [0xA5, 0x50, 0x04],
    [0xA5, 0x50, 0x02],
    [0xA5, 0x50, 0x03]
  ];
  // Function to send a command
  const sendCommand = (command) => {
    return new Promise((resolve, reject) => {
      const commandBuffer = Buffer.from(command);
      RuidaClient.send(commandBuffer, 0, commandBuffer.length, RuidaPort, RuidaAddress, (err) => {
        if (err) {
          console.error('Failed to send command:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  };

  // Function to send commands with a delay
  const sendCommandsWithDelay = async () => {
    for (const [index, command] of listOfCommands.entries()) {
      try {
        await sendCommand(command);
        // Delay of 4 seconds (4000 milliseconds) between commands
        
        await new Promise(resolve => setTimeout(resolve, 4000));
        quickPulse(80);
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        return res.status(500).send('Error sending command.');
      }
    }
    res.status(200).send('All commands sent successfully.');
  };

  sendCommandsWithDelay();
});


app.post("/quickPulse", (req, res) => {
 quickPulse(100);
});


const quickPulse = (duration) => {
  const startCommand = Buffer.from([0xA5, 0x50, 0x05]);
  const endCommand = Buffer.from([0xA5, 0x51, 0x05]);

  // Send the start command
  RuidaClient.send(startCommand, 0, startCommand.length, RuidaPort, RuidaAddress, (err) => {
    if (err) {
      console.error('Failed to send start packet:', err);
      return res.status(500).send('Failed to send start packet.');
    }

    // Add a 50ms delay before sending the end command
    setTimeout(() => {
      RuidaClient.send(endCommand, 0, endCommand.length, RuidaPort, RuidaAddress, (err) => {
      });
    }, duration);
  });
}

// Route to send a "start" command
app.post('/sendCommand', (req, res) => {
  // Extract the command from the request body
  const { command } = req.body;

  // Check if the command is provided
  if (!command) {
    return res.status(400).send('Command is required');
  }

  // Define the startCommand based on the received command
  const startCommand = Buffer.from(command);

  // Send the command using RuidaClient
  RuidaClient.send(startCommand, 0, startCommand.length, RuidaPort, RuidaAddress, (err) => {
    if (err) {
      console.error('Failed to send start packet:', err);
      return res.status(500).send('Failed to send start packet.');
    }

    // Respond to the client that the command was sent successfully
    res.status(200).send('Command sent successfully.');

    // Send handshake after sending the command
    sendHandshake();
  });
});


// Start listening for incoming UDP messages on port 40207
RuidaClient.bind(40207);

// Handle incoming UDP messages
// This function handles incoming messages
RuidaClient.on('message', (msg, rinfo) => {
  let coordinatesString;

  // Check if the message contains the byte 0xCC
  if (!msg.includes(0xCC)) {
    coordinatesString = msg.toString('hex');
    
    // Decode the hexadecimal string into a buffer
    const buffer = Buffer.from(coordinatesString, 'hex');
    
    // Ensure the buffer is at least 12 bytes (4 bytes ignored + 4 bytes for X + 4 bytes for Y)
    if (buffer.length < 12) {
      console.error('Buffer too short to contain two 32-bit coordinates');
      return;
    }
  // Extract 27-bit coordinates
    // X Coordinate: Bytes 5, 6, 7
    const x = (buffer[5] << 19) | (buffer[6] << 11) | (buffer[7] << 3);

    // Y Coordinate: Bytes 8, 9, 10
    const y = (buffer[9] << 14) | (buffer[10] << 6) | (buffer[11] >> 2);

    // Convert from nanometers to millimeters
    const x_mm = x / 1_000;
    const y_mm = y / 1_000;
    
    // Log coordinates in millimeters
    console.log(`Coordinates in millimeters: X=${x_mm.toFixed(3)}, Y=${y_mm.toFixed(3)}`);
  }
  

  // Send a handshake every time a UDP message is received
  sendHandshake();
});

  


// Handle errors
RuidaClient.on('error', (err) => {
  console.error('UDP Client Error:', err);
  RuidaClient.close();
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
