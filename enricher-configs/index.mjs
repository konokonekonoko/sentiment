import standard from "./standard.mjs";
import markdown from "./markdown.mjs";
import en from "./en.mjs";

// Collect all system internal provided pattern files in one export for easier handling.
// Highest to lowest priority
const patterns = {
    standard,
    markdown,
    en,
}
export default patterns