import action from "./src/action.js";
import ClientRouter from "./client-router.js";
import createRoom from "./src/createRoom.js";
import getServerUrl from "./src/getServerUrl.js";

// константы
const reconnectionTimeout = 1000;
const serverURL = getServerUrl();

const roomsMock = [
  {
    roomName: "комната",
    host: "создатель",
    playerCount: 3,
    id: "670b605d-c4e4-4678-8f9e-f67087e393da",
  },
  {
    roomName: "моя комнатушка",
    host: "ЯЯЯ",
    playerCount: 2,
    id: "c38d9dec-f031-46d9-9aac-86e40241a3a9",
  },
  {
    roomName: "еще комната",
    host: "юзеннейм",
    playerCount: 1,
    id: "b324f8a7-1bdd-4af5-980d-0d10a0e608dc",
  },
  {
    roomName: "все сюда",
    host: "хостище",
    playerCount: 6,
    id: "4ee3b07d-1802-44bf-8086-54b855d1744c",
  },
];

// исходное состояние
const state = {
  ID: null,
  userCondition: "outOfGame",
  playerSide: null,
  playerName: "anon",
  board: {
    a1: "empty",
    a2: "empty",
    a3: "empty",
    b1: "empty",
    b2: "empty",
    b3: "empty",
    c1: "empty",
    c2: "empty",
    c3: "empty",
  },
  // playerSide:'empty',
  playerSide: "cross",
};

// функции
const rememberID = ({ userID }) => {
  sessionStorage.setItem("userID", userID);
};

const updateBoard = () => {
  const boardState = state.board;
  console.log(boardState);
  Object.entries(boardState).forEach(([fieldName, fieldState]) => {
    const field = document.getElementById(fieldName);

    field.dataset.state = fieldState;
    if (fieldState !== "empty") {
      field.classList.remove("clickable");
    } else {
      field.classList.add("clickable");
    }
  });
};

const updateVisibility = () => {
  console.log(state.userCondition);
  Object.values(visibilityDomens).forEach((domen) => {
    if (domen.classList.contains(state.userCondition)) {
      domen.classList.remove("hidden");
    } else {
      domen.classList.add("hidden");
    }
  });
};

const updateGameList = (connection) => {
  console.log("updating room list");

  // if (state.gameList.length === 0) {

  //   UI.gameList.cl
  //   return}

  const newList = document.createElement("div");
  state.gameList.forEach((roomInfo) =>
    createRoom(newList, roomInfo, connection)
  );
  console.log(newList);
  UI.gameList.replaceChildren(...newList.children);
  // UI.gameList.append(newList);
};

const identification = (connection) => {
  const userID = sessionStorage.getItem("userID");
  if (userID) {
    const payload = { userID, userName: state.playerName };
    connection.send(action("identification", payload));
  } else {
    const payload = { userName: state.playerName };
    connection.send(action("registration", payload));
  }
};

const showChatMessage = (message) => {
  const newItem = document.createElement("div");
  newItem.classList.add("message");
  if (message.action === "chat") {
    newItem.classList.add("chat");
    const text = message.payload.message;
    const from = message.payload.from;
    newItem.append(document.createTextNode(`${from}: ${text}`));
  } else {
    newItem.classList.add("console");
    newItem.append(document.createTextNode("action: " + message.action));
    newItem.append(document.createElement("br"));
    newItem.append(
      document.createTextNode("payload: " + JSON.stringify(message.payload))
    );
  }
  UI.messageLog.appendChild(newItem);
};

const assign = (query) => document.querySelector(query);

//  ================= ссылки на UI =================
const UI = { input: {}, button: {} };

UI.connectionStatus = assign("#status");
UI.button.newGame = assign("#new-game");
UI.button.joinGame = assign("#join");
UI.button.leaveLobby = assign("#leave");
UI.button.sendMessage = assign("#send-message");
UI.input.gameID = assign("#ID-to-join");
UI.input.playerName = assign("#player-name");
UI.input.messageBox = assign("#message-box");
UI.messageLog = assign("#chat-box");
UI.board = assign("#board");
UI.button.pickCross = assign("#pickSideCross");
UI.button.pickCircle = assign("#pickSideCircle");
UI.gameList = assign("#gameList");
UI.playerList = assign("#playerList");

const visibilityDomens = {
  name: UI.input.playerName,
  main: assign("#main-menu"),
  lobby: assign("#lobby"),
  game: assign("#game"),
  chat: assign("#chat-input"),
};

// ============ инициализация ==================
state.playerName = UI.input.playerName.value || "Anon";
updateBoard(state.board);
updateVisibility();
// roomsMock.forEach((room) => createRoom(UI.gameList, room));

const connectServer = () => {
  const socket = new WebSocket(serverURL);

  UI.button.pickCross.addEventListener("click", () => {
    state.playerSide = "cross";
  });

  UI.button.pickCircle.addEventListener("click", () => {
    state.playerSide = "circle";
  });

  UI.board.addEventListener("click", (event) => {
    // const fieldState = event.target.dataset.state
    const fieldName = event.target.id;
    const fieldState = state.board[fieldName];

    if (fieldState === "empty") {
      state.board[fieldName] = state.playerSide;
    }

    updateBoard(state.board);
    socket.send(action("turn", { board: state.board }));
  });

  UI.button.sendMessage.addEventListener("click", () => {
    const chatMessage = UI.input.messageBox.value;
    UI.input.messageBox.value = "";
    socket.send(action("chat", { message: chatMessage }));
  });

  UI.button.joinGame.addEventListener("click", () => {
    const gameID = UI.input.gameID.value;
    socket.send(action("join", { gameID: gameID }));
  });

  UI.button.leaveLobby.addEventListener("click", () => {
    socket.send(action("leave"));
  });

  UI.button.newGame.addEventListener("click", () => {
    socket.send(action("createGame"));
  });

  UI.input.playerName.addEventListener("input", (event) => {
    state.playerName = event.target.value;
    socket.send(action("rename", { userName: state.playerName }));
  });

  socket.onopen = function (event) {
    identification(socket);
    UI.connectionStatus.classList = ["online"];
    console.log("WebSocket connection established");
  };

  // обработка входящих сообщений
  socket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    const payload = data.payload;
    console.log("Received message from server:", event.data);
    showChatMessage(data);

    switch (data.action) {
      case "registered":
        rememberID(payload);
        break;

      case "identified":
        state.userCondition = payload.userCondition;
        state.playerName = payload.userName;
        UI.input.playerName.value = state.playerName;
        updateVisibility();
        break;

      case "turn":
        state.board = payload.board;
        updateBoard();
        break;

      case "newState":
        state.userCondition = payload.userCondition;
        updateVisibility();
        break;

      case "roomsList":
        state.gameList = payload;
        updateGameList(socket);
        break;

      default:
        break;
    }
  };

  socket.onerror = function (error) {
    console.log("connection ERROR, reconnect in" + reconnectionTimeout);
    // setTimeout(() => {
    //   console.log("attempting to reconnect");
    //   connectServer();
    // }, reconnectionTimeout);
    UI.connectionStatus.classList = ["offline"];
    console.error("WebSocket error:", error);
  };

  socket.onclose = function (event) {
    console.log("connection CLOSED, reconnect in" + reconnectionTimeout);
    // setTimeout(() => {
    //   console.log("attempting to reconnect");
    //   connectServer();
    // }, reconnectionTimeout);
    UI.connectionStatus.classList = ["offline"];
  };
};

connectServer();
