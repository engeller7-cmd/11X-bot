const http = require('http');
http.createServer((req,res)=>{
  res.writeHead(200);
  res.end('11X-BOT ACTIVO');
}).listen(process.env.PORT || 3000,()=>console.log('Web activa'));

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');

let codeSolicitado = false;

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const sock = makeWASocket({
    auth: state,
    logger: P({level:'silent'}),
    printQRInTerminal: false,
    browser: ['11X-BOT', 'Chrome', '1.0']
  });

  // SOLO PIDE 1 VEZ EL CODE
  if (!sock.authState.creds.registered && !codeSolicitado) {
    codeSolicitado = true;
    const num = (process.env.PHONE_NUMBER || "51938287313").replace(/[^0-9]/g,'');
    console.log(`Esperando 5 seg para pedir CODE a ${num}...`);
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(num);
        console.log(`

  TU UNICO CODE ES: ${code}
  Tienes 60 segundos para vincularlo
  WhatsApp > Dispositivos vinculados


`);
      } catch (e) {
        console.log("Error pidiendo code, reintenta Manual Deploy:", e.message);
        codeSolicitado = false;
      }
    }, 5000);
  }

  sock.ev.on('creds.update', saveCreds);
  
  sock.ev.on('connection.update', async (u) => {
    const { connection, lastDisconnect } = u;
    if (connection === 'open') {
      console.log('✅ 11X-BOT CONECTADO YA NO NECESITAS CODE');
    }
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) {
        console.log('Desconectado, reconectando en 5 seg...');
        setTimeout(startBot, 5000);
      }
    }
  });
}
startBot();