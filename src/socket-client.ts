import { Manager, Socket } from 'socket.io-client';

let socket: Socket;
let currentTicketId: string | null = null;  // Mantener el ticketId actual
let clientColors: { [key: string]: string } = {}; // Guardar colores para cada cliente

export const connectToServer = (token: string) => {
  const manager = new Manager('http://localhost:4000/socket.io/socket.io.js', {
    extraHeaders: {
      authentication: token,
      connectionType: 'web',
    },
  });

  socket?.removeAllListeners();
  socket = manager.socket('/');

  console.log({ socket });
  addListeners();
};

// Función para asignar un color aleatorio oscuro a cada cliente
const getRandomDarkColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  
  // Solo se permiten valores más bajos para los componentes RGB (0-7)
  for (let i = 0; i < 6; i++) {
    const value = Math.floor(Math.random() * 8);  // Limitamos a 0-7 para evitar colores claros
    color += letters[value];
  }

  return color;
};

const addListeners = () => {
  const clientsUl = document.querySelector<HTMLUListElement>('#clients-ul')!;
  const messageUl = document.querySelector<HTMLUListElement>('#message-ul')!;
  const serverStatusLabel = document.querySelector<HTMLSpanElement>('#server-status')!;

  socket.on('connect', () => {
    console.log('connected');
    serverStatusLabel.innerText = 'connected';
    serverStatusLabel.style.color = 'green';
  });

  socket.on('disconnect', () => {
    console.log('disconnected');
    serverStatusLabel.innerText = 'disconnected';
    serverStatusLabel.style.color = 'red';
  });

  socket.on('clients_updated', (clients: string[]) => {
    let clientsHtml = '';
    clients.forEach((clientId) => {
      if (!clientColors[clientId]) {
        clientColors[clientId] = getRandomDarkColor(); // Asignar un color oscuro si no tiene
      }
      clientsHtml += `<li style="color:${clientColors[clientId]}">${clientId}</li>`;
    });
    clientsUl.innerHTML = clientsHtml;
  });

  socket.on('chatToClient', (payload: { fullName: string; message: string }) => {
    console.log({ payload });
    if (!clientColors[payload.fullName]) {
      clientColors[payload.fullName] = getRandomDarkColor(); // Asignar un color oscuro si no tiene
    }

    // Mostrar el nombre del cliente en color y el mensaje en negro
    const newMessage = `
      <li>
        <strong style="color:${clientColors[payload.fullName]}">${payload.fullName}</strong>
        <span style="color:black;">${payload.message}</span>
      </li>`;

    const li = document.createElement('li');
    li.innerHTML = newMessage;
    messageUl.appendChild(li);
  });
};

export const joinTicketRoom = (ticketId: string) => {
  currentTicketId = ticketId; // Guardar el ticketId
  socket.emit('joinTicketRoom', ticketId);
  console.log(`Joined room with ticket ID: ${ticketId}`);
};

export const leaveTicketRoom = () => {
  if (!currentTicketId) {
    console.error('You are not in any room.');
    return;
  }
  // Emitir el evento para abandonar la sala
  socket.emit('leaveTicketRoom', currentTicketId);
  currentTicketId = null;
  console.log('Left the room');
};

export const sendMessage = (message: string) => {
  if (!currentTicketId) {
    console.error('You must join a room before sending a message.');
    return;
  }
  // Enviar mensaje a la sala correspondiente
  socket.emit('sendMessage', {
    ticketId: currentTicketId,
    message,
  });
};
