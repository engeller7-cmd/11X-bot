const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');
const qrcode = require('qrcode-terminal');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const sock = makeWASocket({ 
    auth: state, 
    logger: P({level:'silent'}),
    browser: ['11X-BOT','Chrome','1.0'] 
  });
  
  sock.ev.on('creds.update', saveCreds);
  
  sock.ev.on('connection.update', (u) => {
    if(u.qr) qrcode.generate(u.qr,{small:true});
    if(u.connection==='open') console.log('11X-BOT CONECTADO');
    if(u.connection==='close' && u.lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) startBot();
  });

  sock.ev.on('messages.upsert', async ({messages}) => {
    const m=messages[0]; 
    if(!m.message || m.key.fromMe) return;
    const text=m.message.conversation||m.message.extendedTextMessage?.text||'';
    const from=m.key.remoteJid;
    if(text.toLowerCase()==='.menu') await sock.sendMessage(from,{text:'*11X-BOT 🔥*\n.menu\n.ping\n.ia + pregunta\n.hora'});
    if(text.toLowerCase()==='.ping') await sock.sendMessage(from,{text:'Pong! 11x activo ⚡'});
    if(text.toLowerCase().startsWith('.ia ')) await sock.sendMessage(from,{text:'IA 11X: '+text.slice(4)});
    if(text.toLowerCase()==='.hora') await sock.sendMessage(from,{text:'Hora Lima: '+new Date().toLocaleString('es-PE')});
  });
}
startBot();
console.log('Iniciando 11X-bot...');