(async () => {

    let debugP = document.getElementById("debug-message");
    function debug(log) {
        debugP.hidden = false;
        debugP.innerText = log;
    }

    function displayOpacity(opacity) {
        opacityLabel.innerHTML = "Opacity : " + (opacity == 1.1 ? "On top" : opacity);
    }

    function displayReadingLevel(level) {
        readingLevelLabel.innerHTML = "Reading mode level : " + (level == 0 ? "Diasbled" : level)
    }

    async function sendToTabs(query, msg) {
        const tabs = await chrome.tabs.query(query);
        for(const tab of tabs) {
            if(tab.url.slice(0,4) == "http") {
                let r = await chrome.tabs.sendMessage(tab.id, msg);
            }
        }
    }

    function sendToActualTab(msg) {
        sendToTabs({currentWindow: true, active: true}, msg);
    }

    let disabled = document.getElementById("disabled");
    disabled.onclick = async (evt) => {
        sendToActualTab({disabled: evt.target.checked});
    };

    let opacityRange = document.getElementById("opacity-range");
    let opacityLabel = document.getElementById("opacity-label");
    opacityRange.oninput = (evt) => {
        displayOpacity(evt.target.value/10);
        sendToActualTab({opacity: evt.target.value});
    }

    let readingLevelLabel = document.getElementById("reading-level-label");
    let readingLevelRange = document.getElementById("reading-level-range");
    readingLevelRange.oninput = (evt) => {
        displayReadingLevel(evt.target.value);
        sendToActualTab({read: evt.target.value});
    };

    chrome.storage.local.get(["opacity", "read", "disabled"]).then((result) => {
        displayOpacity(result.opacity / 10);
        opacityRange.value = result.opacity;

        displayReadingLevel(result.read);
        readingLevelRange.value = result.read;

        disabled.checked = result.disabled;
    });
    
    window.addEventListener("blur", async function() {
        let msg = {
            opacity: opacityRange.value,
            read: readingLevelRange.value,
            disabled: disabled.checked
        };

        sendToTabs({}, msg);
        chrome.storage.local.set(msg).then(() => {console.log("value is set")});
        // Should be after local.set, for reading the new values, not the old
        chrome.runtime.sendMessage({reloadParams: true})

        return null;
    });
})();