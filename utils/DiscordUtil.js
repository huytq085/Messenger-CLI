
exports.hookSend = (client, groupInfo, message) => {
    let isGroup = (groupInfo.name != null);
    let imgReplyMsg;
    let author = null;
    let description = message.content;
    let imageUrl = "";
    if (isGroup) {
        author = {
            "name": groupInfo.sender.name,
            "icon_url": groupInfo.sender.avatar
        }
    }
    if (message.replyMsg) {
        description = `Replied to ${message.replyMsg.name}`;
        if (message.replyMsg.message) {
            description += `\`\`\`${message.replyMsg.message}\`\`\``
        }
        if (message.replyMsg.attachments.length > 0) {
            const att = message.replyMsg.attachments[0];
            if (att.type === "video" && message.content !== "") {
                description += `\`\`\`Video Content \n${att.url}\`\`\``;
                imgReplyMsg = att.previewUrl;
            } else {
                description += `\`\`\`Image Content\`\`\``;
                imgReplyMsg = att.url;
            }
        }
        description += message.content;
    }
    if (message.attachments.length > 0) {
        const att = message.attachments[0];
        if (att.type === "video") {
            description = `${message.content}\n${message.attachments[0].url}`;
            imageUrl = att.previewUrl;
            client.send(att.url, {
                username: groupInfo.name || groupInfo.sender.name,
                avatarURL: groupInfo.avatar || groupInfo.sender.avatar
            })
        } else {
            imageUrl = att.url;
        }
    }


    client.send({
        username: groupInfo.name || groupInfo.sender.name,
        avatarURL: groupInfo.avatar || groupInfo.sender.avatar,
        embeds: [
            {
                "description": description,
                "thumbnail": {
                    "url": imgReplyMsg
                },
                "color": 2194493,
                "image": {
                    "url": imageUrl
                },
                "author": author
            }
        ]
    })
}