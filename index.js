// Dependencies
require('dotenv').config()
const argv = require('minimist')(process.argv.slice(2));
const login = require("facebook-chat-api");
const fs = require("fs");
const path = require("path")
const readline = require("readline");
const notifier = require("node-notifier");
const chalk = require('chalk');
const prompt = require('prompt');
const logger = require("./utils/logger");
const SortUtil = require("./utils/SortUtil");
const InfoUtils = require("./utils/InfoUtil");
const Discord = require("discord.js");
const DiscordUtil = require("./utils/DiscordUtil");

let discordHook;

// Global access variables
let gapi, active, rl;
rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

try {
    // Look for stored appstate first
    login({ "appState": JSON.parse(fs.readFileSync("appstate.json", "utf8")) }, (err, api) => {
        if (err) return console.error(err);
        fs.writeFileSync("appstate.json", JSON.stringify(api.getAppState()));
        main(api);
    });
} catch (e) {
    // If none found (or expired), log in with email/password
    try {
        logInWithCredentials();
    } catch (e) {
        let email, pass;
        let promptSchema = {
            "properties": {
                "email": {
                    "description": "What's your Facebook email?",
                    "message": 'Email is required',
                    "required": true
                },
                "password": {
                    "description": "What's your Facebook password?",
                    "message": 'Password is required',
                    "required": true,
                    "hidden": true,
                    "replace": '*'
                }
            }
        };
        // Change the default setting to make it look the same as old prompt
        prompt.message = "";
        prompt.delimiter = "";
        // Start the prompt
        prompt.start();
        // Get the user input with validation and masking for password
        prompt.get(promptSchema, (err, result) => {
            if (!err) {
                email = result.email;
                pass = result.password;

                // Store credentials for next time
                fs.writeFileSync("./credentials/credentials-messenger.js", `exports.email = "${email}";\nexports.password = "${pass}";`);

                // Pass to the login method (which should store an appstate as well)
                const credentials = require("./credentials/credentials-messenger");
                logInWithCredentials(credentials);
            }
            else {
                logError(err);
            }

            // If none found, ask for them
            /** This should not be moved above the prompt for email and password as it causes double input read for a character **/
            initPrompt();
        });
    }
}

/*
    Takes a credentials object with `email` and `password` fields and logs into the Messenger API.
gc
    If successful, it stores an appstate to cache the login and passes off the API object to the callback.
    Otherwise, it will return an error specifying what went wrong and log it to the console.
*/
function logInWithCredentials(callback = main) {
    login(

        { "email": process.env.FB_EMAIL, "password": process.env.FB_PASSWORD },
        {
            userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Safari/537.36"
        }
        ,
        (err, api) => {
            if (err) {
                switch (err.error) {
                    case 'login-approval':
                        console.log('Enter code > ');
                        rl.on('line', (line) => {
                            err.continue(line);
                            rl.close();
                        });
                        break;
                    default:
                        console.error(err);
                }
                return;
            }
            fs.writeFileSync("appstate.json", JSON.stringify(api.getAppState()));
            callback(api);
        });
}

/*
    Initializes a readline interface and sets up the prompt for future input.

    Returns the readline interface.
*/
function initPrompt() {
    if (!rl) {
        let rlInterface = readline.createInterface({
            "input": process.stdin,
            "output": process.stdout
        });
        rlInterface.setPrompt("> ");
        rl = rlInterface;
    }
}

function initHook() {
    discordHook = new Discord.WebhookClient(process.env.DISCORD_HOOK_ID, process.env.DISCORD_HOOK_TOKEN);
    // Send a message using the webhook
    discordHook.send('I am now alive!');
}

function replyMessageWithQuote(threadInfo, usersInfo, msg, replyUserInfo) {
    const replyMsg = InfoUtils.getReplyMessage(msg.messageReply, replyUserInfo[msg.messageReply.senderID]);
    replyMessage(threadInfo, usersInfo, msg, replyMsg);
    
}

function replyMessage(threadInfo, usersInfo, msg, replyMsg) {
    const groupInfo = InfoUtils.getGroupInfo(threadInfo, usersInfo[msg.senderID]);
    // If there are attachments, grab their URLs to render them as text instead
    const attachmentsAsText = InfoUtils.getAttachmentsAsText(msg);
    // Log the incoming message and reset the prompt
    const name = getTitle(threadInfo, usersInfo);
    
    if (argv["discord"]) {
        const messageContent = InfoUtils.getMessageContent(msg, replyMsg);
        DiscordUtil.hookSend(discordHook, groupInfo, messageContent);
    }
    if (argv["notifier"]) {
        // Show up the notification for the new incoming message
        notifier.notify({
            "title": 'Messenger CLI',
            "message": `New message from ${name}`,
            "icon": path.resolve(__dirname, 'assets', 'images', 'messenger-icon.png')
        });
    }
    let displayMsg = "";
    if (replyMsg) {
        displayMsg += `(${name}) ${usersInfo[msg.senderID].name}: Reply to ${replyMsg.name}[${replyMsg.message}]\n`;
        newPrompt(`(${chalk.green(name)}) ${chalk.blue(usersInfo[msg.senderID].name)} replied to ${chalk.blue(replyMsg.name)} [${chalk.yellow(replyMsg.message) || "No Content"}]`, rl);
    }
    displayMsg += `(${name}) ${usersInfo[msg.senderID].name}: ${attachmentsAsText}`;
    newPrompt(`(${chalk.green(name)}) ${chalk.blue(usersInfo[msg.senderID].name)}: ${attachmentsAsText}`, rl);
    logger.info(displayMsg);
}

/*
    Main body of the CLI.
gc
    Listens for new messages and logs them to stdout. Messages can be sent from
    stdin using the format described in README.md.
*/
function main(api) {
    if (argv["discord"]) {
        initHook();
    }
    // Use minimal logging from the API
    api.setOptions({ "logLevel": "warn", "listenEvents": true });
    // Initialize the global API object
    gapi = api;

    // Set up the prompt for sending new messages
    initPrompt();
    rl.prompt();

    // Listen to the stream of incoming messages and log them as they arrive
    api.listenMqtt((err, msg) => {
        if (err) { return console.error(`Encountered error receiving messages: ${err}`); }
        if (msg.type == "message") { // Message received
            api.getThreadInfo(msg.threadID, (err, threadInfo) => {
                api.getUserInfo(msg.senderID, (err, usersInfo) => {
                    replyMessage(threadInfo, usersInfo, msg);
                });
            });
        } else if (msg.type === "event") { // Chat event received
            api.getThreadInfo(msg.threadID, (err, tinfo) => {
                api.getUserInfo(tinfo.participantIDs, (err, tinfo) => {
                    // Log the event information and reset the prompt
                    const displayMsg = `${chalk.yellow(`[${getTitle(tinfo, uinfo)}] ${msg.logMessageBody}`)}`;
                    logger.info(`[${getTitle(tinfo, uinfo)}]${msg.logMessageBody}`);
                    newPrompt(displayMsg, rl);
                });
            });
        } else if (msg.type === "typ") { // Typing event received
            if (msg.isTyping) { // Only act if isTyping is true, not false
                api.getThreadInfo(msg.threadID, (terr, tinfo) => {
                    api.getUserInfo(msg.from, (uerr, uinfo) => {
                        // Log who is typing and reset the prompt
                        const typer = !uerr ? uinfo[msg.from] : { "firstName": "Someone" };
                        const displayMsg = `(${getTitle(tinfo, uinfo)}) ${chalk.dim(`${typer.name} is typing ...`)}`;
                        logger.info(`(${getTitle(tinfo, uinfo)}) ${typer.name} is typing ...`);
                        newPrompt(displayMsg, rl);
                    });
                });
            }
        } else if (msg.type === "message_reply") {
            api.getThreadInfo(msg.threadID, (err, threadInfo) => {
                api.getUserInfo(msg.senderID, (err, usersInfo) => {
                    api.getUserInfo(msg.messageReply.senderID, (err, replyUserInfo) => {
                        replyMessageWithQuote(threadInfo, usersInfo, msg, replyUserInfo);
                    })
                });
            });
        }
    });

    // Watch stdin for new messages (terminated by newlines)
    rl.on("line", (line) => {
        const terminator = line.indexOf(":");
        if (terminator == -1) {
            // No recipient specified: send it to the last one messaged if available; otherwise, cancel
            if (active) {
                sendReplacedMessage(line, active, rl);
            } else {
                logError("No prior recipient found");
                rl.prompt();
            }
        } else {
            // Search for the group specified in the message
            const search = line.substring(0, terminator);
            // Beginning of list function. Use: list:(number) Lists the latest (number) friends and the most recent message sent or recieved in the chat.
            if (search == "list") {
                const amount = line.substring(terminator + 1);
                api.getThreadList(parseInt(amount), null, [], (err, threads) => {
                    if (!err) {
                        for (let i = 0; i < threads.length; i++) {
                            const id = threads[i].threadID;
                            api.getThreadInfo(id, (err, tinfo) => {
                                api.getThreadHistory(id, 1, undefined, (err, history) => {
                                    api.getUserInfo(tinfo.participantIDs, (err, uinfo) => {
                                        console.log(chalk.cyan.bgMagenta.bold(getTitle(tinfo, uinfo)));
                                        for (let i = 0; i < history.length; i++) {
                                            const sender = history[i].senderID;
                                            const body = history[i].body;
                                            console.log(`${chalk.blue(uinfo[sender].name)}: ${body}`);
                                        }
                                    });
                                });
                            });
                        }
                    } else {
                        callback(err);
                    }
                });
            } else if (search == "load") {
                const search = line.substring(terminator + 1);
                getGroup(search, (err, group) => {
                    if (!err) {
                        // Store the information of the last recipient so you don't have to specify it again
                        active = group;
                        // Load older 10 messages
                        api.getThreadHistory(group.threadID, 10, undefined, (err, history) => {
                            if (!err) {
                                for (let i = 0; i < history.length; i++) {
                                    console.log(`${chalk.green(history[i].senderName)}: ${history[i].body}`);
                                }
                                rl.setPrompt(chalk.green(`[${active.name}]`));
                                timestamp = history[0].timestamp;
                            }
                            else {
                                logError(err);
                            }
                        });
                        // Update the prompt to indicate where messages are being sent by default
                    } else {
                        logError(err);
                    }
                });
            } else if (search == "logout") { //Add a logout command.
                api.logout((err) => {
                    if (!err) {
                        console.log("Logged out");
                        process.exit()
                    }
                });
            } else if (search == "friends") {
                api.getFriendsList((err, data) => {
                    if (err) logError(err);
                    SortUtil.sortLocale(data, "fullName");
                    data.map(friend => {
                        console.log(friend.fullName);
                    })
                    console.log("Total friends: " + data.length);
                })
            } else {
                getGroup(search, (err, group) => {
                    if (!err) {
                        // Send message to matched group
                        sendReplacedMessage(line.substring(terminator + 1), group, rl);

                        // Store the information of the last recipient so you don't have to specify it again
                        active = group;

                        // Update the prompt to indicate where messages are being sent by default
                        rl.setPrompt(chalk.green(`[${active.name}]`));
                    } else {
                        logError(err);
                    }
                });
            }
        }
    });

}

/*
    Wrapper function for api.sendMessage that provides colored status prompts
    that indicate whether the message was sent properly.

    Provide a message, a threadId to send it to, and a readline interface to use
    for the status messages.
*/
function sendMessage(msg, threadId, rl, callback = () => { }, api = gapi) {
    api.sendMessage(msg, threadId, (err) => {
        if (!err) {
            newPrompt(chalk.red.bgGreen("(sent)"), rl);
        } else {
            logError("(not sent)");
        }

        // Optional callback
        callback(err);
    });
}

/*
    Logs the specified error (`err`) in red to stdout.
*/
function logError(err) {
    console.log(chalk.bgRed(err));
}

/*
    Takes a search query (`query`) and looks for a thread with a matching name in
    the user's past 20 threads.

    Passes either an Error object or null and a Thread object matching the search
    to the specified callback.
*/
function getGroup(query, callback, api = gapi) {
    const search = new RegExp(query, "i"); // Case insensitive
    api.getThreadList(100, null, [], (err, threads) => {
        if (!err) {
            let found = false;
            for (let i = 0; i < threads.length; i++) {
                const id = threads[i].threadID;
                api.getThreadInfo(id, (err, tinfo) => {
                    api.getUserInfo(err ? [] : tinfo.participantIDs, (err, uinfo) => {
                        // Check if the chat has a title to search based on
                        const name = getTitle(tinfo, uinfo);
                        if (!found && !err && name.search(search) > -1) {
                            found = true;
                            tinfo.threadID = id;
                            tinfo.name = name;
                            callback(null, tinfo);
                        }
                    });
                });
            }
        } else {
            callback(err);
        }
    });
}

/*
    Runs the specified message through a filterer to execute
    any special commands/replacements before sending the message.

    Takes a message to parse, a groupInfo object, and a readline Instance.
*/
function sendReplacedMessage(message, groupInfo, rl) {
    const msg = parseAndReplace(message, groupInfo);

    // parseAndReplace may return an empty message after replacement
    if (msg) {
        sendMessage(msg, groupInfo.threadID, rl);
    }
}

/*
    Replaces special characters/commands in the given message with the info
    needed to send to Messenger.

    Takes a message and a groupInfo object to get the replacement data from.

    Returns the fixed string (which can be sent directly with sendMessage).
*/
function parseAndReplace(msg, groupInfo, api = gapi) {
    let fixed = msg;

    /*
            List of fixes to make.

        Each fix should contain "match" and "replacement" fields to perform the replacement,
        and optionally can contain a "func" field containing a function to be called if a match
        is found. The groupInfo object, api instance, and match data will be passed to the function.
    */
    const fixes = [
        {
            // {emoji} -> group emoji
            "match": /{emoji}/ig,
            "replacement": groupInfo.emoji ? groupInfo.emoji.emoji : "👍"
        },
        {
            // {read} -> ""; send read receipt
            "match": /{read}/i,
            "replacement": "",
            "func": (groupInfo, api) => {
                api.markAsRead(groupInfo.threadID, (err) => {
                    if (!err) { newPrompt(chalk.bgBlue("(read)"), rl); }
                });
            }
        },
        {
            // {bigemoji} -> send large group emoji
            "match": /{bigemoji}/i,
            "replacement": "",
            "func": (groupInfo, api) => {
                api.sendMessage({
                    "emoji": groupInfo.emoji ? groupInfo.emoji.emoji : "👍 ",
                    "emojiSize": "large"
                }, groupInfo.threadID, (err) => {
                    if (!err) { newPrompt(chalk.bgYellow("(emoji)"), rl); }
                });
            }
        },
        {
            // {file|path/to/file} -> send file
            "match": /{file\|([^}]+)}/i,
            "replacement": "",
            "func": (groupInfo, api, match) => {
                const path = match[1];
                api.sendMessage({
                    "attachment": fs.createReadStream(path)
                }, groupInfo.threadID, (err) => {
                    if (!err) {
                        newPrompt(chalk.bgCyan("(image)"), rl);
                    } else {
                        logError(`File not found at path ${path}`);
                    }
                });
            }
        }
    ]

    for (let i = 0; i < fixes.length; i++) {
        // Look for a match; if found, call the function if it exists
        let fix = fixes[i];
        if (msg.search(fix.match) > -1 && fix.func) {
            fix.func(groupInfo, api, msg.match(fix.match));
        }
        // Make the replacements as necessary
        fixed = fixed.replace(fix.match, fix.replacement);
    }

    return fixed.trim();
}

/*
    Clears the line of an existing prompt, logs the passed message, and then replaces the
    prompt for further messages.
*/
function newPrompt(msg, rl) {
    // Clear the line (prompt will be in front otherwise)
    readline.clearLine(process.stdout);
    readline.cursorTo(process.stdout, 0);

    // Log the message
    console.log(msg);

    // Replace the prompt
    rl.prompt(true);
}

/*
    Determines a title for a chat based on threadInfo and userInfo objects.

    Takes in threadInfo and userInfo objects and returns a string title.
*/
function getTitle(tinfo, uinfo, api = gapi) {
    let name = tinfo.threadName;
    if (!name) {
        // If not, figure out who is in the chat other than the main user
        const others = tinfo.participantIDs.filter(id => (id != api.getCurrentUserID()));
        if (others.length > 1) {
            // If it's more than one person, it's an unnamed group
            // Name it "firstname1/firstname2/firstname3", etc.
            const names = others.map(id => uinfo[id].firstName);
            name = names.join("/");
        } else if (others.length == 1) {
            // Otherwise, just the two people – it's a PM
            // Name it the user's full name
            targetUserInfo = uinfo[others[0]];
            if (targetUserInfo) {
                name = targetUserInfo.name;
            } else {
                name = "Empty chat";
            }
        } else {
            // If len is 0, user is only one in a dead group chat
            name = "Empty chat";
        }
    }
    return name;
}
