const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const express = require('express')
const pino = require('pino')

const app = express()
const PORT = process.env.PORT || 10000

app.get('/', (req,res)=>{
  res.send(`
  <html><body style="font-family:sans-serif;text-align:center;margin-top:50px">
  <h1>11X-BOT CODE GENERATOR</h1>
  <p>Pon tu numero con codigo de pais</p>
  <form action="/code">
  <input name="number" placeholder="51XXXXXXXXX" style="padding:10px;width:200px" />
  <br><br>
  <button style="padding:10px 20px">GENERAR CODE</button>
  </form>
  </body></html>
  `)
})

app.get('/code', async (req,res)=>{
  let num = req.query.number.replace(/[^0-9]/g,'')
  const { state } = await useMultiFileAuthState('./auth')
  const sock = makeWASocket({ 
    auth: state, 
    logger: pino({level:'silent'}), 
    browser:['11X-BOT','Chrome','1.0'] 
  })
  await new Promise(r=>setTimeout(r,3000))
  try{
    let code = await sock.requestPairingCode(num)
    res.send(`<h1 style="text-align:center;margin-top:100px">TU CODE: ${code}<br><br><small>Ve a WhatsApp > Dispositivos vinculados > Vincular con numero</small></h1>`)
  }catch(e){ res.send('Error: '+e.message) }
})

app.listen(PORT, ()=> console.log('WEB EN: '+PORT))         