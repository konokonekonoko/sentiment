export default class GiftSheet extends ItemSheet {

    /** @inheritdoc */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["sentiment", "sheet", "gift"],
            template: "systems/sentiment/templates/gift-sheet.html",
            dragDrop: [
                { dragSelector: ".ability-list .ability", dropSelector: null }
            ],
            width: 600,
            height: 600
        });
    }
    
    /** @inheritdoc */
    async getData(options) {
        const context = await super.getData(options);

        context.effects = this.object.effects;

        await this.#populateDescription(context);
        this.#populateAbilities(context);

        console.log("gift getData", context)
        return context;
    }

    /** @inheritdoc */
    activateListeners(html) {
        super.activateListeners(html);
        
        // html.find(".attribute-open").click(this.#onAttributeOpen.bind(this));
        // html.find(".gift-open").click(this.#onGiftOpen.bind(this));

        if (!this.isEditable) {
            return;
        }

        html.find(".ability-add").click(this.#onAbilityAdd.bind(this));
        html.find(".ability-delete").click(this.#onAbilityDelete.bind(this));

        // this.#setDragDataOnButton(html, ".drop-swing", "dropSwing");
        // this.#setDragDataOnButton(html, ".roll-to-do", "rollToDo");
        // this.#setDragDataOnButton(html, ".roll-to-dye", "rollToDye");
        // this.#setDragDataOnButton(html, ".recovery-roll", "recoveryRoll");
        // this.#setDragDataOnCustomRolls(html);
    }

    /**
     * Get the item associated with an event emitted from a list.
     * @param event
     * @private
     */
    #getItemFromListEvent(event) {
        const listItem = $(event.currentTarget).parents(".list-item");
        const item = this.actor.items.get(listItem.data("itemId"));
        return item;
    }

    /**
     * Handle event when the user adds an ability.
     * @param event
     * @private
     */
    async #onAbilityAdd(event) {
        event.preventDefault();
        const effectData = {
            name: "New Ability",
            type: "giftAbility"
        };

        return await ActiveEffect.create(effectData, { parent: this.item });
    }

    /**
     * Handle event when the user deletes an attribute.
     * @param event
     * @private
     */
    #onAbilityDelete(event) {
        event.preventDefault();

        const attribute = this.#getItemFromListEvent(event);
        attribute.deleteDialog();
    }

    #populateAbilities(context) {
        context.abilities = [];
        for (let item of context.effects) {
            if (item.type == "attribute") {
                context.attributes.push(item);
            }
        }
    }

    /**
    * Transform the raw description property into enriched HTML and embed it into the context for easy access.
    * @param context
    * @private
    */
    async #populateDescription(context) {
        context.descriptionHTML = await TextEditor.enrichHTML(context.data.system.description, {
            secrets: this.document.isOwner,
            async: true
        });
    } 
}
