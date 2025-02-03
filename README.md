# Hyper-Y Alpha

Hyper-Y is a chatbot focused on providing information about YMCA programs and services.
this alpha is a proof of concept for a chatbot with multi-agent, where each agent is responsible for handling information about different YMCA programs and services.

## Installation

* install the required packages by running the following command:

```bash
npm install
```

* run development environment by running the following command:

```bash 
npm run dev
```

* run production environment by running the following command:

```bash
npm run build && node server.js --watch
``` 

## Podution Environment

The fastest/easiest way to deploy the app is to PM2 + Serve.

* install PM2 & Serve by running the following command:

```bash
npm install -g pm2 serve
```

* build the app by running the following command:

```bash
npm run build
```

* start the app by running the following command:

```bash
pm2 serve dist 3000 --name <E.G. experimental-demo>
```

* to stop the app run the following command:

```bash
pm2 stop <E.G. experimental-demo>
```

* you can also see the logs by running the following command:

```bash
pm2 logs <E.G. experimental-demo>
```

## For Developers

check the main chat logic in `src\pages\Chat.jsx`.