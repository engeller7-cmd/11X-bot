const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const express = require('express')
const pino = require('pino')
const fs = require('fs')
const QRCode = require('qrcode')

const app = express()
const PORT = process.env.PORT || 10000

app.get('/', (req,res)=>{
  res.send(`
  <html><body style="font-family:sans-serif;text-align:center;margin-top:30px">
  <h1>11X-BOT GENERADOR</h1>
  <p>Generar con CODE</p>
  <form action="/code">
  <input name="number" placeholder="519XXXXXXXX" style="padding:10px;width:200px" />
  <br><br>
  <button style="padding:10px 20px">GENERAR CODE</button>
  </form>
  <br><hr><br>
  <a href="/qr" style="padding:15px 25px;background:black;color:white;text-decoration:none">GENERAR CON QR</a>
  </body></html>
  `)
})

app.get('/code', async (req,res)=>{
  let num = req.query.number?.replace(/[^0-9]/g,'')
  if(!num) return res.send('Pon tu numero')
  if(fs.existsSync('./auth')) fs.rmSync('./auth',{recursive:true,force:true})
  const { state } = await useMultiFileAuthState('./auth')
  const sock = makeWASocket({ auth: state, logger: pino({level:'silent'}), browser:['11X-BOT','Chrome','1.0'] })
  await new Promise(r=>setTimeout(r,3000))
  try{
    let code = await sock.requestPairingCode(num)
    res.send(`<h1 style="text-align:center;margin-top:50px">TU CODE: ${code}<br><br><small>Ponlo en WhatsApp en menos de 15 seg!</small><br><br><a href="/">Volver</a></h1>`)
  }catch(e){ res.send('Error: '+e.message+'<br><a href="/">Volver</a>') }
})

app.get('/qr', async (req,res)=>{
  if(fs.existsSync('./auth')) fs.rmSync('./auth',{recursive:true,force:true})
  const { state } = await useMultiFileAuthState('./auth')
  const sock = makeWASocket({ auth: state, logger: pino({level:'silent'}), browser:['11X-BOT','Chrome','1.0'] })
  sock.ev.on('connection.update', async (u)=>{
    if(u.qr){
      let qrimg = await QRCode.toDataURL(u.qr)
      res.send(`<div style="text-align:center;margin-top:20px"><h1>ESCANEA ESTE QR</h1><img src="${qrimg}" style="width:300px"><br><p>WhatsApp > Dispositivos vinculados > Vincular dispositivo</p><p>El QR dura 30 segundos, recarga si expira</p></div>`)
    }
  })
})

app.listen(PORT, ()=> console.log('WEB EN: '+PORT))      