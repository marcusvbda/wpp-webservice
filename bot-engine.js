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
      headless: false,
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

      client.instance_params = params;

      client.getSessionTokenBrowser().then((token) => {
        eventEmitter.emit("token-generated", { token });
      });

      client.onStateChange((state) => {
        if (["CONFLICT"].includes(state)) {
          eventEmitter.emit("session-conflict");
        }
      });

      return client;
    } catch (er) {
      console.log(er);
    }
  },
};

module.exports = bot;
