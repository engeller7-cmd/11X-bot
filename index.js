const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const P = require('pino')

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info')
    const sock = makeWASocket({
        auth: state,
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ['11X-BOT', 'Chrome', '1.0']
    })

    sock.ev.on('creds.update', saveCreds)

    if (!sock.authState.creds.registered) {
        let phone = process.env.PHONE_NUMBER || '51938287313'
        phone = phone.replace(/[^0-9]/g, '')
        await new Promise(r => setTimeout(r, 5000))
        try {
            let code = await sock.requestPairingCode(phone)
            code = code?.match(/.{1,4}/g)?.join('-') || code
            console.log('====================================')
            console.log(`TU UNICO CODE ES: ${code}`)
            console.log(`ESTE ES TU UNICO CODE, NO HABRA OTRO`)
            console.log(`Tienes 60 segundos para ponerlo!`)
            console.log('====================================')
        } catch (e) {
            console.log('Error pidiendo CODE:', e.message)
        }
    }

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'open') {
            console.log('CONECTADO! BOT 11X ONLINE')
        }
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
            if (shouldReconnect) start()
        }
    })
}
start()