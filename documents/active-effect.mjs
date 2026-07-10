import { GiftAbilityUnlocked, ListSortValueIncrement } from "../enums.mjs";

const fields = foundry.data.fields;

export class GiftAbilityData extends foundry.abstract.DataModel {
    static defineSchema() {
        return {
            sort: new fields.NumberField({
                initial: ListSortValueIncrement,
                integer: true,
                nullable: false,
            }),
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
    #getParent() {
        const item = this.parent;
        if (!item) return;
        const actor = item.parent;
        if (!actor) return item;
        return actor;
    }

    async abilityToChat() {
        const context = {
            title: "GiftAbility",
            system: this.system,
        };
        context.enrichedName = await TextEditor.enrichHTML(this.name, {
            secrets: this.isOwner,
            async: true,
        });
        context.enrichedDescription = await TextEditor.enrichHTML(
            this.system.description,
            {
                secrets: this.isOwner,
                async: true,
            }
        );

        const templatePath =
            "systems/sentiment/templates/abilities/ability-chat.html";
        return this.#renderToChatMessage(templatePath, context);
    }

    /**
     * Render an HTML template with arguments as a chat message with this character as the speaker.
     * @param templatePath
     * @param args
     * @param messageOptions
     * @private
     */
    async #renderToChatMessage(templatePath, args, messageOptions = {}) {
        const html = await renderTemplate(templatePath, {
            ...args,
            speaker: this,
        });
        let message = {
            user: game.user.id,
            speaker: ChatMessage.getSpeaker({ actor: this.#getParent() }),
            content: html,
        };

        message = foundry.utils.mergeObject(message, messageOptions);

        const createdMessage = await ChatMessage.create(message);
        createdMessage.setFlag("sentiment", args.title ?? "Unknown", {
            ...args,
            origin: {
                uuid: this.uuid,
                name: this.name,
            },
        });
        return createdMessage;
    }
}
