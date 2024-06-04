export default () => {
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    var serverURL = "ws://localhost:4444";
    console.log(
      "Сайт запущен на локальном сервере. Подключение к серверу" + serverURL
    );
  } else {
    // var serverURL = "wss://felarn.site/";
    var serverURL = "wss://felarn.ru/";
    console.log("Сайт развернут на хостинге");
  }
  return serverURL;
};
