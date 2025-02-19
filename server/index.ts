/* eslint-disable no-console */
import { createServer } from 'http';
import express, { Request, Response } from 'express';
import next, { NextApiHandler } from 'next';
import { Server } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents } from './types/socket';

const port = parseInt(process.env.PORT || '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandler: NextApiHandler = nextApp.getRequestHandler();

nextApp.prepare().then(async () => {
  const app = express();
  const server = createServer(app);

  const io = new Server<ClientToServerEvents, ServerToClientEvents>(server);

  app.get('/hello', async (_, res) => {
    res.send('Hello World');
  });

  io.on('connection', (socket) => {
    console.log('connection');

    socket.on('draw', (moves, options) => {
      console.log('drawing');
      socket.broadcast.emit('socket_draw', moves, options);
    });

    socket.on('disconnect', () => {
      console.log('client disconnected');
    });
  });

  // Fix for line 38: Wrap nextHandler in a promise
  app.all('*', async (req: Request, res: Response) => {
    try {
      await nextHandler(req as any, res as any);
    } catch (error) {
      console.error('Error handling request:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});