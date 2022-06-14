const { default: makeWALegacySocket, useSingleFileAuthState, DisconnectReason } = require('@adiwajshing/baileys');
const { state, saveState } = useSingleFileAuthState(`session.json`)
const {Boom} = require("@hapi/boom") ;
const pino = require('pino');

function startBot() {
	const stock = makeWALegacySocket({
		logger: pino({ level: 'silent' }),
	printQRInTerminal: true,
	browser: ['stock Multi Device','Safari','1.0.0'],
        auth: state
	});
	stock.ev.on('connection.update', (update) => {
		console.log(update) ;
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect =(lastDisconnect.error = Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
            // reconnect if not logged out
            if(shouldReconnect) {
                startBot();
            }
        } else if(connection === 'open') {
            console.log('opened connection')
        }
    });
    
    stock.ev.on("creds.update", saveState);
    
   stock.ev.on('messages.upsert', async chatUpdate => {
        //console.log(JSON.stringify(chatUpdate, undefined, 2))
        try {
        mek = chatUpdate.messages[0]
        if (!mek.message) return
        mek.message = (Object.keys(mek.message)[0] === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
        if (mek.key && mek.key.remoteJid === 'status@broadcast') return
        if (!stock.public && !mek.key.fromMe && chatUpdate.type === 'notify') return
        if (mek.key.id.startsWith('BAE5') && mek.key.id.length === 16) return
        m = smsg(stock, mek, store)
        require("./handler")(stock, m, chatUpdate, store)
        } catch (err) {
            console.log(err)
        }
    });
    }

startBot();