"use strict";
const WAProto = require('../../WAProto').proto;
const crypto = require('crypto');
const Utils_1 = require("../Utils");
const WABinary_1 = require("../WABinary");

class GiftedStatus {
    constructor(utils, waUploadToServer, relayMessageFn, config, sock) {
        this.utils = utils;
        this.relayMessage = relayMessageFn;
        this.waUploadToServer = waUploadToServer;
        this.config = config;
        this.sock = sock;
        
        this.bail = {
            generateWAMessageContent: this.utils.generateWAMessageContent || Utils_1.generateWAMessageContent,
            generateMessageID: Utils_1.generateMessageID,
            getContentType: (msg) => Object.keys(msg.message || {})[0]
        };
    }

    detectType(content) {
        if (content.groupStatusMessage) return 'GROUP_STORY';
        if (content.interactiveMessage) return 'INTERACTIVE';
        if (content.albumMessage) return 'ALBUM';
        if (content.eventMessage) return 'EVENT';
        return null;
    }

    async handleGroupStory(content, jid, quoted) {
        const storyData = content.groupStatusMessage;
        let waMsgContent;
        
        if (storyData.message) {
            waMsgContent = storyData;
        } else {
            if (typeof this.bail?.generateWAMessageContent === "function") {
                waMsgContent = await this.bail.generateWAMessageContent(storyData, {
                    upload: this.waUploadToServer
                });
            } else if (typeof this.utils?.generateWAMessageContent === "function") {
                waMsgContent = await this.utils.generateWAMessageContent(storyData, {
                    upload: this.waUploadToServer
                });
            } else if (typeof this.utils?.prepareMessageContent === "function") {
                waMsgContent = await this.utils.prepareMessageContent(storyData, {
                    upload: this.waUploadToServer
                });
            } else {
                waMsgContent = await Utils_1.generateWAMessageContent(storyData, {
                    upload: this.waUploadToServer
                });
            }
        }

        let msg = {
            message: {
                groupStatusMessageV2: {
                    message: waMsgContent.message || waMsgContent
                }
            }
        };

        return await this.relayMessage(jid, msg.message, {
            messageId: this.bail.generateMessageID()
        });
    }

    async sendStatusToGroups(content, jids = []) {
        const userJid = WABinary_1.jidNormalizedUser(this.sock.authState.creds.me.id);
        let allUsers = new Set();
        allUsers.add(userJid);

        for (const id of jids) {
            const isGroup = WABinary_1.isJidGroup(id);
            const isPrivate = WABinary_1.isJidUser(id);

            if (isGroup) {
                try {
                    const metadata = await this.sock.groupMetadata(id);
                    const participants = metadata.participants.map(p => WABinary_1.jidNormalizedUser(p.id));
                    participants.forEach(jid => allUsers.add(jid));
                } catch (error) {
                    this.config.logger?.error?.(`Error getting metadata for group ${id}: ${error}`);
                }
            } else if (isPrivate) {
                allUsers.add(WABinary_1.jidNormalizedUser(id));
            }
        }

        const uniqueUsers = Array.from(allUsers);
        const getRandomHexColor = () => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");

        const isMedia = content.image || content.video || content.audio;
        const isAudio = !!content.audio;

        const messageContent = { ...content };

        if (isMedia && !isAudio) {
            if (messageContent.text) {
                messageContent.caption = messageContent.text;
                delete messageContent.text;
            }
            delete messageContent.ptt;
            delete messageContent.font;
            delete messageContent.backgroundColor;
            delete messageContent.textColor;
        }

        if (isAudio) {
            delete messageContent.text;
            delete messageContent.caption;
            delete messageContent.font;
            delete messageContent.textColor;
        }

        const font = !isMedia ? (content.font || Math.floor(Math.random() * 9)) : undefined;
        const textColor = !isMedia ? (content.textColor || getRandomHexColor()) : undefined;
        const backgroundColor = (!isMedia || isAudio) ? (content.backgroundColor || getRandomHexColor()) : undefined;
        const ptt = isAudio ? (typeof content.ptt === 'boolean' ? content.ptt : true) : undefined;

        let msg;
        let mediaHandle;
        
        try {
            const link_preview_1 = require("../Utils/link-preview");
            
            msg = await Utils_1.generateWAMessage(WABinary_1.STORIES_JID, messageContent, {
                logger: this.config.logger,
                userJid,
                getUrlInfo: text => link_preview_1.getUrlInfo(text, {
                    thumbnailWidth: this.config.linkPreviewImageThumbnailWidth,
                    fetchOpts: { timeout: 3000, ...this.config.options || {} },
                    logger: this.config.logger,
                    uploadImage: this.config.generateHighQualityLinkPreview ? this.waUploadToServer : undefined
                }),
                upload: async (encFilePath, opts) => {
                    const up = await this.waUploadToServer(encFilePath, { ...opts });
                    mediaHandle = up.handle;
                    return up;
                },
                mediaCache: this.config.mediaCache,
                options: this.config.options,
                font,
                textColor,
                backgroundColor,
                ptt
            });
        } catch (error) {
            this.config.logger?.error?.(`Error generating message: ${error}`);
            throw error;
        }

        await this.relayMessage(WABinary_1.STORIES_JID, msg.message, {
            messageId: msg.key.id,
            statusJidList: uniqueUsers,
            additionalNodes: [
                {
                    tag: 'meta',
                    attrs: {},
                    content: [
                        {
                            tag: 'mentioned_users',
                            attrs: {},
                            content: jids.map(jid => ({
                                tag: 'to',
                                attrs: { jid: WABinary_1.jidNormalizedUser(jid) }
                            }))
                        }
                    ]
                }
            ]
        });

        for (const id of jids) {
            try {
                const normalizedId = WABinary_1.jidNormalizedUser(id);
                const isPrivate = WABinary_1.isJidUser(normalizedId);
                const type = isPrivate ? 'statusMentionMessage' : 'groupStatusMentionMessage';

                const protocolMessage = {
                    [type]: {
                        message: {
                            protocolMessage: {
                                key: msg.key,
                                type: 25
                            }
                        }
                    },
                    messageContextInfo: {
                        messageSecret: crypto.randomBytes(32)
                    }
                };

                const statusMsg = await Utils_1.generateWAMessageFromContent(
                    normalizedId,
                    protocolMessage,
                    {}
                );

                await this.relayMessage(
                    normalizedId,
                    statusMsg.message,
                    {
                        additionalNodes: [{
                            tag: 'meta',
                            attrs: isPrivate ?
                                { is_status_mention: 'true' } :
                                { is_group_status_mention: 'true' }
                        }]
                    }
                );

                await Utils_1.delay(2000);
            } catch (error) {
                this.config.logger?.error?.(`Error sending to ${id}: ${error}`);
            }
        }

        return msg;
    }

    async sendGroupStatus(groupJid, content, options = {}) {
        const storyData = content;
        let waMsgContent;
        
        if (storyData.message) {
            waMsgContent = storyData;
        } else {
            waMsgContent = await Utils_1.generateWAMessageContent(storyData, {
                upload: this.waUploadToServer
            });
        }

        const msg = {
            message: {
                groupStatusMessageV2: {
                    message: waMsgContent.message || waMsgContent
                }
            }
        };

        const messageId = options.messageId || this.bail.generateMessageID();

        return await this.relayMessage(groupJid, msg.message, {
            messageId,
            ...options
        });
    }
}

module.exports = GiftedStatus;
