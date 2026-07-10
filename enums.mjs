// Enum type for attribute states.
export const AttributeStatus = Object.freeze({
    Normal: 0,
    LockedOut: 1,
    Wounded: 2
});

// Enum type for attribute states.
export const GiftEquipStatus = Object.freeze({
    Unequipped: 0,
    Equipped: 1,
    Primary: 2
});

// Enum type for Gift Ability unlock state.
export const GiftAbilityUnlocked = Object.freeze({
    Locked: 0,
    Unlocked: 1
});

// The game's core roll types and their associated strings.
export const RollTypes = Object.freeze({
    RollToDo: {
        DisplayName: "Roll To Do",
        FunctionName: "rollToDo"
    },
    RollToDye: {
        DisplayName: "Roll To Dye",
        FunctionName: "rollToDye"
    },
    RecoveryRoll: {
        DisplayName: "Recovery Roll",
        FunctionName: "recoveryRoll"
    }
});

export const AttributeStatusStrings = new Map([
    [AttributeStatus.Normal, "Normal"],
    [AttributeStatus.LockedOut, "Locked Out"],
    [AttributeStatus.Wounded, "Wounded"]
]);

// Function to quickly turn states into objects that can be used by
// the select options helper.
export function reverseKeyValue(obj) {
    return Object.entries(obj)
        .reduce((acc, [key, val]) => {
            acc[val] = key;
            return acc;
        }, {});
}

export const ListSortValueIncrement = 100000;