const express = require('express');
const http = require('http');
const logger = require('morgan');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.disable('x-powered-by');

app.set('port', port);

server.listen(port, '192.168.100.83' || 'localhost', () => {
  console.log(`Server NodeJS with process id: ${process.pid} running...`);
});

app.get('/', (req, res) => {
  res.send('Root endpoint from backend');
});

app.get('/test', (req, res) => {
  res.send('Test endpoint from backend');
});

// Error Handler
app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 500).send(err.stack);
});
