(async() => {
    let params;
    async function loadParams() {
        console.log("RELOADED");
        params = await chrome.storage.local.get(["opacity", "read", "disabled"]);

        // If the user didn't set his parameters, returns default parameters
        params.opacity  =  params.opacity  ? params.opacity  : 6;
        params.read     =  params.read     ? params.read     : 2;
        params.disabled =  params.disabled ? params.disabled : 0;
    }

    loadParams();

    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            console.log(`Request from ${sender.tab?.url}`);
            if(request.getBackground) {
                console.log(params);
                sendResponse({params: params});
            }

            if(request.reloadParams)
                loadParams();
        }
    );
})()