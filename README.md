<div align="center">
  <h1>EliteProTech-Baileys</h1>
  <p>A WebSocket-based JavaScript library for interacting with the WhatsApp Web API</p>

  [![npm version](https://img.shields.io/npm/v/eliteprotech-baileys.svg)](https://www.npmjs.com/package/eliteprotech-baileys)
  [![npm downloads](https://img.shields.io/npm/dm/eliteprotech-baileys.svg)](https://www.npmjs.com/package/eliteprotech-baileys)
  [![License](https://img.shields.io/npm/l/eliteprotech-baileys.svg)](https://github.com/mauricegift/eliteprotech-baileys/blob/main/LICENSE)
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
- Community management APIs
- Group status/story sending functionality
- Sticker pack creation and sending
- Session management and restoration
- Message sending, receiving, and manipulation
- Group management
- Privacy settings
- Profile management
- And much more!

## EliteProTech Features

### Communities

Community APIs are available directly from the socket:

```javascript
const community = await sock.communityCreate(
  'EliteProTech Community',
  'EliteProTech community'
)

await sock.communityUpdateSubject(
  community.id,
  'EliteProTech Community'
)

await sock.communityUpdateDescription(
  community.id,
  'Official EliteProTech community'
)
```

Available community operations include:

- `communityCreate`
- `communityLeave`
- `communityMetadata`
- `communityUpdateSubject`
- `communityUpdateDescription`
- `communityRequestParticipantsList`
- `communityRequestParticipantsUpdate`
- `communityParticipantsUpdate`
- `communityInviteCode`
- `communityRevokeInvite`
- `communityAcceptInvite`
- `communityRevokeInviteV4`
- `communityAcceptInviteV4`
- `communityGetInviteInfo`
- `communityToggleEphemeral`
- `communitySettingUpdate`
- `communityMemberAddMode`
- `communityJoinApprovalMode`
- `communityFetchAllParticipating`

### Group Status

EliteProTech-Baileys includes group status/story support through `sendMessage()` and `giftedStatus`.

```javascript
await sock.sendMessage(jid, {
  groupStatusMessage: {
    text: 'Hello from EliteProTech',
    backgroundColor: '#FF0000',
    textColor: '#FFFFFF',
    font: 1
  }
})
```

### Sticker Packs

Sticker packs can be generated and sent with one native socket method. Pass image `Buffer` values in the images array.

The method automatically:

- Builds the sticker pack
- Uses the first image as the cover
- Uploads the encrypted sticker-pack media
- Creates the `StickerPackMessage`
- Sends the pack with `relayMessage()`

Quoted sending is also supported:

```javascript
await sock.sendStickerPack(
  jid,
  [image1, image2],
  {
    name: 'EliteProTech',
    publisher: 'EliteProTech',
    description: 'EliteProTech Sticker Pack'
  },
  { quoted: m }
)
```

### LID Support

The fork includes LID-aware addressing for personal chats and groups, helping message and group operations work with WhatsApp's newer addressing format.

### Media & Messaging

The library includes the existing Baileys message and media APIs together with EliteProTech-specific additions such as group-status handling, sticker-pack sending, media upload support, message updates, and group/community operations.

> [!CAUTION]
> **NOTE:** THIS IS A BAILEYS MOD FROM OFFICIAL BAILEYS AND GIFTED BAILEYS.
