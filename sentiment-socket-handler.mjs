export default class SentimentSocketHandler {
  constructor() {
    this.identifier = "system.sentiment";
    this.registerSocketHandlers();
  }

  registerSocketHandlers() {
    game.socket.on(this.identifier, async ({ type, payload }) => {
      console.debug("Socket Receiving", type, payload);
      const [userSpace, command] = type.includes(".")
        ? type.split(".")
        : ["GM", type];

      if (userSpace === "GM") {
        if (game.user !== game.users.activeGM) return;
        this.#CommandHandler(command, payload);
      } else {
        this.#CommandHandler(command, payload);
      }
    });
  }

  /**
   * Emit a command name with an optional user-space (GM: only processed by GM, USER: only processed by every user).
   * Example: `emit(gm.testCommand,{ string: "test" }, true)`
   * Once emitted, the "testCommand" case, as defined in #CommandHandler will be run by every GM currently in the
   * game, including the emitter, assuming they are a GM.
   * @param {String} type
   * @param {Object} payload
   * @param {Boolean} [processedByEmitter=false]
   * @return {*}
   * @memberof SentimentSocketHandler
   */
  emit(type, payload, processedByEmitter = false) {
    console.debug("Socket Emitting", type, payload);
    if (processedByEmitter) {
      const [userSpace, command] = type.includes(".")
        ? type.split(".")
        : ["GM", type];
      if (userSpace === "GM") {
        if (game.user === game.users.activeGM) {
          this.#CommandHandler(command, payload);
        }
      } else {
        this.#CommandHandler(command, payload);
      }
    }
    return game.socket.emit(this.identifier, { type, payload });
  }

  async #CommandHandler(command, payload) {
    // define actor for commands that use it
    let actor = await fromUuid(payload?.actorUuid);
    switch (command) {
      case "UPDATE-SWING-GLOW":
        const attributeId = payload?.newSwingAttributeId;
        if (!attributeId) break;
        actor.updateTokenGlow(attributeId);
        break;

      default:
        throw new Error("unknown socket type", type);
    }
  }
}
