const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, delay } = require('@whiskeysockets/baileys')
const P = require('pino')

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info')
    const sock = makeWASocket({
        auth: state,
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: ['11X-BOT', 'Chrome', '1.0'],
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 10000
    })

    sock.ev.on('creds.update', saveCreds)

    if (!sock.authState.creds.registered) {
        const phone = '51938287313'.replace(/[^0-9]/g, '')
        console.log(`[11X] Esperando 8 segundos para pedir CODE a ${phone}...`)
        await delay(8000)
        try {
            let code = await sock.requestPairingCode(phone)
            code = code?.match(/.{1,4}/g)?.join('-') || code
            console.log('====================================')
            console.log(`CODE UNICO 60 SEG: ${code}`)
            console.log(`PONLO YA EN WHATSAPP, SOLO HAY ESTE`)
            console.log('====================================')
        } catch (e) {
            console.log(`[ERROR CODE] ${e.message} - Reintentando en 15 seg...`)
            await delay(15000)
            start()
            return
        }
    }

    sock.ev.on('connection.update', async (u) => {
        const { connection, lastDisconnect } = u
        if (connection === 'open') {
            console.log('✅ BOT 11X CONECTADO!')
        }
        if (connection === 'close') {
            const code = lastDisconnect?.error?.output?.statusCode
            console.log(`Conexion cerrada: ${code}`)
            if (code !== DisconnectReason.loggedOut) {
                console.log('Reconectando en 10 seg...')
                await delay(10000)
                start()
            }
        }
    })
}
start()

// Para que Render no diga "exited early"
process.on('uncaughtException', (e) => console.log('Error no fatal:', e.message))
setInterval(() => {}, 1000 * 60 * 60)