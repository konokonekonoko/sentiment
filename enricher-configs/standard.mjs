// Patterns are written in order of highest to lowest priority. Priority
// can optionally be overwritten by adding a "priority" property to the pattern's
// object. Default priority is 0.
// Patterns will be sorted according to their priority value.
//
// Lower priority patterns might get overwritten by higher priority ones.
// Generally, you want "large" matching groups to have a high priority.
//
// A pattern's options object can have the following values:
// {
//   classes {arr}      REQUIRED Classes to be added for styling
//   flags {str}        REQUIRED Regex flags for the pattern
//   priority {int}     OPTIONAL Priority value.
//   printGroupNo {int} OPTIONAL Which matching group should be displayed.
//                               Default 0 for whole match.
//   strFormat {obj}    OPTIONAL String formatting operations to be applied
//                               to the match. No properties are required.
//                       {
//                         wrapper {arr} Array of length 2. Index 0 will be
//                                       added to front of match, index 1 to
//                                       end of match.
//                         case {str}    Change the case to one of "title" ->
//                                       title case, "lower" -> lower case or
//                                       "upper" -> upper case.
//                       }
//   tooltip {html}     OPTIONAL This text will appear when you hover over the
//                      matched element.
// }

const patterns = [
    [
        // Anything wrapped in {{{ }}} will be excluded from ALL enriching.
        /\{\{\{([\s\S]*?)\}\}\}/, {
            special: "escape-group",
            classes: ["escape"],
            flags: "gis",
            printGroupNo: 1,
        }
    ],
    [
        /\d+d\d+(k[hl]\d+)?/, {
            classes: ["dicenotation"],
            flags: "gi",
        }
    ],
    
    // known issue: for some reason that still eludes me after 3 hours of debugging,
    // this rule and the one below are applied one more time every time the enriched text
    // is saved with changes. Resets to the normal amount on reload.
    // replaceParent: true currenty keeps the tag spaghetti at bay, and keeps the styling
    // consistent for now, but I need to figure out why it does that.
    [
        /[-\+]? ?\d+(\.\d+)?\%?/, {
            classes: ["numbers"],
            flags: "g",
            priority: -999,
        }
    ],
    [
        /\+ ?the level of this gift/, {
            classes: ["numbers"],
            flags: "gi",
        }
    ],

];

const output = {
    displayName: "Standard Syntax Highlighting",
    patterns,
};
export default output;
