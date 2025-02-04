import axios from "axios"
import fs from 'fs'

// const conversationHistory = []
const historyFilePath = 'src/utils/conversationHistory.json'
const messageNumberHistory = 10

export const processMessage = async (message, userNumber, chatId) => {
  const userNumberChatId = `${userNumber}${chatId}`

  let conversationHistory = []
  try {
    const arq = JSON.parse(fs.readFileSync(historyFilePath, { encoding: 'utf-8' }))
    conversationHistory = arq
  } catch (e) {
  }

  const savedChatHistory = conversationHistory.find(chat => chat.id === userNumberChatId)

  if (!savedChatHistory)
    conversationHistory.push({ id: userNumberChatId, history: [] })

  const editedChatHistory = conversationHistory.find(chat => chat.id === userNumberChatId)

  editedChatHistory.history.push({ "role": "user", "content": message })

  if (editedChatHistory.history.length > messageNumberHistory * 2)
    editedChatHistory.history.shift()

  // console.log(editedChatHistory.history)

  const body = {
    "model": "deepseek-r1-distill-llama-8b",
    "messages": [
      // { "role": "system", "content": "" },
      ...editedChatHistory.history],
    "temperature": 0.7,
    "max_tokens": -1,
    // "stream": true
    "stream": false
  }
  try {
    const { data: modelRespose } = await axios.post('http://127.0.0.1:1234/v1/chat/completions', body)

    const completeMessage = modelRespose.choices[0].message.content

    // console.log('completeMessage', completeMessage);

    const jsonStringResponse = completeMessage.replace(/<think>[\s\S]*?<\/think>/g, '').trim()
    // console.log('jsonStringResponse', jsonStringResponse);
    let res = ''
    try {
      res = JSON.parse(jsonStringResponse)
    } catch (e) {
      console.log(e)
      res = jsonStringResponse
    }

    const actualResponse = res?.message || res
    const reaction = res?.reaction || null

    // console.log('Reposta final: ', actualResponse)

    const assistantResponse = { "role": "assistant", "content": actualResponse }

    editedChatHistory.history.push(assistantResponse)
    // console.log(`new conversation history for ${userNumberChatId}`, editedChatHistory.history)

    const newConversationHistory = conversationHistory.filter(chat => chat.id !== userNumberChatId)
    newConversationHistory.unshift(editedChatHistory)

    fs.writeFileSync(historyFilePath, JSON.stringify(newConversationHistory));


    return { message: actualResponse, reaction }

  } catch (error) {
    console.log(error?.response);

    return { message: `Ocorreu um erro ao obter a resposta do modelo. ${error?.response?.data?.error || error}`, reaction: "😞" }
  }

  // const { data: stream } = await axios.post('http://127.0.0.1:1234/v1/chat/completions', body, { responseType: 'stream' })

  // const response = await fetch('http://127.0.0.1:1234/v1/chat/completions', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Accept': 'text/event-stream',
  //   },
  //   body: JSON.stringify(body)
  // });

  // if (!response.ok) {
  //   const errorBody = await response.json();
  //   throw new Error(`http error: ${response.status} ${response.statusText}. Details: ${JSON.stringify(errorBody)}`);
  // }

  // const reader = response.body.getReader();
  // const decoder = new TextDecoder();

  // while (true) {
  //   const { done, value } = await reader.read();
  //   if (done) break;

  //   const chunk = decoder.decode(value, { stream: true });
  //   const lines = chunk.split('\n').filter(Boolean);

  //   for (const line of lines) {
  //     try {
  //       console.log(line?.data);

  //       const update = JSON.parse(line);
  //       console.dir(update);
  //     } catch (error) {
  //       console.error('Error parsing update:', error);
  //     }
  //   }
  // }

  // console.log('data', data);

  // let sentence = ''
  // for await (const chunk of stream) {
  //   // console.log('type', typeof chunk)
  //   // console.log('key', Object.keys(chunk))
  //   // console.log('str', chunk.toString())
  //   const partMsg = chunk.toString().split(`"content":"`)[1]?.split('"')[0]

  //   console.log('part', partMsg);
  //   if (partMsg?.includes('.')) {
  //     const arr = partMsg.split('.')
  //     sentence.concat(arr[0])
  //     if (msg) {
  //       msg.reply(sentence)
  //       console.log('mensagem enviada ', sentence);
  //     }
  //     // sentence = ''
  //     sentence = arr[1]
  //     continue
  //   } else if (partMsg === undefined) {
  //     msg.reply(sentence)
  //     break
  //   }
  //   sentence.concat(partMsg)

  // }
}

const d = {
  "type": "object",
  "required": ["message", "reaction"],
  "properties": {
    "message": {
      "type": "string",
      "description": "Mensagem de resposta em formato de texto."
    },
    "reaction": {
      "type": "string",
      "description": "Reação associada à mensagem, representada por um único emoji."
    }
  },
  "additionalProperties": false
}