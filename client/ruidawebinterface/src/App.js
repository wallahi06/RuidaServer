import './App.css';
import { useState } from 'react';

function App() {
  const [activeButton, setActiveButton] = useState(null);
  const [safetyPressed, setSafetyPressed] = useState(false);

  // Define functions for the macro buttons
  const macroOne = async () => {
    if (!safetyPressed) return; // Check if safety is pressed
    await fetch("http://192.168.0.198:3000/runMirrorTest", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  };

  const macroTwo = async () => {
    if (!safetyPressed) return; // Check if safety is pressed
    await fetch("http://192.168.0.198:3000/quickPulse", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  };

  const macroThree = async () => {
   await fetch("http://192.168.0.198:3000/test", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  };

  // Define functions for the new buttons
  const handleFrame = async () => {
    await fetch("http://192.168.0.198:3000/sendCommand", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: [0xA5, 0x53, 0x00] }),
    });
  };

  const handleOrigin = async () => {
    await fetch("http://192.168.0.98:3000/sendCommand", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: [0xA5, 0x50, 0x08] }),
    });
  };

  const handleReset = async () => {
    await fetch("http://192.168.0.198:3000/sendCommand", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: [0xA5, 0x50, 0x5a] }),
    });
  };

  // Define functions for the corner buttons
  const handleTopLeft = async () => {
    await fetch("http://192.168.0.198:3000/sendCommand", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: [0xA5, 0x50, 0x03, 0xA5, 0x50, 0x01] }),
    });
  };

  const handleTopRight = async () => {
    await fetch("http://192.168.0.198:3000/sendCommand", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: [0xA5, 0x50, 0x03, 0xA5, 0x50, 0x02] }),
    });
  };

  const handleBottomLeft = async () => {
    await fetch("http://192.168.0.198:3000/sendCommand", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: [0xA5, 0x50, 0x04, 0xA5, 0x50, 0x01] }),
    });
  };

  const handleBottomRight = async () => {
    await fetch("http://192.168.0.198:3000/sendCommand", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command: [0xA5, 0x50, 0x04, 0xA5, 0x50, 0x02] }),
    });
  };

  // Define a function that handles button press
  const handleButtonPress = async (direction) => {
    let requestBody;
    if (direction === "Up") {
      requestBody = { command: [0xA5, 0x50, 0x03] };
    } else if (direction === "Down") {
      requestBody = { command: [0xA5, 0x50, 0x04] };
    } else if (direction === "Left") {
      requestBody = { command: [0xA5, 0x50, 0x01] };
    } else if (direction === "Right") {
      requestBody = { command: [0xA5, 0x50, 0x02] };
    } else if (direction === "Pulse") {
      if (!safetyPressed) return; // Check if safety is pressed
      requestBody = { command: [0xA5, 0x50, 0x05] };
    }
  
    setActiveButton(direction);

    try {
      const response = await fetch("http://192.168.0.198:3000/sendCommand", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
  
      if (!response.ok) {
        console.error('Network response was not ok:', response.statusText);
      }
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };
  
  // Define a function that handles button release
  const handleButtonRelease = async (direction) => {
    let requestBody;
    if (direction === "Up") {
      requestBody = { command: [0xA5, 0x51, 0x03] };
    } else if (direction === "Down") {
      requestBody = { command: [0xA5, 0x51, 0x04] };
    } else if (direction === "Left") {
      requestBody = { command: [0xA5, 0x51, 0x01] };
    } else if (direction === "Right") {
      requestBody = { command: [0xA5, 0x51, 0x02] };
    } else if (direction === "Pulse") {
      requestBody = { command: [0xA5, 0x51, 0x05] };
    }

    setActiveButton(null);

    try {
      await fetch("http://192.168.0.198:3000/sendCommand", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  // Define a function to handle the safety button press
  const handleSafetyPress = async (pressed) => {
    setSafetyPressed(pressed);

    const requestBody = { command: [0xA5, 0x51, 0x05] };

    if (!pressed)
    {
      await fetch("http://192.168.0.198:3000/sendCommand", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
    }
  };

  return (
    <div className="App">
      <div className="ip-address">
        <h1>IP ADDRESS</h1>
        <p>192.168.0.10</p>
      </div>
      <div className="gamepad">
        <button
          className={`button up ${activeButton === 'Up' ? 'active' : ''}`}
          onMouseDown={() => handleButtonPress('Up')}
          onMouseUp={() => handleButtonRelease('Up')}
          onTouchStart={() => handleButtonPress('Up')}
          onTouchEnd={() => handleButtonRelease('Up')}
        >
          Up
        </button>
        <button
          className={`button left ${activeButton === 'Left' ? 'active' : ''}`}
          onMouseDown={() => handleButtonPress('Left')}
          onMouseUp={() => handleButtonRelease('Left')}
          onTouchStart={() => handleButtonPress('Left')}
          onTouchEnd={() => handleButtonRelease('Left')}
        >
          Left
        </button>
        <button
          className={`button pulse ${activeButton === 'Pulse' ? 'active' : ''}`}
          onMouseDown={() => handleButtonPress('Pulse')}
          onMouseUp={() => handleButtonRelease('Pulse')}
          onTouchStart={() => handleButtonPress('Pulse')}
          onTouchEnd={() => handleButtonRelease('Pulse')}
        >
          Pulse
        </button>
        <button
          className={`button right ${activeButton === 'Right' ? 'active' : ''}`}
          onMouseDown={() => handleButtonPress('Right')}
          onMouseUp={() => handleButtonRelease('Right')}
          onTouchStart={() => handleButtonPress('Right')}
          onTouchEnd={() => handleButtonRelease('Right')}
        >
          Right
        </button>
        <button
          className={`button down ${activeButton === 'Down' ? 'active' : ''}`}
          onMouseDown={() => handleButtonPress('Down')}
          onMouseUp={() => handleButtonRelease('Down')}
          onTouchStart={() => handleButtonPress('Down')}
          onTouchEnd={() => handleButtonRelease('Down')}
        >
          Down
        </button>
        <button
          className="corner-button top-left"
          onClick={handleTopLeft}
        >
          TL
        </button>
        <button
          className="corner-button top-right"
          onClick={handleTopRight}
        >
          TR
        </button>
        <button
          className="corner-button bottom-left"
          onClick={handleBottomLeft}
        >
          BL
        </button>
        <button
          className="corner-button bottom-right"
          onClick={handleBottomRight}
        >
          BR
        </button>
      </div>
      <div className="macros">
        <button className="macro-button" onClick={macroOne}>
          Mirror Test
        </button>
        <button className="macro-button" onClick={macroTwo}>
          Quickpulse
        </button>
        <button className="macro-button" onClick={macroThree}>
          Macro 3
        </button>
      </div>
      <div className="additional-buttons">
        <button className="additional-button" onClick={handleFrame}>
          Frame
        </button>
        <button className="additional-button" onClick={handleOrigin}>
          Origin
        </button>
        <button className="additional-button" onClick={handleReset}>
          Reset
        </button>
      </div>
      <div className="safety">
        <button
          className={`safety-button ${safetyPressed ? 'active' : ''}`}
          onMouseDown={() => handleSafetyPress(true)}
          onMouseUp={() => handleSafetyPress(false)}
          onTouchStart={() => handleSafetyPress(true)}
          onTouchEnd={() => handleSafetyPress(false)}
        >
          Safety
        </button>
      </div>
    </div>
  );
}

export default App;
