const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const express = require('express')
const pino = require('pino')
const fs = require('fs')
const QRCode = require('qrcode')

const app = express()
const PORT = process.env.PORT || 10000

app.get('/', (req,res)=>{
  res.send(`
  <html><body style="text-align:center;font-family:sans-serif;margin-top:40px">
  <h1>11X-BOT GENERADOR</h1>
  <form action="/code">
  <input name="number" placeholder="519XXXXXXXX" style="padding:12px;width:220px;font-size:18px" required>
  <br><br>
  <button style="padding:12px 25px;background:black;color:white;font-size:16px">GENERAR CODE - 2 MIN</button>
  </form>
  <br><br><hr><br>
  <a href="/qr" style="padding:12px 25px;background:green;color:white;text-decoration:none">GENERAR CON QR</a>
  </body></html>`)
})

app.get('/code', async (req,res)=>{
  let num = req.query.number?.replace(/[^0-9]/g,'')
  if(!num) return res.send('Falta numero')
  if(fs.existsSync('./auth')) fs.rmSync('./auth',{recursive:true,force:true})

  const { state, saveCreds } = await useMultiFileAuthState('./auth')
  const sock = makeWASocket({ 
    auth: state, 
    logger: pino({level:'silent'}), 
    browser:['11X-BOT','Chrome','1.0'] 
  })
  sock.ev.on('creds.update', saveCreds)
  
  await new Promise(r=>setTimeout(r,3000))
  
  try{
    let code = await sock.requestPairingCode(num)
    
    res.send(`
    <div style="text-align:center;font-family:sans-serif;margin-top:50px">
      <h2>TU CODE:</h2>
      <h1 style="font-size:50px;letter-spacing:10px;background:black;color:white;display:inline-block;padding:15px 30px">${code}</h1>
      <br><br>
      <h3 style="color:green">MISMO CODE VALIDO POR 2 MINUTOS</h3>
      <p>WhatsApp > Dispositivos vinculados > Vincular con número</p>
      <p>El vigilante se queda 2 minutos en la puerta</p>
    </div>`)

    // CLAVE DE LOS 2 MINUTOS - MISMO CODE
    setTimeout(()=>{
      try{ sock.end() }catch{}
      try{ fs.rmSync('./auth',{recursive:true,force:true}) }catch{}
    }, 120000)

  }catch(e){
    res.send('Error: '+e.message)
  }
})

app.get('/qr', async (req,res)=>{
  if(fs.existsSync('./auth')) fs.rmSync('./auth',{recursive:true,force:true})
  const { state, saveCreds } = await useMultiFileAuthState('./auth')
  const sock = makeWASocket({ auth: state, logger: pino({level:'silent'}), browser:['11X-BOT','Chrome','1.0'] })
  sock.ev.on('creds.update', saveCreds)
  sock.ev.on('connection.update', async (u)=>{
    if(u.qr){
      let qr = await QRCode.toDataURL(u.qr)
      if(!res.headersSent) res.send(`<div style="text-align:center"><h1>ESCANEA - 2 MIN</h1><img src="${qr}" width="350"></div>`)
    }
  })
})

app.listen(PORT, ()=> console.log('ON '+PORT))   