const http = require('http');
http.createServer((req,res)=>{res.writeHead(200);res.end('11X-BOT ACTIVO');}).listen(process.env.PORT || 3000,()=>{console.log('Puerto abierto')});
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');
async function startBot(){
const { state, saveCreds } = await useMultiFileAuthState('auth_info');
const sock = makeWASocket({auth:state,logger:P({level:'silent'}),printQRInTerminal:false,browser:['11X-BOT','Chrome','1.0']});
if(!sock.authState.creds.registered){
const phoneNumber = process.env.PHONE_NUMBER || "51938287313";
console.log(`Solicitando CODE para ${phoneNumber}...`);
setTimeout(async()=>{
try{
const code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g,''));
console.log(`\n========== TU CODE DE 8 DIGITOS ES: ${code} ==========\n`);
}catch(e){console.log("Error:",e.message)}
},3000);
}
sock.ev.on('creds.update',saveCreds);
sock.ev.on('connection.update',(u)=>{
if(u.connection==='open')console.log('11X-BOT CONECTADO ✅');
if(u.connection==='close' && u.lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut)startBot();
});
}
startBot();