export interface ClientToServerEvents {
    draw: (moves: any, options: any) => void;
    disconnect: () => void;
  }
  
  export interface ServerToClientEvents {
    socket_draw: (moves: any, options: any) => void;
  }