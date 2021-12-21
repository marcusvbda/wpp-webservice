const venom = require("venom-bot");

const bot = {
  async start(eventEmitter, params) {
    const qrGeneratedHandler = (base64Qrimg, asciiQR, attempts, urlCode) => {
      eventEmitter.emit("qr-generated", {
        base64Qrimg,
        asciiQR,
        attempts,
        urlCode,
      });
    };

    const sessionHandler = (statusSession, session) => {
      eventEmitter.emit("session-updated", { statusSession, session });
    };

    const settings = {
      disableWelcome: true,
      debug: false,
      logQR: false,
      headless: true,
      puppeteerOptions: {},
      autoClose: 60000,
      createPathFileToken: false,
    };

    try {
      let client = await venom.create(
        params.session_id,
        qrGeneratedHandler,
        sessionHandler,
        settings,
        params.token
      );

      client.getSessionTokenBrowser().then((token) => {
        eventEmitter.emit("token-generated", { token });
      });

      eventEmitter.on("send-message", (data) => {
        const phone_number = `${data.phone_number}@c.us`;
        client
          .sendText(phone_number, data.body)
          .then((result) => {
            eventEmitter.emit("sent-message", result);
          })
          .catch((er) => {
            eventEmitter.emit("message-failed", er);
          });
      });

      return client;
    } catch (er) {
      console.log(er);
    }
  },
};

module.exports = bot;
