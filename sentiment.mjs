import {
    AttributeData,
    Attribute
} from "./documents/attribute.mjs";
import AttributeSheet from "./sheets/attribute-sheet.mjs";

import { GiftData } from "./documents/gift.mjs";
import GiftSheet from "./sheets/gift-sheet.mjs";

import { GiftAbilityData, SentimentActiveEffect } from "./documents/active-effect.mjs";
import GiftAbilitySheet from "./sheets/gift-ability-sheet.mjs"

import {
    AttributeIdNoSwing,
    CharacterData,
    Character
} from "./documents/character.mjs";
import CharacterSheet from "./sheets/character-sheet.mjs";

import { CustomRollData } from "./documents/custom-roll.mjs";
import CustomRollSheet from "./sheets/custom-roll-sheet.mjs";

import EnricherConfigs from "./enricher-configs/index.mjs";
import { SentimentEnricher } from "./enricher.mjs";

import {
    RollTypes,
    AttributeStatus,
    AttributeStatusStrings
} from "./enums.mjs"

import tryCreateCharacterMacro from "./macro.mjs"

import * as Chat from "./chat.mjs";


Hooks.once("init", function () {
    console.log(`Initializing Sentiment System`); 

    CONFIG.Item.dataModels.attribute = AttributeData;
    CONFIG.Item.dataModels.gift = GiftData;
    CONFIG.Item.dataModels.customRoll = CustomRollData;
    CONFIG.Actor.dataModels.character = CharacterData;
    CONFIG.Actor.documentClass = Character;

    CONFIG.ActiveEffect.dataModels.giftAbility = GiftAbilityData;
    CONFIG.ActiveEffect.documentClass = SentimentActiveEffect;

    CONFIG.Sentiment = {
        RollTypes,
        AttributeStatus,
        AttributeStatusStrings,
        AttributeIdNoSwing,
    };

    // TODO once system settings are merged in, add toggles for every
    // pattern set found in `EnricherConfigs`
    CONFIG.Sentiment.EnricherConfigs = EnricherConfigs;
    CONFIG.Sentiment.Enricher = new SentimentEnricher();

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("sentiment", AttributeSheet, {
        types: ["attribute"],
        makeDefault: true,
        label: "Attribute Sheet"
    });
    Items.registerSheet("sentiment", GiftSheet, {
        types: ["gift"],
        makeDefault: true,
        label: "Gift Sheet"
    });
    Items.registerSheet("sentiment", CustomRollSheet, {
        types: ["customRoll"],
        makeDefault: true,
        label: "Custom Roll Sheet"
    });

    DocumentSheetConfig.unregisterSheet(ActiveEffect, "core", ActiveEffectConfig);
    DocumentSheetConfig.registerSheet(ActiveEffect,"sentiment", GiftAbilitySheet, {
        types: ["giftAbility"],
        makeDefault: true,
        label: "Gift Ability Sheet"
    });

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("sentiment", CharacterSheet, {
        types: ["character"],
        makeDefault: true,
        label: "Character Sheet"
    });

    Attribute.RegisterHandlebarsHelpers();
    Character.RegisterHandlebarsHelpers();
    CharacterSheet.RegisterHandlebarsHelpers();

    loadTemplates([
        "systems/sentiment/templates/partials/gift-list.html",
        "systems/sentiment/templates/partials/swing.html"
    ]);
});

Hooks.on("hotbarDrop", (bar, data, slot) => tryCreateCharacterMacro(data, slot));

// chat functionality
Hooks.on("renderChatLog", (app, html, data) => Chat.addChatListeners(html));
Hooks.on("renderChatMessage", (app, html, data) => Chat.onRenderChatMessage(app, html, data));
