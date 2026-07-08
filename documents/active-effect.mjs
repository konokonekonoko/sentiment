import { GiftAbilityUnlocked } from "../enums.mjs"

export class GiftAbilityData extends ActiveEffect {
  static defineSchema() {
    const fields = foundry.data.fields;
    const schema = super.defineSchema();
    return {
      ...schema,
      // type: fields.StringField({
      //   initial: "",
      //   required: true,
      // }),
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
      resource: new fields.schemaField({
        name: fields.StringField({
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
