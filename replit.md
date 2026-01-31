# keith-baileys

## Overview
A lightweight, full-featured WhatsApp Web API library for Node.js. This is an npm library package that provides functionality for connecting to and interacting with WhatsApp Web.

## Project Structure
- `lib/` - Main library source code
  - `index.js` - Main entry point
  - `Socket/` - WebSocket client implementation
  - `Signal/` - Signal protocol implementation
  - `Utils/` - Utility functions
  - `Types/` - TypeScript type definitions
  - `WABinary/` - WhatsApp binary protocol handling
  - `WAM/` - WhatsApp metrics
  - `WAUSync/` - Sync protocol implementation
  - `Defaults/` - Default configurations
- `WAProto/` - Protocol buffer definitions
- `test.js` - Simple test script to verify library loads

## Setup
The project uses Node.js 20+. Dependencies are managed via npm.

### Install Dependencies
```bash
npm install
```

### Test Library
```bash
node test.js
```

## Usage
This is a library package meant to be imported into other projects:

```javascript
const { makeWASocket } = require('keith-baileys');
// Or ES modules
import { makeWASocket } from 'keith-baileys';
```

## Key Exports
- `makeWASocket` - Main function to create a WhatsApp socket connection
- `proto` - Protocol buffer definitions
- `Browsers` - Browser configurations
- Various utility functions for message handling, encryption, etc.

## Requirements
- Node.js 20 or higher (enforced by engine-requirements.js)
