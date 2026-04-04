export class SentimentEnricher {
    constructor() {
        console.log("Sentiment Enricher Registered");
    }

    static #generatedPatterns = null;

    generatePatterns() {
        // Gather pattern lists from environment variable rather than the import.
        // This should allow modules to add their own Pattern Lists to be processed
        // simply by extending this variable.
        const patternLists = CONFIG.Sentiment.EnricherConfigs;

        const lowPriorityPatterns = [];
        const highPriorityPatterns = [];

        for (const [name, list] of Object.entries(patternLists)) {
            // TODO check if list is enabled once system settings have been merged in
            lowPriorityPatterns.push(...list.lowPriorityPatterns);
            highPriorityPatterns.push(...list.highPriorityPatterns);
        }

        // sort patterns by priority.
        // this is probably expensive, but since we're only running it once for every
        // text thanks to the hash check in `this.enrich`, it should be fine.
        const sortedPatterns = [
            ...this.#sortByPriority(highPriorityPatterns),
            ...this.#sortByPriority(lowPriorityPatterns),
        ];

        const assembledPatterns = [];
        for (const [pattern, options] of sortedPatterns) {
            assembledPatterns.push(this.enrichNormal(pattern, options));
        }
        return assembledPatterns;
    }

    async enrich(text, uuid = "", textEditorOptions = {}) {
        if (!text) return text;

        // check if text has already been enriched before.
        // texts per uuid to minimize hash collisions.
        const hash = uuid + ":" + this.fnv1a52fast(text);
        window.SentimentEnrichedTexts ??= {}; // ensure property exists
        if (window.SentimentEnrichedTexts.hasOwnProperty(hash))
            return window.SentimentEnrichedTexts[hash];

        const re = new RegExp(/^\s*$/gi);
        if (re.test(text)) return text; // don't enrich empty text

        const enricherConfig = this.generatePatterns();
        const oldEnrichers = CONFIG?.TextEditor?.enrichers ?? [];
        CONFIG.TextEditor.enrichers.push(...enricherConfig);
        const enrichedText = await TextEditor.enrichHTML(
            text,
            textEditorOptions
        );

        // restore previous enricher state
        CONFIG.TextEditor.enrichers = oldEnrichers;

        // add enriched text and hash to cache
        window.SentimentEnrichedTexts[hash] = enrichedText;
        return enrichedText;
    }

    enrichNormal(pattern, enrOptions, textEditorOptions) {
        const isolatedPattern = new RegExp(
            `${pattern.source}`,
            enrOptions.flags
        );
        return {
            pattern: isolatedPattern,
            enricher: async (match, textEditorOptions) => {
                const printGroupNo = enrOptions?.printGroupNo ?? 0;
                let thisMatch = match[printGroupNo];
                let element = document.createElement("span");

                // Tooltips
                if (enrOptions.tooltip) {
                    element.setAttribute(
                        "data-tooltip",
                        this.#htmlSanitize(enrOptions.tooltip)
                    );
                }

                // String Formatting
                if (enrOptions.hasOwnProperty("strFormat")) {
                    thisMatch = this.#strFormat(thisMatch, enrOptions);
                }

                element.innerHTML = thisMatch;
                element.className +=
                    "SentimentEnricher " +
                    enrOptions.classes.map((word) => "er-" + word).join(" ");
                return element;
            },
            replaceParent: false,
        };
    }

    #sortByPriority(arr) {
        return arr.sort((a, b) => {
            const objA = a[1];
            const objB = b[1];
            const priA = objA?.priority ?? null;
            const priB = objB?.priority ?? null;

            const getCategory = (p) => {
                if (p === null) return 0; // middle (no priority)
                if (p > 0) return 1; // positive -> top
                return -1; // negative -> bottom
            };

            const catA = getCategory(priA);
            const catB = getCategory(priB);

            // sort by category: positive > none > negative
            if (catA !== catB) {
                return catB - catA;
            }

            // same category -> sort within the group
            // if both no priority, leave this order
            if (priA === null && priB === null) {
                return 0; // keep original relative order
            }

            // both have priority -> sort by value descending
            return priB - priA;
        });
    }

    #htmlSanitize(string) {
        return string
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // various string formatting operations for the match
    #strFormat(string, options) {
        const fmt = options.strFormat;
        if (fmt.hasOwnProperty("case")) {
            switch (fmt.case) {
                case "title":
                    string = string
                        .toLowerCase()
                        .split(" ")
                        .map(
                            (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ");
                    break;
                case "upper":
                    break;
                case "lower":
                    break;
            }
        }
        if (fmt.hasOwnProperty("wrapper") && fmt.wrapper.length === 2) {
            string = `${fmt.wrapper[0]}${string}${fmt.wrapper[1]}`;
        }

        return string;
    }

    fnv1a52fast(str) {
        // https://github.com/tjwebb/fnv-plus
        // MIT License
		var i,l=str.length-3,t0=0,v0=0x2325,t1=0,v1=0x8422,t2=0,v2=0x9ce4,t3=0,v3=0xcbf2;
		for (i = 0; i < l;) {
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
		}
		while(i<l+3){
			v0^=str.charCodeAt(i++);
			t0=v0*435;t1=v1*435;t2=v2*435;t3=v3*435;
			t2+=v0<<8;t3+=v1<<8;
			t1+=t0>>>16;v0=t0&65535;t2+=t1>>>16;v1=t1&65535;v3=(t3+(t2>>>16))&65535;v2=t2&65535;
		}
		return (v3&15) * 281474976710656 + v2 * 4294967296 + v1 * 65536 + (v0^(v3>>4));
    }
}
