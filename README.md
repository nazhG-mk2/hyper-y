# Hyper-Y Alpha

Hyper-Y is a chatbot focused on providing information about YMCA programs and services.

## Installation

* install the required packages by running the following command:

```bash
pnpm install
```

* run development environment by running the following command:

```bash 
pnpm run dev
```
## For Developers

check the main chat logic in `src\pages\Chat.jsx`.

---

## 🔧 Backend Endpoints

* `POST /request`: Accepts a chat history and returns a streaming token.
* `POST /chat`: Takes the token and streams the LLM's response.

```bash
POST /request
Body: {
  messages: [{ role: 'user' | 'system' | 'assistant', content: string }],
  think: false
}
Returns: { token: string }

POST /chat
Body: { token: string }
Streams: JSON chunks like { token: "Hello" }
```

---

## 🧱 Tech Stack

* React + Vite
* Streaming via `fetch` with `ReadableStream`
* Context-based chat state

---

## 📦 Environment Variables

Set your backend endpoint in `.env`:

```env
VITE_BACKEND_URL=https://your-instance-domain.com/demo-backend
```

---

## 💬 Key Concepts

* The chat history is built from a context (`currentChat.chat`) and includes:

  * A system prompt with language enforcement
  * Previous Q\&A messages
  * Current user message

* The flow consists of:

  1. Sending full chat history to `/request`
  2. Receiving a token
  3. Using `/chat` to stream a response back, token by token

---

## 📥 Sample Chat Request Flow

When using Hypercycle node-based chat systems, the `/request` endpoint is required to obtain a token. This token is used to measure costs and is necessary to read the streaming chat result afterwards.

```ts
const requestResponse = await axios.post(`${BACKEND_URL}/request`, {
  messages: [...], // chat history
  think: false,
});
const token = requestResponse.data.token;

const response = await fetch(`${BACKEND_URL}/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token }),
});
```

Streaming is handled via `ReadableStream`:

```ts
const reader = response.body.getReader();
const decoder = new TextDecoder();

let fullAnswer = "";
while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value, { stream: true });
  const lines = chunk.split('\n').filter(line => line.startsWith('data:'));
  
  for (const line of lines) {
    const jsonString = line.replace('data: ', '').trim();
    const parsed = JSON.parse(jsonString);
    fullAnswer += parsed.token;
  }
}
```

---

## 🧠 System Prompt & Language Control

The first message in `messages[]` enforces the system's behavior:

```ts
{
  role: 'system',
  content: `You must answer strictly in EN language. ${systemPrompt}`
}
```

Change `EN` to any language code (`ES`, `FR`, etc.) or adjust via `localStorage.setItem('locale', 'es')`.

---

## 📌 Token Handling (work in progress 🚧)

A JWT token is read from the URL or cookies for auth. If no token is present, user is redirected to `/login`.

```ts
const token = new URLSearchParams(location.search).get('token');
if (token) {
  Cookies.set('token', token, { expires: 1 / 24 }); // 1 hour
} else {
  const cookieToken = Cookies.get('token');
  if (!cookieToken) navigate('/login');
}
```

---

## ✅ Components Involved

* `<Question />`: Renders user questions
* `<Response />`: Renders streaming assistant response
* `<Error />`: Displays any request/streaming errors

