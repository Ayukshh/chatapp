const WebSocket = require('ws');
const Message = require('./models/message');

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', async (ws) => {
    // Send last 20 messages to the new client
    try {
      const recentMessages = await Message.find().sort({ timestamp: -1 }).limit(20).sort({ timestamp: 1 });
      ws.send(JSON.stringify({ type: 'history', messages: recentMessages }));
    } catch (err) {
      ws.send(JSON.stringify({ type: 'error', error: 'Failed to load chat history' }));
    }

    ws.on('message', async (data) => {
      let msgObj;
      try {
        msgObj = JSON.parse(data);
      } catch {
        // fallback: treat as plain string
        msgObj = { username: 'Anonymous', text: data };
      }
      const { username, text } = msgObj;
      if (!username || !text) return;
      try {
        const message = new Message({ username, text });
        await message.save();
        const outMsg = JSON.stringify({ type: 'message', message });
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(outMsg);
          }
        });
      } catch (err) {
        ws.send(JSON.stringify({ type: 'error', error: 'Failed to save message' }));
      }
    });
  });
}

module.exports = { setupWebSocket }; 