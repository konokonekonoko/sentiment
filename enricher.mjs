export class SentimentEnricher {
    constructor() {
        console.log("Sentiment Enricher Registered");
    }

    #generatePatterns() {
        // Gather pattern lists from environment variable rather than the import.
        // This should allow modules to add their own Pattern Lists to be processed
        // simply by extending this variable.
        const patternLists = CONFIG.Sentiment.EnricherConfigs;

        const patterns = new Set();
        const prePostProcessors = new Set();

        for (const [name, list] of Object.entries(patternLists)) {
            if (
                !list.hasOwnProperty("patterns") ||
                !list.hasOwnProperty("displayName")
            ) {
                console.error(
                    `Sentiment Enricher Extension "${name}" does not `+
                    `provide a pattern list in the expected format:`,
                    list
                );
                continue;
            }

            // TODO check if list is enabled once system settings have been merged in
            list.patterns.forEach(p => {
                patterns.add(p);
            });
            
            if (!list.hasOwnProperty("prePostProcessors")) continue;
            list.prePostProcessors.forEach(p => {
                prePostProcessors.add(p);
            });

        }

        // sort patterns by priority.
        // this is probably expensive, but since we're only running it once for every
        // text thanks to the hash check in `this.enrich`, it should be fine.
        const sortedPatterns = this.#sortByPriority([...patterns]);
        const sortedPrePostProcessors = this.#sortByPriority([...prePostProcessors]);

        const assembledPatterns = new Set();
        for (const [pattern, options] of sortedPatterns) {
            assembledPatterns.add(this.#buildEnricherPattern(pattern, options));
        }

        return [assembledPatterns, sortedPrePostProcessors];
    }

    async enrich(text, uuid = "", textEditorOptions = {}) {
        if (!text) return text;

        // check if text has already been enriched before.
        // texts per uuid to minimize hash collisions.
        const hash = uuid + ":" + this.fnv1a52fast(text);
        window.SentimentEnrichedTexts ??= {}; // ensure hash cache exists
        if (window.SentimentEnrichedTexts.hasOwnProperty(hash))
            return window.SentimentEnrichedTexts[hash];

        const re = new RegExp(/^\s*$/gi);
        if (re.test(text)) return text; // don't enrich empty text

        const [enricherConfig, specialRules] = this.#generatePatterns();

        // pre-process special rules
        let preProcessOutput
        if (specialRules.length) {
            preProcessOutput = this.#preProcessSpecialRules(text, specialRules);
            text = preProcessOutput.text;
        }

        CONFIG.TextEditor.enrichers.push(...enricherConfig);
        let enrichedText = await TextEditor.enrichHTML(
            text,
            textEditorOptions
        );

        // post-process special rules
        let postProcessedOutput
        if (specialRules.length) {
            postProcessedOutput = this.#postProcessSpecialRules(enrichedText, specialRules, preProcessOutput);
            enrichedText = postProcessedOutput.text;
        }

        // restore previous enricher state
        CONFIG.TextEditor.enrichers = CONFIG.TextEditor.enrichers.filter(e => !enricherConfig.has(e));

        // add enriched text and hash to cache
        window.SentimentEnrichedTexts[hash] = enrichedText;
        return enrichedText;
    }

    #buildEnricherPattern(pattern, enrOptions) {
        return {
            pattern,
            enricher: async (match, _) => {
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
            replaceParent: true,
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
            .replace(/(?<!\\)</g, "&lt;") // -> \< becomes a normal <
            .replace(/(?<!\\)>/g, "&gt;") //    same for \>
            .replace(/\\</g, "<")         //     => \<br\> => <br>
            .replace(/\\>/g, ">")  
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

    #preProcessSpecialRules(text, specialRules) {
        const preProcessOutput = { text }

        // process preprocess options defined in options object
        for (const [pattern, options] of specialRules) {
            if (!options.hasOwnProperty("preProcess")) continue;
            foundry.utils.mergeObject(preProcessOutput,
                options.preProcess({
                    text: preProcessOutput.text,
                    pattern,
                    options
                })
            )
        }
        return preProcessOutput;
    }

    #postProcessSpecialRules(text, specialRules, preProcessOutput) {
        const postProcessOutput = { text, preProcessOutput }
        // process preprocess options defined in options object
        for (const [pattern, options] of specialRules) {
            if (!options.hasOwnProperty("postProcess")) continue;
            foundry.utils.mergeObject(postProcessOutput,
                options.postProcess({
                    text: postProcessOutput.text,
                    pattern,
                    options,
                    preProcessOutput
                })
            )
        }
        return postProcessOutput;
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
