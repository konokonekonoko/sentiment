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
        /LOCK(ING|ED)?( (OUT|IN(TO)?))?/, {
            classes: ["lock"],
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
        /ATTRIBUTES?/, {
            classes: ["attribute"],
            flags: "gi",
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
