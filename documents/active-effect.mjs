import { GiftAbilityUnlocked } from "../enums.mjs"
const fields = foundry.data.fields;

export class GiftAbilityData extends foundry.abstract.DataModel {
  static defineSchema() {
    return {
      unlocked: new fields.NumberField({
        initial: GiftAbilityUnlocked.locked,
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
        min: new fields.NumberField({
          initial: null,
          integer: false,
          nullable: true,
        }),
        max: new fields.NumberField({
          initial: null,
          integer: false,
          nullable: true,
        })
      }),
    };
  }
}
