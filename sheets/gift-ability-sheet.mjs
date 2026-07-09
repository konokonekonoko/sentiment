import { 
  GiftAbilityUnlocked,
  reverseKeyValue
  } from "../enums.mjs"

export default class GiftAbilitySheet extends ActiveEffectConfig {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["sentiment", "sheet", "active-effect-sheet", "giftAbility"],
      template: "systems/sentiment/templates/gift-ability-sheet.hbs",
      width: 600,
      height: 600
      // tabs: [
      //   {
      //     navSelector: ".sheet-tabs",
      //     contentSelector: "form",
      //     group: "primary",
      //     initial: "effects",
      //   },
      // ],
    });
  }

  async getData(options) {
    const context = await super.getData(options);

    context.system = this.object.system;

    context.flags = this.object.flags?.sentiment ?? {};
  
    context.selectOptions = {
      unlocked: reverseKeyValue(GiftAbilityUnlocked)
    }

    // await this.#populateDescription(context);
    // this.#populateAbilities(context);

    console.log("gift ability sheet context", context)
    return context;
  }
}