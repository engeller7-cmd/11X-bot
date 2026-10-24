const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys")
const pino = require("pino")

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info")
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        browser: ["11X BOT", "Chrome", "1.0"]
    })

    sock.ev.on("creds.update", saveCreds)

    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode("51938287313")
                console.log("\n====================================")
                console.log(`CODE 45 SEG: ${code}`)
                console.log("Ponlo YA en WhatsApp -> Vincular con numero")
                console.log("Se regenera solo cada 45 seg")
                console.log("====================================\n")
            } catch (e) {
                console.log("Error pidiendo CODE, posible bloqueo, espera 2h:", e.message)
            }
        }, 3000)

        // Se regenera solo cada 45 seg
        setInterval(async () => {
            if (!sock.authState.creds.registered) {
                try {
                    const code = await sock.requestPairingCode("51938287313")
                   