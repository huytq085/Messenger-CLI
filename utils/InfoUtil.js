exports.getGroupInfo = (tinfo, senderInfo) => {
    return {
        name: tinfo.name,
        avatar: tinfo.imageSrc,
        sender: {
            name: senderInfo.name,
            avatar: senderInfo.thumbSrc,
            url: senderInfo.profileUrl
        }
    }
}

exports.getReplyMessage = (messageReply, senderInfo) => {
    return {
        message: messageReply.body,
        name: senderInfo.name,
        avatar: senderInfo.thumbSrc,
        url: senderInfo.profileUrl,
        attachments: messageReply.attachments.map(a => {
            return {
                type: a.type,
                url: a.url,
                previewUrl: a.previewUrl
            }
        }).filter(a => a)
    }
}

exports.getMessageContent = (msg, replyMsg) => {
    return {
        content: msg.body,
        replyMsg: replyMsg,
        attachments: msg.attachments.map(a => {
            return {
                type: a.type,
                url: a.url,
                previewUrl: a.previewUrl
            }
        }).filter(a => a)
    }
}

exports.getAttachments = (msg) => {
    return msg.attachments.map(a => a.url || a.facebookUrl).filter(a => a);
}

exports.getAttachmentsAsText = (msg) => {
    const attachments = this.getAttachments(msg);
    return attachments.length > 0 ? `${msg.body}[${attachments.join(", ")}]` : msg.body;
}