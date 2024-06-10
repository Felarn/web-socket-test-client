import action from "./src/action.js";
import ClientRouter from "./client-router.js";
import createRoom from "./src/createRoom.js";
import getServerUrl from "./src/getServerUrl.js";
import fillPlayerList from "./src/fillPlayerList.js";

// константы
const reconnectionTimeout = 1000;
const serverURL = getServerUrl();

// исходное состояние
const UI = { input: {}, button: {}, info: {} };
const state = {
  ID: null,
  userCondition: "outOfGame",
  playerSide: null,
  playerName: "anon",
  isMyTurn: false,
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
console.log("состояние");
console.log(state);
// функции
const rememberID = ({ userID }) => {
  sessionStorage.setItem("userID", userID);
};

const updateColorSelection = (socket) => {
  const colorSelectionsDictionary = {
    black: ".blackSelection",
    white: ".whiteSelection",
    spectator: ".spectatorSelection",
  };
  document
    .querySelectorAll(".selectedSide")
    .forEach((elem) => elem.classList.remove("selectedSide"));
  document
    .querySelectorAll(colorSelectionsDictionary[state.playerSide])
    .forEach((elem) => elem.classList.add("selectedSide"));
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
  const newList = document.createElement("div");
  state.gameList.forEach((roomInfo) =>
    createRoom(newList, roomInfo, connection)
  );
  UI.gameList.replaceChildren(...newList.children);
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

const updateTurnHeader = (state) => {
  UI.info.turnColor.textContent = `Ход ${
    state.activeSide === "white" ? "белых (✕)" : "черных (◯)"
  }`;
  UI.info.activePlayer.textContent = state.isMyTurn
    ? "Твой ход"
    : `Ход игрока: ${state.activePlayer}`;
};

const assign = (query) => document.querySelector(query);

const setPrivacy = (UI, isPrivate) => {
  UI.privateGame.checked = isPrivate;
};

const showId = (UI, ID) => {
  UI.info.IDdisplay.textContent = `ID для подключения: ${ID}`;
};

const updateNames = (
  { info, input },
  { whitePlayerName, blackPlayerName, gameName }
) => {
  info.blacksName.textContent = blackPlayerName;
  info.whitesName.textContent = whitePlayerName;
  if (document.activeElement !== input.renameGame)
    input.renameGame.value = gameName;
};

//  ================= ссылки на UI =================

UI.connectionStatus = assign("#status");
UI.messageLog = assign("#chat-box");
UI.board = assign("#board");
UI.gameList = assign("#gameList");
UI.privateGame = assign("#privateGame");

UI.playerList = assign("#playerList");
UI.button.copyID = assign("#copyID");
UI.button.newGame = assign("#new-game");
UI.button.joinGame = assign("#join");
UI.button.leaveLobby = assign("#leave");
UI.button.leaveResults = assign("#leaveResults");
UI.button.sendMessage = assign("#send-message");
UI.button.startMatch = assign("#startMatch");
UI.button.win = assign("#win");
UI.button.lose = assign("#lose");
UI.button.surrender = assign("#surrender");
UI.button.draw = assign("#draw");
UI.button.proposeDraw = assign("#proposeDraw");
UI.button.acceptDraw = assign("#acceptDraw");
UI.button.declineDraw = assign("#acceptDraw");
UI.button.pickWhite = assign("#pickWhite");
UI.button.pickBlack = assign("#pickBlack");
UI.button.pickSpectator = assign("#pickSpectator");

UI.input.gameID = assign("#ID-to-join");
UI.input.playerName = assign("#player-name");
UI.input.gameName = assign("#game-name");
UI.input.messageBox = assign("#message-box");
UI.input.renameGame = assign("#renameGame");

UI.info.turnColor = assign("#turnColor");
UI.info.activePlayer = assign("#activePlayer");
UI.info.whitesName = assign("#whitesName");
UI.info.blacksName = assign("#blacksName");
UI.info.IDdisplay = assign("#IDdisplay");

const visibilityDomens = {
  name: UI.input.playerName,
  main: assign("#main-menu"),
  lobby: assign("#lobby"),
  game: assign("#game"),
  result: assign("#resultScreen"),
  chat: assign("#chat-input"),
  socialsContainer: assign(".socialsContainer"),
};

// ============ инициализация ==================
state.playerName = UI.input.playerName.value || "Anon";
updateBoard(state.board);
updateVisibility();
// roomsMock.forEach((room) => createRoom(UI.gameList, room));

const connectServer = () => {
  const socket = new WebSocket(serverURL);

  UI.button.copyID.addEventListener("click", () => {
    navigator.clipboard
      .writeText(state.gameID)
      .then(function () {
        console.log("ID скопирован");
      })
      .catch(function () {
        console.error("Не удалось скопировать текст: ", err);
      });
  });

  UI.privateGame.addEventListener("change", () => {
    const isPrivate = UI.privateGame.checked;
    socket.send(action("switcGamePrivacy", { isPrivate }));
  });

  UI.input.renameGame.addEventListener("input", (event) => {
    socket.send(action("renameGame", { newGameName: event.target.value }));
  });

  UI.input.renameGame.addEventListener("focusout", (event) => {
    socket.send(action("renameGame", { newGameName: event.target.value }));
    // updateNames(UI, state);
  });

  UI.button.win.addEventListener("click", () => {
    socket.send(action("finishGame", { result: "win", reason: "тест победы" }));
  });

  UI.button.lose.addEventListener("click", () => {
    socket.send(
      action("finishGame", { result: "loss", reason: "тест поражения" })
    );
  });

  UI.button.surrender.addEventListener("click", () => {
    socket.send(action("finishGame", { result: "loss", reason: "тест сдачи" }));
  });

  UI.button.draw.addEventListener("click", () => {
    socket.send(action("finishGame", { result: "draw", reason: "тест пата" }));
  });

  UI.button.proposeDraw.addEventListener("click", () => {
    socket.send(action("proposeDraw"));
  });

  UI.button.startMatch.addEventListener("click", () => {
    const newBoard = {
      a1: "empty",
      a2: "empty",
      a3: "empty",
      b1: "empty",
      b2: "empty",
      b3: "empty",
      c1: "empty",
      c2: "empty",
      c3: "empty",
    };
    socket.send(action("startMatch", { board: newBoard }));
    console.log(state);
  });

  UI.button.pickWhite.addEventListener("click", () => {
    state.playerSide = "white";
    socket.send(action("pickSide", { side: state.playerSide }));
  });

  UI.button.pickBlack.addEventListener("click", () => {
    state.playerSide = "black";
    socket.send(action("pickSide", { side: state.playerSide }));
  });

  UI.button.pickSpectator.addEventListener("click", () => {
    state.playerSide = "spectator";
    socket.send(action("pickSide", { side: state.playerSide }));
  });
  ID: UI.board.addEventListener("click", (event) => {
    // the actual game
    const fieldName = event.target.id;
    const fieldState = state.board[fieldName];
    if (!state.isMyTurn) return;
    if (fieldState !== "empty") return;
    state.board[fieldName] = state.playerSide;

    updateBoard(state.board);
    socket.send(action("makeTurn", { board: state.board }));
  });

  UI.input.messageBox.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      const chatMessage = UI.input.messageBox.value;
      UI.input.messageBox.value = "";
      socket.send(action("chat", { message: chatMessage }));
    }
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
  UI.button.leaveResults.addEventListener("click", () => {
    socket.send(action("leave"));
  });

  UI.button.newGame.addEventListener("click", () => {
    socket.send(action("createGame", { gameName: UI.input.gameName.value }));
  });

  UI.input.playerName.addEventListener("input", (event) => {
    state.playerName = event.target.value;
    socket.send(action("rename", { userName: state.playerName }));
  });

  socket.onopen = function (event) {
    setInterval(() => socket.send(action("hello")), 20000);
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

      case "gameState":
        state.board = payload.board;
        console.log("gameState");
        console.log(state);
        updateBoard();
        break;

      case "turnState":
        state.activePlayer = payload.activePlayer;
        state.activeSide = payload.activeSide;
        state.isMyTurn = payload.isYourTurn;
        console.log(state);
        updateTurnHeader(state);
        break;

      case "newUserCondition":
        state.userCondition = payload.userCondition;
        updateVisibility();
        break;

      case "roomsList":
        state.gameList = payload.list;
        updateGameList(socket);
        break;

      case "yourSide":
        state.playerSide = payload.side;
        updateColorSelection(socket);
        break;

      case "gameEnded":
        state.gameResult = payload.result;
        state.closureReason = payload.reason;

        break;

      case "drawProposal":
        console.log("drawProposal");
        state.isDrawProposalActive = true;
        break;

      case "playerList":
        console.log("===================================");

        state.playerList = payload.playerList;
        state.playerList.forEach((palyer) => console.log(palyer));
        state.whitePlayerName = payload.whitePlayerName;
        state.blackPlayerName = payload.blackPlayerName;
        state.gameName = payload.gameName;
        state.isPrivate = payload.isPrivate;
        state.gameID = payload.gameID;
        fillPlayerList(UI.playerList, state.playerList);
        updateNames(UI, state);
        setPrivacy(UI, state.isPrivate);
        showId(UI, state.gameID);
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
