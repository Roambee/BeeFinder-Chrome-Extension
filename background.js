chrome.runtime.onInstalled.addListener(() => {
    console.log("onInstalled");

    let history = []
    chrome.storage.sync.set({history: history});

    chrome.storage.sync.set({dashboard: false});

    chrome.storage.sync.set({back: []});

    let firmwares = [{name:"RB3AUTF600", active:true}, {name:"RB3AGTF601", active:true}, {name:"RB3TUTF602", active:true}, {name:"RB3TGTF603", active:true}, {name:"RB3FUTF605", active:true}, {name:"RB3FGTF606", active:true}]
    chrome.storage.sync.set({firmwares: firmwares});
    chrome.storage.sync.get(['history', 'dashboard', 'firmwares'], function (result) {
        console.log(result.history);
        console.log(result.dashboard);
        console.log(result.firmwares);
    })

    let templates = []
    const templateDefault = {
        name : "Default",

        modeCheck : true,
        prfCheck : true,
        tmpCheck : true,
        prsCheck : true,
        humCheck : true,
        ambCheck : false,
        shkCheck : false,
        bleCheck : true,

        mode : "NM",
        prf : 3600,
        tmp : true,
        prs : true,
        hum : true,
        ble : false
    }
    const templateAmbShk = {
        name : "Amb/Shk",

        modeCheck : true,
        prfCheck : true,
        tmpCheck : true,
        prsCheck : true,
        humCheck : true,
        ambCheck : true,
        shkCheck : true,
        bleCheck : true,

        mode : "NM",
        prf : 3600,
        tmp : true,
        prs : true,
        hum : true,
        amb : true,
        shk : true,
        ble : false
    }
    const templatePharma = {
        name : "Pharma",

        modeCheck : true,
        prfCheck : true,
        tmpCheck : true,
        prsCheck : true,
        humCheck : true,
        ambCheck : true,
        shkCheck : false,
        bleCheck : true,

        mode : "OM",
        prf : 7200,
        tmp : true,
        prs : true,
        hum : true,
        amb : true,
        ble : false
    }
    const templateVaccine = {
        name : "Vaccine",

        modeCheck : true,
        prfCheck : true,
        tmpCheck : true,
        prsCheck : true,
        humCheck : true,
        ambCheck : false,
        shkCheck : false,
        bleCheck : true,

        mode : "OM",
        prf : 3600,
        tmp : true,
        prs : true,
        hum : true,
        ble : false
    }
    templates[0] = templateDefault;
    templates[1] = templateAmbShk;
    templates[2] = templatePharma;
    templates[3] = templateVaccine;
    chrome.storage.sync.set({templates: templates});
    chrome.storage.sync.set({selectedTemplate: "Default"});

    chrome.tabs.create({
        url: 'options.html',
        active: true
    });

});

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.request === "history"){
            chrome.tabs.query({}, function(tabs) {
                sendResponse({history: history});
            })
        }
        if (request.message === "add") {
            chrome.tabs.create({
                url: 'options.html#template',
                active: true
            });
        }
    }
);


chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    if (changeInfo.status == 'complete') {
        chrome.storage.sync.get(["dashboard"], function(result){
            if (result.dashboard) {
                if (tab.url.startsWith("https://portal.roambee.com/#bees") || tab.url.startsWith("https://portal.roambee.de/#bees")) {
                    console.log("Classig portal page loaded");
                    chrome.scripting.executeScript({
                      target: {tabId: tab.id},
                      files: ['dashboard.js']
                    });
                }
            }
        })
    }
})
