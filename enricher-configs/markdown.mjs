const lowPriorityPatterns = [];

const highPriorityPatterns = [
    [
        /\*\*\*([^*]+?)\*\*\*/, {
            classes: ["bold", "italics"],
            flags: "g",
            printGroupNo: 1,
            priority: 10,
        },
    ],
    [
        /(?<!\*)\*\*([^*]+?)\*\*(?!\*)/, {
            classes: ["bold"],
            flags: "g",
            printGroupNo: 1,
            priority: 10,
        },
    ],
    [
        /(?<!\*)\*([^*]+?)\*(?!\*)/, {
            classes: ["italics"],
            flags: "g",
            printGroupNo: 1,
            priority: 10,
        },
    ],
    [
        /^(?<!#)# (.+)/, {
            classes: ["heading"],
            flags: "g",
            printGroupNo: 1,
            strFormat: {
                wrapper: ["<h1>", "</h1>"],
            },
            priority: 10,
        },
    ],
    [
        /^(?<!#)## (.+)/, {
            classes: ["heading"],
            flags: "g",
            printGroupNo: 1,
            strFormat: {
                wrapper: ["<h2>", "</h2>"],
            },
            priority: 10,
        },
    ],
    [
        /^(?<!#)### (.+)/, {
            classes: ["heading"],
            flags: "g",
            printGroupNo: 1,
            strFormat: {
                wrapper: ["<h3>", "</h3>"],
            },
            priority: 10,
        },
    ],
    [
        /^####+ (.+)/, {
            classes: ["heading"],
            flags: "g",
            printGroupNo: 1,
            strFormat: {
                wrapper: ["<h4>", "</h4>"],
            },
            priority: 10,
        },
    ],
    [
        /^\s*([\*-]) +(?=\w)/, {
            classes: ["list"],
            flags: "g",
            priority: 10,
        },
    ],
];

const patterns = {
    displayName: "Basic Markdown Highlighting",
    lowPriorityPatterns,
    highPriorityPatterns,
};
export default patterns;
