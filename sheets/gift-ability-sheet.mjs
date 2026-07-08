export default class GiftAbilitySheet extends ActiveEffectConfig {

  /** @override */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      // template: "systems/ndes/templates/effect/effect-sheet.hbs",
      // width: 600,
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
}