(async () => {
    const baseImgStyle = "position: fixed; left: 0; top: 0; width: 100vw; pointer-events: none;";
    const transparentBg = "background-color: transparent !important";

    let img;
    // Fetch the parameters from the background script
    // params.opacity and request.opacity are always in the 1-11 range
    let params = (await chrome.runtime.sendMessage({getBackground: true})).params;
    const dev = false;

    img = document.createElement("img");
    img.id = "bgImg";
    img.alt = "Background image"; // Some websites blur images that don't have alternative description
    img.style.cssText = baseImgStyle;
    img.style.display = "none";
    img.src = await chrome.runtime.getURL("insert_your_backgrounds_here/1.png");

    async function updateBgStyle(img, params) {
        if(dev) {
            console.log("Params before change style :")
            console.log(params);
        }
        
        // If the service worker is inactive
        if(!params) {
            await chrome.runtime.sendMessage({}); // Wake up it
            params = (await chrome.runtime.sendMessage({getBackground: true})).params;
        }

        img.style.cssText = `
        ${baseImgStyle};
        z-index: ${params.opacity == 11 ? 10 : -1};
        opacity: ${params.opacity/10}; 
        filter: blur(${params.read**1.15}px) contrast(${1-params.read*0.03});
        display: ${params.disabled ? "none" : "inherit"}`;
    }

    function getParentElement() {
        const parentElementPriority = [
            () => (document.querySelector("[role=main]")),
            () => (document.getElementById("root")),
            () => (document.getElementById("content")),
            () => (document.getElementsByClassName("content")[0]),
            () => (document.getElementById("layoutMainWrapper")),
            () => (document.getElementById("layoutMain")),
            () => (document.querySelector("ol[role='list'][tabindex='0']")), //For discord
            () => (document.getElementsByTagName("main")[0]),
            () => (document.getElementById("main")),
            () => (document.getElementsByClassName("main")[0]),
            () => (document.getElementsByClassName("main-wrapper")[0]),
            () => (document.getElementById("app-mount")),
            () => (document.getElementById("app-root")),
            () => (document.getElementById("app")),
            () => (document.getElementsByClassName("application-main")[0]),
            () => (document.getElementsByClassName("main-container")[0]),
	    () => (document.getElementsByClassName("Layout-main")[0]),
            () => (document.getElementsByTagName("h1")[0]?.parentNode),
            () => (document.getElementById("container")),
            () => (document.getElementsByClassName("container")[0]),
            () => (document.getElementsByClassName("hero")[0]),
            () => (document.getElementsByTagName("section")[0]),
            () => (document.body)
        ];
        let i = 0;
        while(parentElementPriority[i]() == undefined) {i++}
        return parent = parentElementPriority[i]();
    }

    function makeParentsTransparent(ele) {
        if(ele == document.body) {return;}
        ele.style.cssText += transparentBg;
        makeParentsTransparent(ele.parentNode);
    }

    async function main () {
        // Find the best element to put <img> in 
        let imgParent = getParentElement();

        // Make all parents' backgrounds transparent
        makeParentsTransparent(imgParent);
        if(imgParent.childNodes[0] != undefined && imgParent.childNodes[0].style != undefined) {
            imgParent.childNodes[0].style.cssText += transparentBg;
        }

        updateBgStyle(img, params);
        
        imgParent.prepend(img);

        if(dev) {
            console.log("Succesfully added the background.");
            console.log(`${imgParent.tagName}.${imgParent.classList}#${imgParent.id}`)
            console.log(img);
            console.log(`
            Opacity : ${params.opacity};
            Deformed: ${params.read};
            Hidden  : ${params.disabled};`);
        }
    }
    // With SetTimeout the parent is found when the frontend librairy has been loaded
    setTimeout(main, 250);
    setTimeout(main, 2000);
    setTimeout(main, 7500);

    // Update the style when the parameters has been changed
    chrome.runtime.onMessage.addListener(
		function (request) {
            console.log(request);
            
            for(const attr of ["opacity", "read", "disabled"]) {
                if(request[attr] != undefined) 
                    params[attr] = request[attr]
            }

            updateBgStyle(img, params);
        }
    );
})();
