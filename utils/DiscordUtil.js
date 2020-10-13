
exports.hookSendByGroup = (client, groupInfo, message) => {
    console.log(groupInfo);
    client.send({
        username: groupInfo.name || groupInfo.sender.name,
        avatarURL: groupInfo.avatar || groupInfo.sender.avatar,
        embeds: [
            {
                "description": message.content,
                "color": 2194493,
                "image": {
                    "url": message.attachments.length > 0 ? message.attachments[0] : ""
                },
                "author": {
                    "name": groupInfo.sender.name,
                    "icon_url": groupInfo.sender.avatar
                }
            }
        ]
    })
}
// Sample Date
// {
//     type: 'message',
//     senderID: '319777191532546',
//     body: '',
//     threadID: '319777191532546',
//     messageID: 'mid.$cAAF4Ie6USTp7VEASRF1IvrJOCzSq',
//     attachments: [
//       {
//         type: 'photo',
//         ID: '395447554802179',
//         filename: 'image-395447554802179',
//         thumbnailUrl: 'https://scontent.xx.fbcdn.net/v/t1.15752-0/cp0/p34x34/107392265_280068809897402_5894974655467403551_n.jpg?_nc_cat=106&_nc_sid=ae9488&_nc_ohc=Jb7ATsSrxVEAX-LTQuX&_nc_ad=z-m&_nc_cid=0&_nc_ht=scontent.xx&_nc_tp=27&oh=9a961027aa4478002083495fffb3d169&oe=5FAB3DD8',
//         previewUrl: 'https://scontent.xx.fbcdn.net/v/t1.15752-0/p280x280/107392265_280068809897402_5894974655467403551_n.jpg?_nc_cat=106&_nc_sid=ae9488&_nc_ohc=Jb7ATsSrxVEAX-LTQuX&_nc_ad=z-m&_nc_cid=0&_nc_ht=scontent.xx&tp=6&oh=eabee17294f3d9909e21ae9785b11072&oe=5FAB1C42',
//         previewWidth: 498,
//         previewHeight: 280,
//         largePreviewUrl: 'https://scontent.xx.fbcdn.net/v/t1.15752-9/p851x315/107392265_280068809897402_5894974655467403551_n.jpg?_nc_cat=106&_nc_sid=ae9488&_nc_ohc=Jb7ATsSrxVEAX-LTQuX&_nc_ad=z-m&_nc_cid=0&_nc_ht=scontent.xx&tp=6&oh=1ba7b2c705f0334702f937470fad684d&oe=5FABF3AE',
//         largePreviewWidth: 851,
//         largePreviewHeight: 479,
//         url: 'https://scontent.xx.fbcdn.net/v/t1.15752-9/p851x315/107392265_280068809897402_5894974655467403551_n.jpg?_nc_cat=106&_nc_sid=ae9488&_nc_ohc=Jb7ATsSrxVEAX-LTQuX&_nc_ad=z-m&_nc_cid=0&_nc_ht=scontent.xx&tp=6&oh=1ba7b2c705f0334702f937470fad684d&oe=5FABF3AE',
//         width: 3840,
//         height: 2160,
//         name: 'image-395447554802179'
//       }
//     ],
//     mentions: {},
//     timestamp: '1602609662532',
//     isGroup: false
//   },
//   [Trại Phục Hồi Nhân Phẩm]tinfo
// {
//   threadID: '2046249405401556',
//   threadName: 'Trại Phục Hồi Nhân Phẩm',
//   participantIDs: [
//     '100004040114245',
//     '100004077031736',
//     '100004731280431',
//     '100005454968899',
//     '100006985843750',
//     '100007566840768'
//   ],
//   unreadCount: 2,
//   messageCount: 46791,
//   timestamp: '1602610783972',
//   muteUntil: null,
//   isGroup: true,
//   isSubscribed: true,
//   isArchived: false,
//   folder: 'INBOX',
//   cannotReplyReason: null,
//   eventReminders: [],
//   emoji: '✌️',
//   color: '0099FF',
//   nicknames: {
//     '100000355456133': 'Hào Lan',
//     '100004040114245': 'Nghe được tất',
//     '100004077031736': 'Khá Lấm',
//     '100005454968899': 'Ham lol là phải ăn chửi🤷‍♀️ Đáng 😏',
//     '100006985843750': 'Phù thủy tình yêu',
//     '100007566840768': 'Cảnh sát chính tả',
//     '100009616050883': 'Realll Fuck'
//   },
//   adminIDs: [ { id: '100004040114245' }, { id: '100004077031736' } ],
//   topEmojis: undefined,
//   reactionsMuteMode: 'reactions_not_muted',
//   mentionsMuteMode: 'mentions_not_muted',
//   isPinProtected: false,
//   relatedPageThread: null,
//   name: 'Trại Phục Hồi Nhân Phẩm',
//   snippet: 'Cảnh sát chính tả sent a photo.',
//   snippetSender: '100007566840768',
//   snippetAttachments: [],
//   serverTimestamp: '1602610783972',
//   imageSrc: 'https://scontent.fsgn5-2.fna.fbcdn.net/v/t1.15752-9/119205336_761865831212301_1226154851295524523_n.jpg?_nc_cat=105&_nc_sid=58c789&_nc_ohc=kKr_v16vWGMAX9JridS&_nc_ht=scontent.fsgn5-2.fna&oh=68c0c80b82f325596fd5d796b6903763&oe=5FAA2ECB',
//   isCanonicalUser: false,
//   isCanonical: false,
//   recipientsLoadable: true,
//   hasEmailParticipant: false,
//   readOnly: false,
//   canReply: true,
//   lastMessageTimestamp: undefined,
//   lastMessageType: 'message',
//   lastReadTimestamp: '1602610757748',
//   threadType: 2
// }
// nmessage
// {
//   type: 'message',
//   senderID: '100007566840768',
//   body: '',
//   threadID: '2046249405401556',
//   messageID: 'mid.$gAAdFDZDuSdR7VFEu5F1IwvgsI8z_',
//   attachments: [
//     {
//       type: 'photo',
//       ID: '380148433142135',
//       filename: 'image-380148433142135',
//       thumbnailUrl: 'https://scontent.xx.fbcdn.net/v/t1.15752-0/cp0/p50x50/121519765_380148436475468_5333647234055167528_n.jpg?_nc_cat=104&_nc_sid=ae9488&_nc_ohc=RRYFjQMMHVYAX9awSF6&_nc_ad=z-m&_nc_cid=0&_nc_ht=scontent.xx&_nc_tp=27&oh=5d1813855f94fd06fa108701e6051116&oe=5FACF148',
//       previewUrl: 'https://scontent.xx.fbcdn.net/v/t1.15752-0/p280x280/121519765_380148436475468_5333647234055167528_n.jpg?_nc_cat=104&_nc_sid=ae9488&_nc_ohc=RRYFjQMMHVYAX9awSF6&_nc_ad=z-m&_nc_cid=0&_nc_ht=scontent.xx&tp=6&oh=27b05d446467f8ea51e987973b645c2d&oe=5FAB6D25',
//       previewWidth: 280,
//       previewHeight: 280,
//       largePreviewUrl: 'https://scontent.xx.fbcdn.net/v/t1.15752-0/p480x480/121519765_380148436475468_5333647234055167528_n.jpg?_nc_cat=104&_nc_sid=ae9488&_nc_ohc=RRYFjQMMHVYAX9awSF6&_nc_ad=z-m&_nc_cid=0&_nc_ht=scontent.xx&tp=6&oh=f415a3aff76977183c2dd0e099996672&oe=5FABB224',
//       largePreviewWidth: 480,
//       largePreviewHeight: 480,
//       url: 'https://scontent.xx.fbcdn.net/v/t1.15752-0/p480x480/121519765_380148436475468_5333647234055167528_n.jpg?_nc_cat=104&_nc_sid=ae9488&_nc_ohc=RRYFjQMMHVYAX9awSF6&_nc_ad=z-m&_nc_cid=0&_nc_ht=scontent.xx&tp=6&oh=f415a3aff76977183c2dd0e099996672&oe=5FABB224',
//       width: 720,
//       height: 720,
//       name: 'image-380148433142135'
//     }
//   ],
//   mentions: {},
//   timestamp: '1602610783972',
//   isGroup: true
// }
// uinfo[msg.senderID]
// {
//   name: 'Trần Quang',
//   firstName: 'Quang',
//   vanity: 'hiimkol',
//   thumbSrc: 'https://scontent.fsgn5-5.fna.fbcdn.net/v/t1.0-1/cp0/p32x32/10256068_1563898240539056_5303294710692788842_n.jpg?_nc_cat=100&_nc_sid=0081f9&_nc_ohc=nHMq8hJDUDwAX8fn8mQ&_nc_oc=AQmK_woykPPGZOD9i6mGZkvwKubkwgf0fiFKt76h0lvoVJhE6Azbp7ZGETAnRdMRF0I&_nc_ht=scontent.fsgn5-5.fna&_nc_tp=27&oh=52b31530cbd2e438295f49b1bb34e047&oe=5FA9D80C',
//   profileUrl: 'https://www.facebook.com/hiimkol',
//   gender: 2,
//   type: 'user',
//   isFriend: false,
//   isBirthday: false
// }