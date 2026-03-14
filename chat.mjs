// for backwards compatibility with <= v12
function jqueryHTMLhandler(html) {
    if (html && html.jquery) {
        return html[0];
    } else {
        return html;
    }
}

async function _onAction(event) {
    event.preventDefault();
    const button = event.delegateTarget;
    const data = button.dataset;
    const action = data.action;

    const message = button?.closest("li.chat-message");
    const messageId = message.dataset.messageId || "";
    const messageApp = game.messages.get(messageId) || {};

    console.log(messageApp);

    const selectedActor = window.selectedActor();

    let triggeringRoll;
    switch (action) {
        case "roll-to-dye":
            if (!selectedActor) {
                ui.notifications.warn("You need to select a token to do this!");
                return false;
            }
            triggeringRoll = messageApp.getFlag("sentiment", "Roll to Do");
            await selectedActor.rollToDye({ triggeringRoll });
            break;
        case "roll-custom":
            // TODO need handler to select a custom roll
            //await selectedActor.executeCustomRoll(customRollId)
            break;
        case "take-damage-menu":
            if (!selectedActor) {
                ui.notifications.warn("You need to select a token to do this!");
                return false;
            }
            handleTakeDamagePrompt(selectedActor,data.value)
            break;
        default:
            console.warn(`Unknown Action in Chat Message ${messageId}: '${action}'`)
            return false;
    }
    return true;
}

async function handleTakeDamagePrompt(actor,damageString) {
    const multiplier = await actor.renderDamageDialog(damageString)
    actor.takeDamage({damageString, multiplier, toChat: true})
}


export function addChatListeners(html) {
    html = jqueryHTMLhandler(html);

    // great place to add a mutationObserver if it's ever needed later.

    // add onAction listener
    if (!(html instanceof HTMLElement)) return;
    html.addEventListener("click", function (event) {
        const target = event.target.closest("[data-action]");
        if (!target || !html.contains(target)) return;
        event.delegateTarget = target;
        _onAction(event);
    });
}


export function onRenderChatMessage(app, html, data) {
    html = jqueryHTMLhandler(html);
    _hideChatElement(app, html, data);
}

/**
 * add `data-visibleto="{actor.uuid}:{actor.type}"` to a chat element to make it visible only to the GM
 * and the owner of `actor`. `actor.type` is optional.
 *
 * @param {HTMLElement} html
 */
async function _hideChatElement(_, html) {
    const sentimentChat = html.querySelector(".sentiment");
    if (!sentimentChat) return;

    let hideElement = sentimentChat.querySelectorAll("[data-visibleto]");

    if (hideElement == null) {
        return;
    }

    // hide full chat bubble
    hideElement?.forEach(async (element) => {
        const [uuid, type] = element.dataset.visibleto.split(":");
        let visibleTo = await fromUuid(uuid);

        if (uuid === "GM-ONLY") {
            visibleTo = "GM-ONLY";
        }

        // to hide the entire chat message
        if (element.dataset?.hideall) {
            element = sentimentChat.closest("li.chat-message.message");
        }

        
        if (visibleTo === "GM-ONLY" && !game.user.isGM) {
            element.style.display = "none";
            return;
        } else if (visibleTo && !visibleTo?.isOwner && !game.user.isGM) {
            element.style.display = "none";
        }
        if (type && visibleTo?.type !== type) {
            element.style.display = "none";
        }
    });
}
