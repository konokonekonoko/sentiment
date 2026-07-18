import { GiftEquipStatus } from "../enums.mjs";

export const GiftEquipStatusInitial = GiftEquipStatus.Unequipped;

export class GiftData extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            description: new foundry.data.fields.HTMLField(),
            type: new foundry.data.fields.StringField(),
            equipStatus: new foundry.data.fields.NumberField({
                integer: true,
                initial: GiftEquipStatusInitial
            })
        };
    }
}