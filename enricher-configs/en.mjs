const lowPriorityPatterns = [
    [
        /(level|lvl?) ?\d+/, {
            classes: ["numbers"],
            flags: "gi",
        },
    ],
    [
        /IGNIT(ED?|ING)/, {
            classes: ["ignite"],
            flags: "g",
            strFormat: {
                case: "title",
            },
        },
    ],
    [
        /LOCK(ING|ED)?( ?OUT)?/, {
            classes: ["lock"],
            flags: "g",
            strFormat: {
                case: "title",
            },
        },
    ],
    [
        /EXHAUST(ED)?/, {
            classes: ["exhaust"],
            flags: "g",
            strFormat: {
                case: "title",
            },
        },
    ],
    [
        /WOUND(ING|ED)?/, {
            classes: ["wound"],
            flags: "g",
            strFormat: {
                case: "title",
            },
        },
    ],
    [
        /AFFINIT(Y|IES)/, {
            classes: ["affinity"],
            flags: "g",
            strFormat: {
                case: "title",
            },
        },
    ],
    [
        /PRIMARY/, {
            classes: ["primary"],
            flags: "g",
            strFormat: {
                case: "title",
            },
        },
    ],
    [
        /LINKS?/, {
            classes: ["link"],
            flags: "g",
            strFormat: {
                case: "title",
            },
        },
    ],
    [
        /ATTRIBUTES?/, {
            classes: ["attribute"],
            flags: "g",
            strFormat: {
                case: "title",
            },
        },
    ],
    [
        /Roll to Do/, {
            classes: ["rolltodo"],
            flags: "g",
        },
    ],
    [
        /Roll to Dye/, {
            classes: ["rolltodye"],
            flags: "g",
        },
    ],
];

const highPriorityPatterns = [];

const patterns = {
    displayName: "English Keywords",
    lowPriorityPatterns,
    highPriorityPatterns,
};
export default patterns;
