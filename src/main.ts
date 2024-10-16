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
    <div id="internal-fields">
      <input id="jwt-token" placeholder="Json Web Token" />
    </div>
    <div id="external-fields" style="display: none;">
      <input id="email-input" placeholder="Email" />
    </div>
    <select id="user-type">
      <option value="INTERNAL">INTERNAL</option>
      <option value="EXTERNAL">EXTERNAL</option>
    </select>
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
      <input placeholder="Message" id="message-input" />
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

const jwtToken = document.querySelector<HTMLInputElement>("#jwt-token")!;
const emailInput = document.querySelector<HTMLInputElement>("#email-input")!;
const userTypeSelect = document.querySelector<HTMLSelectElement>("#user-type")!;
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

// Cambiar los campos de entrada según el tipo de usuario seleccionado
userTypeSelect.addEventListener("change", () => {
  if (userTypeSelect.value === "INTERNAL") {
    jwtToken.parentElement!.style.display = "block"; // Muestra el input del JWT
    emailInput.parentElement!.style.display = "none"; // Oculta el input del email
  } else {
    jwtToken.parentElement!.style.display = "none"; // Oculta el input del JWT
    emailInput.parentElement!.style.display = "block"; // Muestra el input del email
  }
});

// Conectar al servidor
btnConnect.addEventListener("click", () => {
  const selectedUserType = userTypeSelect.value;

  let tokenOrEmail = "";
  if (selectedUserType === "INTERNAL") {
    tokenOrEmail = jwtToken.value.trim();
    if (tokenOrEmail.length <= 0) return alert("Enter a valid JWT Token");
  } else {
    tokenOrEmail = emailInput.value.trim();
    if (tokenOrEmail.length <= 0 || !/\S+@\S+\.\S+/.test(tokenOrEmail)) {
      return alert("Enter a valid email address");
    }
  }

  connectToServer(tokenOrEmail, selectedUserType, emailInput.value);
});

// Unirse a la sala con el ticket ID
btnJoinRoom.addEventListener("click", () => {
  if (ticketIdJoinInput.value.trim().length <= 0)
    return alert("Enter a valid Ticket ID");

  joinTicketRoom(ticketIdJoinInput.value.trim());

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

  // Enviar el mensaje a la sala actual
  sendMessage(messageInput.value);

  messageInput.value = ""; // Limpiar el input del mensaje después de enviar
});

// Cerrar modal al hacer clic fuera del contenido del modal
window.onclick = (event) => {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

// Manejar carga de la página
window.addEventListener("load", () => {
  const savedJwtToken = sessionStorage.getItem("jwtToken");
  const savedUserType = sessionStorage.getItem("userType"); // Obtener el tipo de usuario guardado
  const savedEmailExternal = sessionStorage.getItem("emailExternal"); // Obtener el email guardado
  const savedTicketId = sessionStorage.getItem("currentTicketId"); // Obtener el ticket ID guardado


  if (savedJwtToken && savedUserType) {
    connectToServer(savedJwtToken, savedUserType, ''); // Pasar el token y el tipo de usuario

    if (savedTicketId) {
      ticketIdJoinInput.style.display = "none";
      btnJoinRoom.style.display = "none"; // Ocultar si ya está en una sala
    }
  }

  if (savedUserType && savedEmailExternal) {
    connectToServer('', savedUserType, savedEmailExternal); // Pasar el token y el tipo de usuario

    if (savedTicketId) {
      ticketIdJoinInput.style.display = "none";
      btnJoinRoom.style.display = "none"; // Ocultar si ya está en una sala
    }
  }
});
