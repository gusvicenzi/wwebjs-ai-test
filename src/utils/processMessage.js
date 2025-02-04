import axios from "axios"

const conversationHistory = []
export const processMessage = async (message, userNumber, msg) => {
  if (!conversationHistory[userNumber])
    conversationHistory[userNumber] = []

  conversationHistory[userNumber].push({ "role": "user", "content": message })

  if (conversationHistory[userNumber].length > 10)
    conversationHistory[userNumber].shift()

  const body = {
    "model": "deepseek-r1-distill-llama-8b",
    "messages": [
      { "role": "system", "content": "Responda de forma amigável e mantendo contexto da conversa, a menos que explicitamente solicitado para ignorar o contexto." },
      ...conversationHistory[userNumber]],
    "temperature": 0.7,
    "max_tokens": -1,
    // "stream": true
    "stream": false
  }

  const { data: modelRespose } = await axios.post('http://127.0.0.1:1234/v1/chat/completions', body)

  const completeMessage = modelRespose.choices[0].message.content
  console.log('Reposta do modelo: ', completeMessage)

  const actualResponse = completeMessage.replace(/<think>[\s\S]*?<\/think>/g, '').trim()

  console.log('Reposta final: ', actualResponse)

  return actualResponse

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