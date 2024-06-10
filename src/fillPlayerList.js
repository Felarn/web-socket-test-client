export default (parentElement, playerList) => {
  console.log("refilling player list");
  const newList = document.createElement("div");
  playerList.forEach((player) => {
    const playerItem = document.createElement("div");
    playerItem.classList.add("playerInfo");
    if (player.side === "black") playerItem.classList.add("black");
    if (player.side === "white") playerItem.classList.add("white");
    const playerName = document.createTextNode(player.userName);
    const onlineIndicator = document.createElement("span");
    onlineIndicator.classList.add("playerConnectionStatus");
    onlineIndicator.classList.add(player.connectionStatus);
    playerItem.append(onlineIndicator);
    playerItem.append(playerName);
    newList.append(playerItem);
  });
  parentElement.replaceChildren(...newList.children);
};
