import ClientRouter from "./client-router.js";
// const router = new ClientRouter();

// Create a WebSocket object and specify the server URL
const socket = new WebSocket("ws://localhost:4444");
// const socket = new WebSocket("wss://89.111.172.139:8080");
// const socket = new WebSocket("wss://felarn.site");
console.log("started");

const state = { 
ID: null, 
playerName: "anon", 
action: "none", 
board:{
'a1':'empty','a2':'empty','a3':'empty',
'b1':'empty','b2':'empty','b3':'empty',
'c1':'empty','c2':'empty','c3':'empty',
},
// playerSide:'empty',
playerSide:'cross',
};

const updateBoard = () => {
  const boardState=state.board
  console.log(boardState)
Object.entries(boardState)
.forEach(([fieldName,fieldState]) =>  {
  const field = document.getElementById(fieldName);

  field.dataset.state = fieldState
  if (fieldState !== 'empty'){
    field.classList.remove('clickable')
  } else {
    field.classList.add('clickable')
  }
})
}

updateBoard(state.board)

const UI = { input: {}, button: {} };

const assign = (query) => document.querySelector(query);

UI.connectionStatus = document.querySelector("#status");
UI.input.gameID = document.querySelector("#ID-to-join");
UI.button.newGame = document.querySelector("#new-game");
UI.button.joinGame = document.querySelector("#join");
UI.button.leaveLobby = document.querySelector("#leave");
UI.input.playerName = document.querySelector("#player-name");
UI.input.messageBox = document.querySelector("#message-box");
UI.button.sendMessage = document.querySelector("#send-message");
UI.messageLog = document.querySelector("#chat-box");
UI.borard = document.querySelector('#board')
UI.button.pickCross = assign('#pickSideCross')
UI.button.pickCircle = assign('#pickSideCircle')

UI.button.pickCross.addEventListener('click',()=>{
  state.playerSide = 'cross'
})

UI.button.pickCircle.addEventListener('click',()=>{
  state.playerSide = 'circle'
})

UI.borard.addEventListener("click",(event)=>{
  // const fieldState = event.target.dataset.state
  const fieldName = event.target.id
  const fieldState = state.board[fieldName]

  if (fieldState === 'empty'){
    state.board[fieldName] = state.playerSide
  }
  updateBoard(state.board)
  socket.send(JSON.stringify({action:'turn',state}))
})

UI.button.sendMessage.addEventListener("click", () => {
  state.chatMessage = UI.input.messageBox.value;
  UI.input.messageBox.value = "";
  state.action = "chat";
  socket.send(JSON.stringify(state));
});



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

// Event handler for when the WebSocket connection is established
socket.onopen = function (event) {
  UI.connectionStatus.classList = ["online"];
  // console.log("WebSocket connection established.");
  socket.send(JSON.stringify(state));
};

// Event handler for incoming messages from the server
socket.onmessage = function (event) {
  const data = JSON.parse(event.data)
  console.log("Received message from server:", event.data);
  const newItem = document.createElement("div");
  newItem.classList.add("message");
  newItem.append(document.createTextNode("server said: " + event.data));
  UI.messageLog.appendChild(newItem);

  // const data = JSON.parse(event.data)
  if (data.action === 'turn'){
    state.board = data.state.board
    console.log('new board state')

    updateBoard()
  }
};

// Event handler for WebSocket errors
socket.onerror = function (error) {
  UI.connectionStatus.classList = ["offline"];
  console.error("WebSocket error:", error);
};

// Event handler for when the WebSocket connection is closed
socket.onclose = function (event) {
  UI.connectionStatus.classList = ["offline"];
  console.log("WebSocket connection closed:", event);
};
