const venom = require("venom-bot");

const session = {};

const phone_number = "@c.us";

const buttons = [
  {
    buttonText: {
      displayText: "Opção 1",
    },
  },
  {
    buttonText: {
      displayText: "Opção 2",
    },
  },
];

venom
  .create(
    "sessionName",
    (base64Qrimg, asciiQR, attempts, urlCode) => {
      console.log("Number of attempts to read the qrcode: ", attempts);
      console.log("Terminal qrcode: ", asciiQR);
      console.log("base64 image string qrcode: ", base64Qrimg);
      console.log("urlCode (data-ref): ", urlCode);
    },
    (statusSession, session) => {
      console.log("Status Session: ", statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken
      //Create session wss return "serverClose" case server for close
      console.log("Session name: ", session);
    },
    {
      headless: false, // Headless chrome
      puppeteerOptions: {}, // Will be passed to puppeteer.launch
      autoClose: 60000, // Automatically closes the venom-bot only when scanning the QR code (default 60 seconds, if you want to turn it off, assign 0 or false)
      createPathFileToken: false, //creates a folder when inserting an object in the client's browser, to work it is necessary to pass the parameters in the function create browserSessionToken
    },
    session
  )
  .then((client) => start(client))
  .catch((er) => {
    console.log(er);
  });

const start = (client) => {
  client.onMessage((message) => {
    if (message.body === "Opção 1" && message.isGroupMsg === false) {
      client
        .sendText(message.from, "Entendi, você escolheu a opção 1")
        .then((result) => {
          console.log("Result: ", result); //return object success
        })
        .catch((erro) => {
          console.error("Error when sending: ", erro); //return object error
        });
    }

    if (message.body === "Opção 2" && message.isGroupMsg === false) {
      client
        .sendText(message.from, "Entendi, você escolheu a opção 2")
        .then((result) => {
          console.log("Result: ", result); //return object success
        })
        .catch((erro) => {
          console.error("Error when sending: ", erro); //return object error
        });
    }
  });

  client.getSessionTokenBrowser().then((token) => {
    console.log("AQUI SEU TOKEN", token);
  });

  client
    .sendText(phone_number, "mensagem de texto 1")
    .then((result) => {
      console.log("Mensagem enviada : ", result); //return object success
    })
    .catch((erro) => {
      console.error("Erro ao enviar mensagem: ", erro); //return object error
    });

  //   client
  //     .sendButtons(
  //       phone_number,
  //       "Olá Boa tarde, isso é um teste de botões",
  //       buttons,
  //       "Escolha uma das opções :"
  //     )
  //     .then((result) => {
  //       console.log("Result: ", result); //return object success
  //     })
  //     .catch((erro) => {
  //       console.error("Error when sending: ", erro); //return object error
  //     });

  //   client
  //     .sendImage(
  //       phone_number,
  //       "https://img.ibxk.com.br/2017/07/13/13160112901226.jpg",
  //       "image-name",
  //       "Caption text"
  //     )
  //     .then((result) => {
  //       console.log("Result: ", result); //return object success
  //     })
  //     .catch((erro) => {
  //       console.error("Error when sending: ", erro); //return object error
  //     });

  //   client
  //     .sendFile(
  //       phone_number,
  //       "http://www.africau.edu/images/default/sample.pdf",
  //       "file_name",
  //       "See my file in pdf"
  //     )
  //     .then((result) => {
  //       console.log("Result: ", result); //return object success
  //     })
  //     .catch((erro) => {
  //       console.error("Error when sending: ", erro); //return object error
  //     });
};
