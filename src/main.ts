import "./style.css";
import {
  connectToServer,
  joinTicketRoom,
  sendMessage,
  leaveTicketRoom,
} from "./socket-client.ts";

// Render HTML structure in the #app div
document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <h2>WebSocket - Client!</h2>
    <button id="btn-connect">Connect</button>

    <br/>

    <span id="server-status">offline</span>

    <h3>Clients</h3>
    <ul id="clients-ul">
      <li>Client 1</li>
    </ul>

    <h3>Join Sala</h3>
    <input id="ticket-id-join" placeholder="Ticket ID to join" />
    <button id="btn-join-room">Join Room</button>

    <!-- Nuevo botón rojo para salir de la sala -->
    <button id="btn-leave-room" style="background-color: red; color: white;">Leave Room</button>

    <h3>Send Message</h3>
    <form id="message-form">
      <input placeholder="Content" id="message-input" />
       <input placeholder="Content type" id="contentype-input" />
      <input placeholder="Email" id="email-input" />
        <input placeholder="Name" id="name-input" />
      <input placeholder="Channel" id="channel-input" />

      <button type="submit">Send</button>
    </form>

    <h3>Messages</h3>
    <ul id="message-ul"></ul>

    <!-- Modal -->
    <div id="modal" class="modal" style="display: none;">
      <div class="modal-content">
        <span id="close-modal" class="close">&times;</span>
        <p>You have successfully joined the room!</p>
      </div>
    </div>
  </div>
`;

const emailInput = document.querySelector<HTMLInputElement>("#email-input")!;
const nameInput = document.querySelector<HTMLInputElement>("#name-input")!;
const contentypeInput =
  document.querySelector<HTMLInputElement>("#contentype-input")!;
const channelInput =
  document.querySelector<HTMLInputElement>("#channel-input")!;

const btnConnect = document.querySelector<HTMLButtonElement>("#btn-connect")!;
const btnJoinRoom =
  document.querySelector<HTMLButtonElement>("#btn-join-room")!;
const btnLeaveRoom =
  document.querySelector<HTMLButtonElement>("#btn-leave-room")!;
const ticketIdJoinInput =
  document.querySelector<HTMLInputElement>("#ticket-id-join")!;
const messageForm = document.querySelector<HTMLFormElement>("#message-form")!;
const messageInput =
  document.querySelector<HTMLInputElement>("#message-input")!;
const modal = document.querySelector<HTMLDivElement>("#modal")!;
const closeModal = document.querySelector<HTMLSpanElement>("#close-modal")!;

// Conectar al servidor
btnConnect.addEventListener("click", () => {
  // const selectedUserType = userTypeSelect.value;

  // let email = "";
  // let name = "";

  // email = emailInput.value.trim();
  // if (email.length <= 0 || !/\S+@\S+\.\S+/.test(email)) {
  //   return alert("Enter a valid email address");
  // }
  // name = nameInput.value.trim();
  // if (nameInput.value.trim().length <= 0) {
  //   return alert("Enter a valid name");
  // }

  connectToServer();
});

// Unirse a la sala con el ticket ID
btnJoinRoom.addEventListener("click", () => {
  if (ticketIdJoinInput.value.trim().length <= 0)
    return alert("Enter a valid Ticket ID");

  joinTicketRoom({ room_id: ticketIdJoinInput.value.trim() });

  // Ocultar el input y el botón de unirse a la sala
  ticketIdJoinInput.style.display = "none";
  btnJoinRoom.style.display = "none";

  // Mostrar el modal cuando se haya unido exitosamente a la sala
  modal.style.display = "block";
  modal.querySelector("p")!.textContent =
    "You have successfully joined the room!";
});

// Salir de la sala al hacer clic en el nuevo botón rojo
btnLeaveRoom.addEventListener("click", () => {
  leaveTicketRoom();

  // Mostrar nuevamente el input y el botón de unirse a la sala
  ticketIdJoinInput.style.display = "block";
  btnJoinRoom.style.display = "block";

  // Mostrar el modal cuando se haya salido de la sala
  modal.style.display = "block";
  modal.querySelector("p")!.textContent =
    "You have successfully left the room!";
});

// Cerrar el modal
closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

// Enviar mensaje a la sala
messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (messageInput.value.trim().length <= 0)
    return alert("Please enter a message");

  let email = "";
  let name = "";
  let contenType = "";
  let channel = "";

  email = emailInput.value.trim();
  if (email.length <= 0 || !/\S+@\S+\.\S+/.test(email)) {
    return alert("Enter a valid email address");
  }
  name = nameInput.value.trim();
  if (nameInput.value.trim().length <= 0) {
    return alert("Enter a valid name");
  }

  contenType = contentypeInput.value.trim();
  if (contentypeInput.value.trim().length <= 0) {
    return alert("Enter a valid content type");
  }

  channel = channelInput.value.trim();
  if (channelInput.value.trim().length <= 0) {
    return alert("Enter a valid channel");
  }

  // Enviar el mensaje a la sala actual
  sendMessage(email, name, messageInput.value, contenType, channel);

  messageInput.value = ""; // Limpiar el input del mensaje después de enviar}
  emailInput.value = ""; // Limpiar el input del mensaje después de enviar}
  nameInput.value = ""; // Limpiar el input del mensaje después de enviar}
  contentypeInput.value = ""; // Limpiar el input del mensaje después de enviar}
  channelInput.value = ""; // Limpiar el input del mensaje después de enviar}
});

// Cerrar modal al hacer clic fuera del contenido del modal
window.onclick = (event) => {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

// Manejar carga de la página
window.addEventListener("load", () => {
  // const savedEmail = sessionStorage.getItem("email"); // Obtener el email guardado
  // const savedName = sessionStorage.getItem("name"); // Obtener el nombre guardado
  const savedTicketId = sessionStorage.getItem("currentTicketId"); // Obtener el ticket ID guardado

  // connectToServer(); // Pasar el token y el tipo de usuario

  if (savedTicketId) {
    ticketIdJoinInput.style.display = "none";
    btnJoinRoom.style.display = "none"; // Ocultar si ya está en una sala
  }
});
