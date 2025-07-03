const app = require('./src/app');
const http = require('http');

const server = http.createServer(app);
const { setupWebSocket } = require('./src/websocket');
setupWebSocket(server);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
}); 