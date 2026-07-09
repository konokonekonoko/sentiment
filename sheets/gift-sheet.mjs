import { jqueryHTMLhandler } from "../chat.mjs";

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

    #Abilities = []

    /** @inheritdoc */
    _onDragStart(event) {
        super._onDragStart(event);

        const draggedAbilityHtml = event.target.closest(".ability");
        if (draggedAbilityHtml === null) {
            return;
        }

        const itemId = draggedAbilityHtml.dataset["itemId"];
        event.dataTransfer.setData("ability", JSON.stringify({ abilityId: itemId }));
    }

    // /** @inheritdoc */
    // _onDrop(event) {
    //     // const abilityListContainerHtml = event.target.closest(".gift-list-container");

    //     let droppedAbilityId;
    //     try {
    //         const data = JSON.parse(event.dataTransfer.getData("gift"));
    //         droppedAbilityId = data.giftId;
    //     } catch (err) { }

    //     if (!droppedAbilityId) {
    //         return super._onDrop(event);
    //     }

    //     const giftDroppedUponId = event.target.closest(".gift")?.dataset["itemId"];
    //     this.#handleGiftDroppedOnList(droppedAbilityId, giftDroppedUponId, giftListContainerHtml);
    // }
    
    /** @inheritdoc */
    async getData(options) {
        const context = await super.getData(options);

        context.effects = this.object.effects;

        await this.#populateDescription(context);
        await this.#populateAbilities(context);

        console.log("gift getData", context)
        return context;
    }

    /** @inheritdoc */
    activateListeners(html) {
        super.activateListeners(html);
        
        html.find(".ability-open").click(this.#onAbilityOpen.bind(this));

        if (!this.isEditable) {
            return;
        }

        html.find(".ability-add").click(this.#onAbilityAdd.bind(this));
        html.find(".ability-delete").click(this.#onAbilityDelete.bind(this));
        html.find(".ability-use").click(this.#onAbilityUse.bind(this));

        html.find(".cooldown-decrement").click(this.#onCooldownAction.bind(this));

        html.find(".resource-increment").click(this.#onResourceInccrement.bind(this));
        html.find(".resource-decrement").click(this.#onResourceDecrement.bind(this));
        
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
        const item = this.item.effects.get(listItem.data("itemId"));
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

    /**
     * Handle event when the user opens a gift ability.
     * @param event
     * @private
     */
    #onAbilityOpen(event) {
        event.preventDefault();

        const ability = this.#getItemFromListEvent(event);
        ability.sheet.render(true);
    }

    async #onAbilityUse(event) {
        event.preventDefault();
        const ability = this.#getItemFromListEvent(event);

        await ability.abilityToChat()
        const cooldown = ability.system.cooldown;
        if ( !(cooldown.max && cooldown.max > 0) ) return;
        ability.update({
            "system.cooldown.remaining": cooldown.max
        })
    }

    #onCooldownAction(event) {
        event.preventDefault();
        const ability = this.#getItemFromListEvent(event);
        const cooldown = ability.system.cooldown;

        const updates = {};
        if (cooldown.remaining > 0) {
            updates["system.cooldown.remaining"] = Math.max(0, cooldown.remaining - 1);
        }
        else if (cooldown.max > 0) {
            updates["system.cooldown.remaining"] = cooldown.max;
        }
        ability.update(updates)
        
    }

    #onResourceInccrement(event) {
        event.preventDefault();
        const ability = this.#getItemFromListEvent(event);
        const resource = ability.system.resource;
        if (resource.remaining == null) return;

        let newValue
        if (resource.max) {
            newValue = Math.min(resource.max, resource.remaining + 1)
        }
        else {
            newValue = resource.remaining + 1
        }
        ability.update({
            "system.resource.remaining": newValue
        })
    }
    #onResourceDecrement(event) {
        event.preventDefault();
        const ability = this.#getItemFromListEvent(event);
        const resource = ability.system.resource;
        if (resource.remaining == null) return;

        ability.update({
            "system.resource.remaining": Math.max(0, resource.remaining - 1)
        })
    }

    async #populateAbilities(context) {
        this.#Abilities = []
        for (let effect of context.effects) {
            if (effect.type == "giftAbility") {
                console.log("effect.system",effect.name,effect.system)
                effect.enrichedName =
                    await TextEditor.enrichHTML(effect.name, {
                    secrets: this.document.isOwner,
                    async: true
                });
                effect.enrichedDescription =
                    await TextEditor.enrichHTML(effect.system.description, {
                    secrets: this.document.isOwner,
                    async: true
                });
                this.#Abilities.push(effect);
            }
        }

        context.abilities = this.#Abilities;
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
