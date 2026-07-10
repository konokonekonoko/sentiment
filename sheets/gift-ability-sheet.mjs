import { GiftAbilityUnlocked, reverseKeyValue } from "../enums.mjs";

export default class GiftAbilitySheet extends ActiveEffectConfig {
    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: [
                "sentiment",
                "sheet",
                "active-effect-sheet",
                "giftAbility",
            ],
            template: "systems/sentiment/templates/gift-ability-sheet.html",
            width: 600,
            height: 490,
        });
    }

    /** @inheritdoc */
    async getData(options) {
        const context = await super.getData(options);

        context.system = this.object.system;
        context.flags = this.object.flags?.sentiment ?? {};

        context.selectOptions = {
            unlocked: reverseKeyValue(GiftAbilityUnlocked),
        };

        return context;
    }
}
