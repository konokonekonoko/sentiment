// import { jqueryHTMLhandler } from "../chat.mjs";
import { ListSortValueIncrement } from "../enums.mjs";

// temporary implementation until damage-automation is merged
function jqueryHTMLhandler(html) {
    if (html && html.jquery) {
        return html[0];
    } else {
        return html;
    }
}

export default class GiftSheet extends ItemSheet {

    /** @inheritdoc */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["sentiment", "sheet", "gift"],
            template: "systems/sentiment/templates/gift-sheet.html",
            dragDrop: [
                { dragSelector: ".ability-list .ability", dropSelector: null },
            ],
            width: 600,
            height: 600
        });
    }

    #Abilities = []
    #scrollPos

    /** @inheritdoc */
    _onDragStart(event) {
        super._onDragStart(event);

        const draggedAbilityHtml = event.target.closest(".ability");
        if (draggedAbilityHtml === null) {
            return;
        }

        const itemId = draggedAbilityHtml.dataset["itemId"];

        
        const dragData = {
            droppedId: itemId,
            // Data required to allow foundry to create a `toggleDocumentSheet` macro
            // when drag-dropping AE onto hotbar.
            // Consider making it use the ability instead in future?
            type: "ActiveEffect",
            uuid: draggedAbilityHtml.dataset["itemUuid"]
            
        };
        event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
    }

    /** @inheritdoc */
    _onDrop(event) {
        const abilityListContainerHtml = event.target.closest(".ability-list");

        let droppedAbilityId;
        let data = {}
        try {
            data = JSON.parse(event.dataTransfer.getData("text/plain"));
            droppedAbilityId = data.droppedId;
        } catch (err) { }

        if (!droppedAbilityId) {
            return super._onDrop(event);
        }
        if (!this.item.effects.get(droppedAbilityId)) {
            return this.#abilityFromDropData(data);
        }

        const abilityDroppedUponId = event.target.closest(".ability")?.dataset["itemId"];
        this.#handleAbilityDroppedOnList(droppedAbilityId, abilityDroppedUponId, abilityListContainerHtml);
    }

    /**
    * React to an ability being dropped on a gift sheet, rearranging the the destination list or cloning the gift if it was not already
    * present in the destination.
    * @param droppedAbilityId
    * @param abilityDroppedUponId
    * @private
    */
    async #handleAbilityDroppedOnList(droppedAbilityId, abilityDroppedUponId) {
        if (droppedAbilityId === abilityDroppedUponId) {
            return;
        }
    
        const droppedAbility = this.item.effects.get(droppedAbilityId);
        if (!droppedAbility) {
            throw new Error("Dropped ability ID not found among the item's effects.");
        }
    
        const abilityDroppedUpon = this.object.effects.get(abilityDroppedUponId);
        if (!abilityDroppedUpon) {
            throw new Error("Dropped on ability ID not found among the item's effects.");
        }
    
        const newOrder = [...this.#Abilities];
        if (newOrder.length === 0) return;
    
        const sourceIndex = newOrder.indexOf(droppedAbility);
        const targetIndex = newOrder.indexOf(abilityDroppedUpon);
        if (sourceIndex < 0 || targetIndex < 0) return;
    
        const [element] = newOrder.splice(sourceIndex, 1);
        newOrder.splice(targetIndex, 0, element);
    
        // Overwrite sort values for persistence
        const updates = newOrder.map((ability, i) => ({
            _id: ability.id,
            system: { sort: ListSortValueIncrement * i }
        }));
    
        await this.item.updateEmbeddedDocuments("ActiveEffect", updates);
    }

    /**
    * Handle cloning of an ability from drop data on a new sheet.
    * @param data
    * @private
    */
    async #abilityFromDropData(data) {
        const ability = await fromUuid(data.uuid);
        if (!ability) return;

        const clone = ability.clone({}, {keepId: false});
        await this.item.createEmbeddedDocuments("ActiveEffect", [clone.toObject()]);
    }
    
    
    /** @inheritdoc */
    async getData(options) {
        const context = await super.getData(options);

        context.effects = this.item.effects

        await this.#populateDescription(context);
        await this.#populateAbilities(context);

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
     * Handle event when the user adds a gift ability.
     * @param event
     * @private
     */
    async #onAbilityAdd(event) {
        event.preventDefault();

        const list = this.#Abilities;
        const sortValue = list.length > 0
            ? list[list.length - 1].system.sort + ListSortValueIncrement 
            : 0;
        
        const effectData = {
            name: "New Ability",
            type: "giftAbility",
            system: {
                sort: sortValue
            }
        };

        return await ActiveEffect.create(effectData, { parent: this.item });
    }

    /**
     * Handle event when the user deletes a gift ability.
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

    /**
     * Handle event when the user clicks on a gift ability's cooldown button and decrement the cooldown if it is 
     * already active. Otherwise, start the cooldown.
     * @param event
     * @private
     */
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

    /**
     * Handle event when the user clicks on a resource's increment to increment the resource's count with proper clamping.
     * @param event
     * @private
     */
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

    /**
     * Handle event when the user clicks on a resource's decrement to decrement the resource's count with proper clamping.
     * @param event
     * @private
     */
    #onResourceDecrement(event) {
        event.preventDefault();
        const ability = this.#getItemFromListEvent(event);
        const resource = ability.system.resource;
        if (resource.remaining == null) return;

        ability.update({
            "system.resource.remaining": Math.max(0, resource.remaining - 1)
        })
    }

    /**
    * Iterate all owned active effects and embed a collection containing only the abilities into the context for easy access.
    * Additionally embeds enriched versions of the ability's text fields within the ability.
    * @param context
    * @private
    */
    async #populateAbilities(context) {
        this.#Abilities = []
        for (let effect of context.effects) {
            if (effect.type == "giftAbility") {
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

        context.abilities = this.#Abilities.sort((a,b) =>
            (a.system.sort ?? 10000) -
            (b.system.sort ?? 10000)
        );
    }

    /**
    * Transform the raw description property into enriched HTML and embed it into the context for easy access.
    * @param context
    * @private
    */
    async #populateDescription(context) {
        context.descriptionHTML = await CONFIG.Sentiment.Enricher.enrich(
            context.data.system.description,
            this?.object?.uuid ?? "unknown-object", {
                secrets: this.document.isOwner,
                async: true
        });
    } 

    /** @inheritdoc */
    async _render(force = false, options = {}) {
        let element = jqueryHTMLhandler(this.element);
        this.#scrollPos = element?.querySelector(".sheet-body")?.scrollTop ?? 0;
        await super._render(force, options);
        element = jqueryHTMLhandler(this.element);
        if (element && this.#scrollPos > 0) {
            element.querySelector(".sheet-body").scrollTop = this.#scrollPos;
        }
    }
}
