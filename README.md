# grandMA3 Remote Control

A web-based remote control application for grandMA3 lighting console, featuring scene management and fader control via OSC protocol.

## 📋 Overview

This application consists of two main components:
- **Client** - React-based web interface (`client/` folder)
- **Server** - Node.js backend with OSC communication (`server/` folder)

The interface provides two control modes:
- **Button Mode** - Quick scene switching with customizable crossfade duration
- **Fader Mode** - Manual control of individual faders (1-8)

## 📋 Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

To verify installation, run:
```bash
node --version
npm --version
```

## 🚀 Quick Start

### First Time Setup

Install dependencies for both server and client:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client/grandma3-simplecontrol
npm install
```

### Using the Batch File (Windows)

After installing dependencies, simply run the provided batch file to start both client and server:

```bash
RUN MA3 REMOTE.bat
```

This will automatically:
- Start the React development server (accessible on your network)
- Start the Node.js backend server
- Open two separate command windows for each process

### Manual Start

If you prefer to start components individually:

**Start the Server:**
```bash
cd server
node server.js
```

**Start the Client:**
```bash
cd client/grandma3-simplecontrol
npm run dev -- --host
```

## ⚙️ Configuration

### Server Settings (`server/server.js`)

Edit the following constants to match your grandMA3 setup:

```javascript
const MA3_IP = "172.16.15.1";    // grandMA3 IP address
const MA3_PORT = 8000;            // OSC input port in MA3
const MA3_PREFIX = "/gma3";       // OSC prefix (set in MA3)
const LOCAL_PORT = 9001;          // Local server port
```

### Client Settings (`client/grandma3-simplecontrol/App.jsx`)

Update the backend URL if needed:

```javascript
const BACKEND = "http://localhost:3001";
```

### grandMA3 OSC Configuration

1. Enable OSC input in grandMA3
2. Set the input port (default: 8000)
3. Configure OSC prefix if using one (e.g., `/gma3`)
4. Ensure fader masters are set up on Page 1, executors 201-208

## 📱 Features

### Button Mode
- 8 scene buttons for quick access
- Adjustable crossfade duration (0-2000ms)
- Smooth transitions between scenes
- Visual indication of active scene

### Fader Mode
- 8 vertical faders for manual control
- Real-time percentage display
- Direct control of grandMA3 fader masters
- Touch-friendly interface for tablets/mobile

### Additional Features
- **Triple-click configuration panel** - Click three times anywhere outside the main panel to show/hide configuration
- **Mobile-optimized** - Responsive design with scroll lock
- **Current state display** - Shows active scene and current mode
- **Network status** - Configuration reload button to check connection

## 🎛️ grandMA3 Fader Mapping

The application controls the following fader masters:

| Fader | grandMA3 Executor |
|-------|-------------------|
| Fader 1 | Page 1.201 |
| Fader 2 | Page 1.202 |
| Fader 3 | Page 1.203 |
| Fader 4 | Page 1.204 |
| Fader 5 | Page 1.205 |
| Fader 6 | Page 1.206 |
| Fader 7 | Page 1.207 |
| Fader 8 | Page 1.208 |

## 🔧 CLI Tool (Optional)

A command-line tool is included for testing OSC commands:

```bash
node sendosc.js "FaderMaster Page 1.201 At 50"
```

Edit `sendosc.js` to configure:
- `MA3_IP` - grandMA3 IP address
- `MA3_PORT` - OSC port
- `MA3_PREFIX` - OSC prefix
- `LOCAL_PORT` - Local sending port

## 📦 Dependencies

### Server
- express
- body-parser
- cors
- osc

### Client
- react
- vite

**Note:** Dependencies are automatically installed when you run `npm install` in each directory during the First Time Setup.

## 🌐 Network Access

The client runs with `--host` flag, making it accessible from other devices on your network. After starting, you'll see URLs like:

```
Local:   http://localhost:5173
Network: http://192.168.x.x:5173
```

Use the Network URL to access the interface from tablets, phones, or other computers.

## 🛠️ Troubleshooting

**OSC commands not working:**
- Verify grandMA3 OSC settings (enabled, correct port)
- Check IP address and port in `server.js`
- Ensure firewall allows UDP traffic on the configured port
- Test with `sendosc.js` CLI tool

**Client can't connect to server:**
- Update `BACKEND` URL in `App.jsx` to match your server IP
- Ensure server is running (check console output)
- Verify server is listening on port 3001

**Faders not responding:**
- Check that fader masters exist on Page 1, executors 201-208
- Verify executor numbers match your grandMA3 setup
- Try manual control first, then scene buttons

## 📄 License

This project is provided as-is for controlling grandMA3 lighting consoles via OSC protocol.

## 🤝 Contributing

Feel free to modify the code to suit your specific grandMA3 setup and workflow requirements.