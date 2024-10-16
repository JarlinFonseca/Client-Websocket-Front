import './style.css';
import { connectToServer, joinTicketRoom, sendMessage, leaveTicketRoom } from './socket-client.ts';

// Render HTML structure in the #app div
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h2>WebSocket - Client!</h2>
    <input id="jwt-token" placeholder="Json Web Token" />
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

const jwtToken = document.querySelector<HTMLInputElement>('#jwt-token')!;
const btnConnect = document.querySelector<HTMLButtonElement>('#btn-connect')!;
const btnJoinRoom = document.querySelector<HTMLButtonElement>('#btn-join-room')!;
const btnLeaveRoom = document.querySelector<HTMLButtonElement>('#btn-leave-room')!; // Botón para salir de la sala
const ticketIdJoinInput = document.querySelector<HTMLInputElement>('#ticket-id-join')!;
const messageForm = document.querySelector<HTMLFormElement>('#message-form')!;
const messageInput = document.querySelector<HTMLInputElement>('#message-input')!;
const modal = document.querySelector<HTMLDivElement>('#modal')!;
const closeModal = document.querySelector<HTMLSpanElement>('#close-modal')!;

// Conectar al servidor
btnConnect.addEventListener('click', () => {
  if (jwtToken.value.trim().length <= 0) return alert('Enter a valid JWT Token');
  connectToServer(jwtToken.value.trim());
});

// Unirse a la sala con el ticket ID
btnJoinRoom.addEventListener('click', () => {
  if (ticketIdJoinInput.value.trim().length <= 0) return alert('Enter a valid Ticket ID');
  
  joinTicketRoom(ticketIdJoinInput.value.trim());

  // Ocultar el input y el botón de unirse a la sala
  ticketIdJoinInput.style.display = 'none';
  btnJoinRoom.style.display = 'none';

  // Mostrar el modal cuando se haya unido exitosamente a la sala
  modal.style.display = 'block';
  modal.querySelector('p')!.textContent = 'You have successfully joined the room!';
});

// Salir de la sala al hacer clic en el nuevo botón rojo
btnLeaveRoom.addEventListener('click', () => {
  leaveTicketRoom();

  // Mostrar nuevamente el input y el botón de unirse a la sala
  ticketIdJoinInput.style.display = 'block';
  btnJoinRoom.style.display = 'block';

  // Mostrar el modal cuando se haya salido de la sala
  modal.style.display = 'block';
  modal.querySelector('p')!.textContent = 'You have successfully left the room!';
});

// Cerrar el modal
closeModal.addEventListener('click', () => {
  modal.style.display = 'none';
});

// Enviar mensaje a la sala
messageForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (messageInput.value.trim().length <= 0) return alert('Please enter a message');
  
  // Enviar el mensaje a la sala actual
  sendMessage(messageInput.value);

  messageInput.value = ''; // Limpiar el input del mensaje después de enviar
});

// Cerrar modal al hacer clic fuera del contenido del modal
window.onclick = (event) => {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
};
