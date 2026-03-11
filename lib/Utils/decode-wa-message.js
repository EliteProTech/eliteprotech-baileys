"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptMessageNode = exports.NACK_REASONS = exports.MISSING_KEYS_ERROR_TEXT = exports.NO_MESSAGE_FOUND_ERROR_TEXT = void 0;
exports.decodeMessageNode = decodeMessageNode;
const boom_1 = require("@hapi/boom");
const WAProto_1 = require("../../WAProto");
const WABinary_1 = require("../WABinary");
const generics_1 = require("./generics");
const lid_mapping_1 = require("./lid-mapping");
exports.NO_MESSAGE_FOUND_ERROR_TEXT = 'Message absent from node';
exports.MISSING_KEYS_ERROR_TEXT = 'Key used already or never filled';
exports.NACK_REASONS = {
    ParsingError: 487,
    UnrecognizedStanza: 488,
    UnrecognizedStanzaClass: 489,
    UnrecognizedStanzaType: 490,
    InvalidProtobuf: 491,
    InvalidHostedCompanionStanza: 493,
    MissingMessageSecret: 495,
    SignalErrorOldCounter: 496,
    MessageDeletedOnPeer: 499,
    UnhandledError: 500,
    UnsupportedAdminRevoke: 550,
    UnsupportedLIDGroup: 551,
    DBOperationFailed: 552
};
/**
 * Decode the received node as a message.
 * @note this will only parse the message, not decrypt it
 */
function decodeMessageNode(stanza, meId, meLid) {
    var _a, _b, _c, _d, _e;
    let msgType;
    let chatId;
    let author;
    const msgId = stanza.attrs.id;
    const from = stanza.attrs.from;
    const participant = stanza.attrs.participant;
    const recipient = stanza.attrs.recipient;
    const isMe = (jid) => (0, WABinary_1.areJidsSameUser)(jid, meId);
    const isMeLid = (jid) => (0, WABinary_1.areJidsSameUser)(jid, meLid);
    if ((0, WABinary_1.isJidUser)(from) || (0, WABinary_1.isLidUser)(from)) {
        if (recipient && !(0, WABinary_1.isJidMetaIa)(recipient)) {
            if (!isMe(from) && !isMeLid(from)) {
                throw new boom_1.Boom('receipient present, but msg not from me', { data: stanza });
            }
            chatId = recipient;
        }
        else {
            chatId = from;
        }
        msgType = 'chat';
        author = from;
    }
    else if ((0, WABinary_1.isJidGroup)(from)) {
        if (!participant) {
            throw new boom_1.Boom('No participant in group message');
        }
        msgType = 'group';
        author = participant;
        chatId = from;
    }
    else if ((0, WABinary_1.isJidBroadcast)(from)) {
        if (!participant) {
            throw new boom_1.Boom('No participant in group message');
        }
        const isParticipantMe = isMe(participant);
        if ((0, WABinary_1.isJidStatusBroadcast)(from)) {
            msgType = isParticipantMe ? 'direct_peer_status' : 'other_status';
        }
        else {
            msgType = isParticipantMe ? 'peer_broadcast' : 'other_broadcast';
        }
        chatId = from;
        author = participant;
    }
    else if ((0, WABinary_1.isJidNewsletter)(from)) {
        msgType = 'newsletter';
        chatId = from;
        author = from;
    }
    else {
        throw new boom_1.Boom('Unknown message type', { data: stanza });
    }
    const participantOrFrom = stanza.attrs.participant || stanza.attrs.from;
    const fromMe = ((0, WABinary_1.isLidUser)(participantOrFrom) ? isMeLid : isMe)(participantOrFrom);
    const pushname = (_a = stanza === null || stanza === void 0 ? void 0 : stanza.attrs) === null || _a === void 0 ? void 0 : _a.notify;
    let senderLidValue = (_b = stanza === null || stanza === void 0 ? void 0 : stanza.attrs) === null || _b === void 0 ? void 0 : _b.sender_lid;
    let senderPnValue = (_c = stanza === null || stanza === void 0 ? void 0 : stanza.attrs) === null || _c === void 0 ? void 0 : _c.sender_pn;
    if (fromMe && !senderPnValue && meId) {
        const mePhone = meId.split(':')[0];
        if (mePhone && /^\d+$/.test(mePhone)) {
            senderPnValue = mePhone + '@s.whatsapp.net';
        }
    }
    if (fromMe && !senderLidValue && meLid) {
        senderLidValue = meLid;
    }
    if (msgType === 'chat') {
        if (!fromMe) {
            if ((0, WABinary_1.isJidUser)(chatId) && !senderPnValue) {
                senderPnValue = (0, WABinary_1.jidNormalizedUser)(chatId);
            }
            if ((0, WABinary_1.isJidUser)(chatId) && !senderLidValue) {
                const normalizedChatId = (0, WABinary_1.jidNormalizedUser)(chatId);
                const possibleLid = lid_mapping_1.globalLidMapping.getLidFromPn(normalizedChatId);
                if (possibleLid) {
                    senderLidValue = possibleLid;
                }
            }
            if ((0, WABinary_1.isLidUser)(chatId) && !senderLidValue) {
                senderLidValue = chatId;
            }
            if (senderLidValue && !senderPnValue) {
                senderPnValue = lid_mapping_1.globalLidMapping.getPnFromLid(senderLidValue);
            }
            if (senderLidValue) {
                chatId = senderLidValue;
            }
        } else {
            if ((0, WABinary_1.isJidUser)(chatId) && !senderLidValue) {
                const normalizedChatId = (0, WABinary_1.jidNormalizedUser)(chatId);
                const possibleLid = lid_mapping_1.globalLidMapping.getLidFromPn(normalizedChatId);
                if (possibleLid) {
                    senderLidValue = possibleLid;
                }
            }
            if (senderLidValue && !senderPnValue) {
                senderPnValue = lid_mapping_1.globalLidMapping.getPnFromLid(senderLidValue);
            }
            if ((0, WABinary_1.isLidUser)(chatId) && !senderPnValue) {
                senderPnValue = lid_mapping_1.globalLidMapping.getPnFromLid(chatId);
            }
        }
    }
    if (senderPnValue) {
        senderPnValue = (0, WABinary_1.jidNormalizedUser)(senderPnValue);
    }
    if (senderLidValue && senderPnValue) {
        lid_mapping_1.globalLidMapping.set(senderLidValue, senderPnValue);
    }
    let participantPnValue = (_d = stanza === null || stanza === void 0 ? void 0 : stanza.attrs) === null || _d === void 0 ? void 0 : _d.participant_pn;
    let participantLidValue = (_e = stanza === null || stanza === void 0 ? void 0 : stanza.attrs) === null || _e === void 0 ? void 0 : _e.participant_lid;
    if (msgType === 'group' || msgType === 'peer_broadcast' || msgType === 'other_broadcast') {
        if (!participantPnValue) {
            participantPnValue = senderPnValue || (stanza === null || stanza === void 0 ? void 0 : stanza.attrs.sender_pn) || (stanza === null || stanza === void 0 ? void 0 : stanza.attrs.peer_recipient_pn);
        }
        if (!participantLidValue) {
            participantLidValue = senderLidValue || (stanza === null || stanza === void 0 ? void 0 : stanza.attrs.sender_lid) || (stanza === null || stanza === void 0 ? void 0 : stanza.attrs.peer_recipient_lid);
        }
        if (!participantLidValue && participant && (0, WABinary_1.isLidUser)(participant)) {
            participantLidValue = participant;
        }
        if (!participantPnValue && participantLidValue) {
            participantPnValue = lid_mapping_1.globalLidMapping.getPnFromLid(participantLidValue);
        }
        if (!participantPnValue && participant && (0, WABinary_1.isLidUser)(participant)) {
            participantPnValue = lid_mapping_1.globalLidMapping.getPnFromLid(participant);
        }
        if (fromMe && !participantPnValue && meId) {
            const mePhone = meId.split(':')[0];
            if (mePhone && /^\d+$/.test(mePhone)) {
                participantPnValue = mePhone + '@s.whatsapp.net';
            }
        }
        if (fromMe && !participantLidValue && meLid) {
            participantLidValue = meLid;
        }
        if (participantLidValue && participantPnValue) {
            lid_mapping_1.globalLidMapping.set(participantLidValue, participantPnValue);
        }
    }
    const key = {
        remoteJid: chatId,
        fromMe,
        id: msgId,
        ...(senderLidValue ? { senderLid: senderLidValue } : {}),
        ...(senderPnValue ? { senderPn: senderPnValue } : {}),
        ...(participant ? { participant } : {}),
        ...(participantPnValue ? { participantPn: participantPnValue } : {}),
        ...(participantLidValue ? { participantLid: participantLidValue } : {}),
        ...(msgType === 'newsletter' && stanza.attrs.server_id ? { server_id: stanza.attrs.server_id } : {})
    };
    const fullMessage = {
        key,
        messageTimestamp: +stanza.attrs.t,
        pushName: pushname,
        broadcast: (0, WABinary_1.isJidBroadcast)(from)
    };
    if (key.fromMe) {
        fullMessage.status = WAProto_1.proto.WebMessageInfo.Status.SERVER_ACK;
    }
    return {
        fullMessage,
        author,
        sender: msgType === 'chat' ? author : chatId
    };
}
const decryptMessageNode = (stanza, meId, meLid, repository, logger) => {
    const { fullMessage, author, sender } = decodeMessageNode(stanza, meId, meLid);
    return {
        fullMessage,
        category: stanza.attrs.category,
        author,
        async decrypt() {
            var _a;
            let decryptables = 0;
            if (Array.isArray(stanza.content)) {
                for (const { tag, attrs, content } of stanza.content) {
                    if (tag === 'verified_name' && content instanceof Uint8Array) {
                        const cert = WAProto_1.proto.VerifiedNameCertificate.decode(content);
                        const details = WAProto_1.proto.VerifiedNameCertificate.Details.decode(cert.details);
                        fullMessage.verifiedBizName = details.verifiedName;
                    }
                    if (tag !== 'enc' && tag !== 'plaintext') {
                        continue;
                    }
                    if (!(content instanceof Uint8Array)) {
                        continue;
                    }
                    decryptables += 1;
                    let msgBuffer;
                    try {
                        const e2eType = tag === 'plaintext' ? 'plaintext' : attrs.type;
                        switch (e2eType) {
                            case 'skmsg':
                                msgBuffer = await repository.decryptGroupMessage({
                                    group: sender,
                                    authorJid: author,
                                    msg: content
                                });
                                break;
                            case 'pkmsg':
                            case 'msg':
                                const user = (0, WABinary_1.isJidUser)(sender) ? sender : author;
                                msgBuffer = await repository.decryptMessage({
                                    jid: user,
                                    type: e2eType,
                                    ciphertext: content
                                });
                                break;
                            case 'plaintext':
                                msgBuffer = content;
                                break;
                            default:
                                throw new Error(`Unknown e2e type: ${e2eType}`);
                        }
                        let msg = WAProto_1.proto.Message.decode(e2eType !== 'plaintext' ? (0, generics_1.unpadRandomMax16)(msgBuffer) : msgBuffer);
                        msg = ((_a = msg.deviceSentMessage) === null || _a === void 0 ? void 0 : _a.message) || msg;
                        if (msg.senderKeyDistributionMessage) {
                            //eslint-disable-next-line max-depth
                            try {
                                await repository.processSenderKeyDistributionMessage({
                                    authorJid: author,
                                    item: msg.senderKeyDistributionMessage
                                });
                            }
                            catch (err) {
                                logger.error({ key: fullMessage.key, err }, 'failed to decrypt message');
                            }
                        }
                        if (fullMessage.message) {
                            Object.assign(fullMessage.message, msg);
                        }
                        else {
                            fullMessage.message = msg;
                        }
                    }
                    catch (err) {
                        logger.error({ key: fullMessage.key, err }, 'failed to decrypt message');
                        fullMessage.messageStubType = WAProto_1.proto.WebMessageInfo.StubType.CIPHERTEXT;
                        fullMessage.messageStubParameters = [err.message];
                    }
                }
            }
            // if nothing was found to decrypt
            if (!decryptables) {
                fullMessage.messageStubType = WAProto_1.proto.WebMessageInfo.StubType.CIPHERTEXT;
                fullMessage.messageStubParameters = [exports.NO_MESSAGE_FOUND_ERROR_TEXT];
            }
        }
    };
};
exports.decryptMessageNode = decryptMessageNode;
