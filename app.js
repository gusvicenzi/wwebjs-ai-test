import wswebjs from 'whatsapp-web.js'
const { Client, LocalAuth } = wswebjs
import qrcode from 'qrcode-terminal'
import { processMessage } from './src/utils/processMessage.js'
import fs from 'fs'
import { processMessagePython } from './src/utils/processMessagePython.js'

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
  const contact = await msg.getContact()
  // console.log('contato: ', contact.number);
  // if ((contact.number === '554797383886' || contact.number === '554792696208' || contact.number === '554799263828' || contact.number === '554796147390') && msg.body.toLocaleLowerCase().indexOf('bot') === 0) {
  const listAllowedContacts = JSON.parse(fs.readFileSync('./src/utils/listAllowedContacts.json', { encoding: 'utf-8' }))

  if (listAllowedContacts.find(cont => cont.number === contact.number) && msg.body.toLocaleLowerCase().indexOf('bot') === 0) {
    console.log('mensagem recebida: ', msg.body);
    // console.log('contato: ', contact);
    const chat = await msg.getChat()
    // console.log('chat', chat);

    const treatedMessage = msg.body.replace(/\b[bB][oO][tT]\b/g, '').trim()

    // client.sendMessage(chat.id._serialized, 'Pensando...')

    // const pResponse = processMessage(treatedMessage, contact.number, chat.id.user, msg)
    const pResponse = processMessagePython(treatedMessage, contact.number, chat.id.user, msg)

    const interval = setInterval(() => {
      chat.sendStateTyping()
    }, 25);

    const { message, reaction } = await pResponse
    clearInterval(interval)

    console.log('reaction:', reaction);

    if (reaction)
      await msg.react(reaction)

    await msg.reply(message)
  }
});


client.initialize();