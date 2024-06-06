import action from "./action.js";
export default (
  parentElement,
  roomData = {
    gameName: "моя комнатушка",
    hostName: "ЯЯЯ",
    playerCount: 1,
    gameID: "670b605d-c4e4-4678-8f9e-f67087e393da",
  },
  connection
) => {
  const roomDiv = document.createElement("div");
  roomDiv.classList.add("room");

  const roomHeader = document.createElement("h2");
  roomHeader.textContent = `${roomData.gameName}`;

  const host = document.createElement("p");
  host.classList.add("creator");
  host.textContent = `Создатель: ${roomData.hostName}`;

  const palayerCount = document.createElement("p");
  palayerCount.classList.add("participants");
  palayerCount.textContent = `участники: ${roomData.playerCount}`;

  const idPara = document.createElement("p");
  idPara.classList.add("id");
  idPara.textContent = `ID: ${roomData.gameID}`;

  roomDiv.appendChild(roomHeader);
  roomDiv.appendChild(host);
  roomDiv.appendChild(palayerCount);
  roomDiv.appendChild(idPara);
  roomDiv.addEventListener("click", (e) => {
    console.log("click");
    connection.send(action("join", { gameID: roomData.gameID }));
  });

  parentElement.appendChild(roomDiv);
};
