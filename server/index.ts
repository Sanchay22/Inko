import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';
import { NextApiRequest, NextApiResponse } from 'next';

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

const app = express();
const server = createServer(app);
const io = new Server(server);

const port = process.env.PORT || 3000;

nextApp.prepare().then(() => {
  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('draw', (moves, options) => {
      console.log('drawing');
      socket.broadcast.emit('socket_draw', moves, options);
    });

    socket.on('mouse_move', (x, y) => {
      console.log('mouse_move');
      socket.broadcast.emit('mouse_moved', x, y, socket.id);
    });

    socket.on('disconnect', () => {
      console.log('client disconnected');
    });
  });

  app.all('*', (req: Request, res: Response) => {
    return nextHandler(req, res);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});