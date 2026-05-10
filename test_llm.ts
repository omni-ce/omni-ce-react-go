import ollama from "ollama";

const response = await ollama.chat({
  model: "nemotron-3-super:cloud",
  messages: [
    {
      role: "user",
      content: "buatkan websocket golang",
    },
  ],
});

console.log(response.message.content);
