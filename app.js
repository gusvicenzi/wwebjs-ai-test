// const { Client } = require('whatsapp-web.js');
// const qrcode = require('qrcode-terminal');
import wswebjs from 'whatsapp-web.js'
const { Client, LocalAuth } = wswebjs
import qrcode from 'qrcode-terminal'
import axios from 'axios';
import { processMessage } from './src/utils/processMessage.js';

const client = new Client({
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
  authStrategy: new LocalAuth()
});


client.on('qr', (qr) => {
  // Generate and scan this code with your phone
  // console.log('QR RECEIVED', qr);
  qrcode.generate(qr, { small: true })
});

client.on('ready', () => {
  console.log('Client is ready!');
});

client.on('message_create', async (msg) => {
  // if (msg.body == '!ping') {
  //   msg.reply('pong');
  // }
  // console.log('mensagem recebida: ', msg.body);

  const contact = await msg.getContact()
  // console.log('contato: ', contact.number);
  if ((contact.number === '554797383886' || contact.number === '554792696208') && msg.body.toLocaleLowerCase().indexOf('bot') === 0) {
    console.log('mensagem recebida: ', msg.body);
    // console.log('contato: ', contact);
    const chat = await msg.getChat()
    // console.log('chat', chat);

    const treatedMessage = msg.body.replace('bot', '')

    // client.sendMessage(chat.id._serialized, 'Pensando...')


    const pResponse = processMessage(treatedMessage, contact.number)

    const interval = setInterval(() => {
      chat.sendStateTyping()
    }, 25);

    const response = await pResponse
    clearInterval(interval)

    msg.reply(response)
  }
});


client.initialize();