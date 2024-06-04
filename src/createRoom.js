export default (
  parentElement,
  roomData = {
    roomName: "моя комнатушка",
    host: "ЯЯЯ",
    playerCount: 1,
    id: "670b605d-c4e4-4678-8f9e-f67087e393da",
  }
) => {
  const roomDiv = document.createElement("div");
  roomDiv.classList.add("room");

  const roomHeader = document.createElement("h2");
  roomHeader.textContent = `${roomData.roomName}`;

  const host = document.createElement("p");
  host.classList.add("creator");
  host.textContent = `Создатель: ${roomData.host}`;

  const palayerCount = document.createElement("p");
  palayerCount.classList.add("participants");
  palayerCount.textContent = `участники: ${roomData.playerCount}`;

  const idPara = document.createElement("p");
  idPara.classList.add("id");
  idPara.textContent = `ID: ${roomData.id}`;

  roomDiv.appendChild(roomHeader);
  roomDiv.appendChild(host);
  roomDiv.appendChild(palayerCount);
  roomDiv.appendChild(idPara);

  parentElement.appendChild(roomDiv);
};
