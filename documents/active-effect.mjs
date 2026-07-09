import { GiftAbilityUnlocked } from "../enums.mjs";
const fields = foundry.data.fields;

export class GiftAbilityData extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      unlocked: new fields.NumberField({
        initial: GiftAbilityUnlocked.Unlocked,
        integer: true,
        nullable: false,
      }),
      description: new fields.HTMLField(),
      level: new fields.StringField({
        initial: null,
        nullable: true,
      }),
      resource: new fields.SchemaField({
        name: new fields.StringField({
          initial: null,
          nullable: true,
        }),
        remaining: new fields.NumberField({
          initial: null,
          integer: false,
          nullable: true,
        }),
        max: new fields.NumberField({
          initial: null,
          integer: false,
          nullable: true,
        }),
      }),
      cooldown: new fields.SchemaField({
        remaining: new fields.NumberField({
          initial: null,
          integer: true,
          nullable: true,
        }),
        max: new fields.NumberField({
          initial: null,
          integer: true,
          nullable: true,
        }),
      }),
    };
  }
}

export class SentimentActiveEffect extends ActiveEffect {
  async _preCreate(data, options, user) {
    await super._preCreate(data, options, user);

    if (this.type === "giftAbility") {
      this.updateSource({
        "flags.sentiment": {
          levelEnabled: true,
          unlockedEnabled: true,
        },
      });
    };
  }
}
