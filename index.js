// Create a WebSocket object and specify the server URL
// const socket = new WebSocket("ws://localhost:8080");
 // const socket = new WebSocket("wss://89.111.172.139:8080");
const socket = new WebSocket("wss://felarn.site");

const connectionStatus = document.querySelector("#status");
const IDinput = document.querySelector("#ID-to-join");
const joinButtGon = document.querySelector("#join");
const newGameButton = document.querySelector("#new-game");
const playerNameInput = document.querySelector("#player-name");

state = { ID: null, playerName: "anon", action: "none" };
// Event handler for when the WebSocket connection is established
socket.onopen = function (event) {
  connectionStatus.classList = ["online"];
  console.log("WebSocket connection established.");
  socket.send(JSON.stringify(state));
};

joinButtGon.addEventListener("click", () => {
  state.action = "join";
  state.playerName = playerNameInput.value;
  state.ID = IDinput.value;
  socket.send(JSON.stringify(state));
});

newGameButton.addEventListener("click", () => {
  state.action = "newGame";
  state.playerName = playerNameInput.value;
  // state.ID = IDinput.value;
  socket.send(JSON.stringify(state));
});

const messageLog = document.querySelector("#chat-box");

// // Event handler for incoming messages from the server
socket.onmessage = function (event) {
  // const data = JSON.parse(event.data)
  console.log("Received message from server:", event.data);
  const newItem = document.createElement("li");
  newItem.classList.add('message')
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

// counter = 0;
// // Send a message to the server
// window.document.querySelector(".hello-button").addEventListener("click", () => {
//   socket.send("Hello, server! # " + counter);
//   counter += 1;
// });

// //test buttons
// window.document.querySelector(".test-button").addEventListener("click", () => {
//   const newItem = document.createElement("li");
//   newItem.append(document.createTextNode("test1"));
//   messageLog.appendChild(newItem);
// });
