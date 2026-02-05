<div align="center">
  <h1>EliteProTech-Baileys</h1>
  <p>A WebSocket-based JavaScript library for interacting with the WhatsApp Web API</p>
  
  [![npm version](https://img.shields.io/npm/v/gifted-baileys.svg)](https://www.npmjs.com/package/gifted-baileys)
  [![npm downloads](https://img.shields.io/npm/dm/gifted-baileys.svg)](https://www.npmjs.com/package/gifted-baileys)
  [![License](https://img.shields.io/npm/l/gifted-baileys.svg)](https://github.com/mauricegift/gifted-baileys/blob/main/LICENSE)
</div>

## Disclaimer

This project is not affiliated, associated, authorized, endorsed by, or in any way officially connected with WhatsApp or any of its subsidiaries or affiliates. Use at your own discretion. Do not spam people with this. We discourage any stalkerware, bulk or automated messaging usage.

## Installation

```bash
npm install eliteprotech-baileys
```

## Quick Start

### CommonJS (Recommended)
```javascript
const { default: makeWASocket, useMultiFileAuthState, Browsers } = require('eliteprotech-baileys')
```

### ES Modules / TypeScript
```javascript
import pkg from 'eliteprotech-baileys'
const { default: makeWASocket, useMultiFileAuthState, Browsers } = pkg
```

## Features

- Full WhatsApp Web API support
- Multi-device support with QR code and pairing code authentication
- LID (Link ID) addressing support for both personal chats and groups
- Group status/story sending functionality
- Session management and restoration
- Message sending, receiving, and manipulation
- Group management
- Privacy settings
- Profile management
- And much more!

> **Note:** This is a baileys mod from official baileys and Gifted baileys.
