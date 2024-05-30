import ClientRouter from "./client-router.js";
// const router = new ClientRouter();

// Create a WebSocket object and specify the server URL
const socket = new WebSocket("ws://localhost:4444");
// const socket = new WebSocket("wss://89.111.172.139:8080");
// const socket = new WebSocket("wss://felarn.site");
console.log("started");

const state = { ID: null, playerName: "anon", action: "none" };
const UI = { input: {}, button: {} };

UI.connectionStatus = document.querySelector("#status");
UI.input.gameID = document.querySelector("#ID-to-join");
UI.button.newGame = document.querySelector("#new-game");
UI.button.joinGame = document.querySelector("#join");
UI.button.leaveLobby = document.querySelector("#leave");
UI.input.playerName = document.querySelector("#player-name");
UI.input.messageBox = document.querySelector("#message-box");
UI.button.sendMessage = document.querySelector("#send-message");
UI.messageLog = document.querySelector("#chat-box");

UI.button.sendMessage.addEventListener("click", () => {
  state.chatMessage = UI.input.messageBox.value;
  UI.input.messageBox.value = "";
  state.action = "chat";
  socket.send(JSON.stringify(state));
});

// Event handler for when the WebSocket connection is established
socket.onopen = function (event) {
  UI.connectionStatus.classList = ["online"];
  // console.log("WebSocket connection established.");
  socket.send(JSON.stringify(state));
};

UI.button.joinGame.addEventListener("click", () => {
  state.action = "join";
  state.playerName = UI.input.playerName.value;
  state.gameID = UI.input.gameID.value;
  socket.send(JSON.stringify(state));
});

UI.button.leaveLobby.addEventListener("click", () => {
  state.action = "leave";
  state.playerName = UI.input.playerName.value;
  state.gameID = UI.input.gameID.value;
  socket.send(JSON.stringify(state));
});

UI.button.newGame.addEventListener("click", () => {
  state.action = "newGame";
  state.playerName = UI.input.playerName.value;
  socket.send(JSON.stringify(state));
});

// Event handler for incoming messages from the server
socket.onmessage = function (event) {
  // const data = JSON.parse(event.data)
  console.log("Received message from server:", event.data);
  const newItem = document.createElement("div");
  newItem.classList.add("message");
  newItem.append(document.createTextNode("server said: " + event.data));
  messageLog.appendChild(newItem);
};

// Event handler for WebSocket errors
socket.onerror = function (error) {
  connectionStatus.classList = ["offline"];
  console.error("WebSocket error:", error);
};

// Event handler for when the WebSocket connection is closed
socket.onclose = function (event) {
  connectionStatus.classList = ["offline"];
  console.log("WebSocket connection closed:", event);
};
