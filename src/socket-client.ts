import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import timezone from "dayjs/plugin/timezone";

import { Manager, Socket } from "socket.io-client";

let socket: Socket;
let currentTicketId: string | null = sessionStorage.getItem("currentTicketId"); // Usar sessionStorage para manejar cada cliente de forma independiente
let clientColors: { [key: string]: string } = {}; // Guardar colores para cada cliente

dayjs.extend(utc);
dayjs.extend(timezone);

// Función que convierte una fecha en UTC a la hora local del usuario
export function convertToLocalTimeZone(value: dayjs.ConfigType) {
  return dayjs.utc(value).tz(dayjs.tz.guess()); // Convierte de UTC a la zona horaria local
}

export const connectToServer = (email: string, name: string) => {
  sessionStorage.setItem("email", email); // Guardar el email
  sessionStorage.setItem("name", name); // Guardar el nombre

  const manager = new Manager("http://localhost:4000/socket.io/socket.io.js", {
    extraHeaders: {
      email,
      name,
    },
  });

  socket?.removeAllListeners();
  socket = manager.socket("/");

  console.log({ socket });
  addListeners();

  // Si ya estaba en una sala, volver a unirse automáticamente
  if (currentTicketId) {
    joinTicketRoom({ room_id: currentTicketId });
  }
};

// Función para asignar un color aleatorio oscuro a cada cliente
const getRandomDarkColor = () => {
  const letters = "0123456789ABCDEF";
  let color = "#";

  // Solo se permiten valores más bajos para los componentes RGB (0-7)
  for (let i = 0; i < 6; i++) {
    const value = Math.floor(Math.random() * 8); // Limitamos a 0-7 para evitar colores claros
    color += letters[value];
  }

  return color;
};

const addListeners = () => {
  const clientsUl = document.querySelector<HTMLUListElement>("#clients-ul")!;
  const messageUl = document.querySelector<HTMLUListElement>("#message-ul")!;
  const btnJoinRoom =
    document.querySelector<HTMLButtonElement>("#btn-join-room")!;
  const ticketIdJoinInput =
    document.querySelector<HTMLInputElement>("#ticket-id-join")!;
  const serverStatusLabel =
    document.querySelector<HTMLSpanElement>("#server-status")!;

  socket.on("connect", () => {
    console.log("connected");
    serverStatusLabel.innerText = "connected";
    serverStatusLabel.style.color = "green";
  });

  socket.on("disconnect", () => {
    console.log("disconnected");
    serverStatusLabel.innerText = "disconnected";
    serverStatusLabel.style.color = "red";
    // Eliminar currentTicketId del sessionStorage al desconectarse
    sessionStorage.removeItem("currentTicketId");
    currentTicketId = null; // También puedes limpiar la variable actual

    // Mostrar el input y el botón para unirse a la sala
    btnJoinRoom.style.display = "block"; // Mostrar el input
    ticketIdJoinInput.style.display = "block"; // Mostrar el botón
  });

  socket.on("clients_updated", (clients: string[]) => {
    let clientsHtml = "";
    clients.forEach((clientId) => {
      if (!clientColors[clientId]) {
        clientColors[clientId] = getRandomDarkColor(); // Asignar un color oscuro si no tiene
      }
      clientsHtml += `<li style="color:${clientColors[clientId]}">${clientId}</li>`;
    });
    clientsUl.innerHTML = clientsHtml;
  });

  socket.on(
    "chatToClient",
    (payload: { full_name: string; content: string; created_at: string }) => {
      console.log({ payload });
      if (!clientColors[payload.full_name]) {
        clientColors[payload.full_name] = getRandomDarkColor(); // Asignar un color oscuro si no tiene
      }

      // Convertir la fecha UTC a la zona horaria local
      // const localDate = new Date(payload.created_at);
      // const localTimeString = localDate.toLocaleTimeString();

      const localTime = convertToLocalTimeZone(payload.created_at).format(
        "HH:mm:ss"
      );

      const newMessage = `
      <li>
        <strong style="color:${clientColors[payload.full_name]}">${
        payload.full_name
      }</strong>
        <span style="color:black;">${payload.content}</span>
         <small style="color:gray;">${localTime}</small>
      </li>`;

      const li = document.createElement("li");
      li.innerHTML = newMessage;
      messageUl.appendChild(li);
    }
  );

  socket.on(
    "previousMessages",
    (
      messages: Array<{
        name: string;
        email: string;
        content: string;
        created_at: string;
      }>
    ) => {
      messages.forEach((msg) => {
        if (!clientColors[msg.name]) {
          clientColors[msg.name] = getRandomDarkColor(); // Asignar un color oscuro si no tiene
        }

        // const userName = `Usuario ${msg.user_id}`;
        const userName = msg.name;
        const localTime = convertToLocalTimeZone(msg.created_at).format(
          "HH:mm:ss"
        );

        const newMessage = `
        <li>
          <strong style="color:${
            clientColors[msg.name]
          }">${userName}</strong>
          <span style="color:black;">${msg.content}</span>
          <small style="color:gray;">${localTime}</small>
        </li>`;

        const li = document.createElement("li");
        li.innerHTML = newMessage;
        messageUl.appendChild(li);
      });
    }
  );
};

export const joinTicketRoom = (data: { room_id: string }) => {
  currentTicketId = data.room_id;
  sessionStorage.setItem("currentTicketId", currentTicketId); // Guardar el ticketId en sessionStorage
  socket.emit("joinRoom", {room_id: data.room_id});
  console.log(`Joined room with ticket ID: ${data.room_id}`);
};

export const leaveTicketRoom = () => {
  if (!currentTicketId) {
    console.error("You are not in any room.");
    return;
  }
  socket.emit("leaveRoom", { room_id: currentTicketId });
  sessionStorage.removeItem("currentTicketId");
  currentTicketId = null;
  console.log("Left the room");
};

export const sendMessage = (content: string) => {
  if (!currentTicketId) {
    console.error("You must join a room before sending a message.");
    return;
  }
  socket.emit("sendMessage", {
    room_id: currentTicketId,
    content,
    content_type: "text/plain",
  });
};
