window.addEventListener('DOMContentLoaded', async (event) => {

//---------------------- Tabs -------------------------------------
let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
// console.log(tab);

//---------------------- Navbar start -----------------------------
// let menubutton = document.getElementById('menubutton')
// menubutton.click()

let homeDiv = document.getElementById('home')
let moreDiv = document.getElementById('more')
let historyDiv = document.getElementById('history')
homeDiv.style.display = "block"
let homeButton = document.getElementById('home-btn')
let moreButton = document.getElementById('more-btn')
let historyButton = document.getElementById('history-btn')
homeButton.addEventListener('click', ()=> {
    homeButton.classList.remove('active')
    moreButton.classList.remove('active')
    historyButton.classList.remove('active')

    moreDiv.style.display = "none"
    historyDiv.style.display = "none"
    homeDiv.style.display = "block"

    homeButton.classList.add('active')
    // loadSelection()
    input.focus()
    input.select()
})
moreButton.addEventListener('click', ()=> {
    homeButton.classList.remove('active')
    moreButton.classList.remove('active')
    historyButton.classList.remove('active')

    homeDiv.style.display = "none"
    historyDiv.style.display = "none"
    moreDiv.style.display = "block"

    moreButton.classList.add('active')
    // loadSelection()
    input1.focus()
    input1.select()
})
historyButton.addEventListener('click', ()=> {
    homeButton.classList.remove('active')
    moreButton.classList.remove('active')
    historyButton.classList.remove('active')

    homeDiv.style.display = "none"
    moreDiv.style.display = "none"
    historyDiv.style.display = "block"

    historyButton.classList.add('active')
    loadHistory()
    history1.focus()
})
//---------------------- Navbar end -------------------------------

//---------------------- Load selected text -----------------------
// load from current tab selected text into both input fields
function loadSelection() {
    chrome.scripting.executeScript({ target: {tabId: tab.id}, function: getSelection },
      (injectionResults) => {
        for (const frameResult of injectionResults)
        if (frameResult.result != "") {
          input.value = input1.value = frameResult.result;
          // enableButton(go_button);
        }
        if (homeDiv.style.display === "block") {
            input.focus()
            input.select()
        }
        if (moreDiv.style.display === "block") {
            input1.focus()
            input1.select()
        }

      }
    );

    function getSelection() { return window.getSelection().toString() }
}

if (!tab.url.startsWith("chrome://") && !tab.url.startsWith("chrome-extension://")) {
    loadSelection()
} else { input.focus() }

// let input = document.getElementById('input')
// input.focus()
// input.select()
// console.log("input focused");

//---------------------- Prepare copy duplicates ------------------
document.getElementById('amountBeesDups').addEventListener('click', showDups);
function showDups(){
    setTimeout(function(){
        let duptext = document.getElementById('duptext')
        document.getElementById('output').value = duptext.value
        console.log("output:");
        console.log(document.getElementById('output').value);
    }, 50);

}
document.getElementById('amountImeiDups').addEventListener('click', showDups1);
function showDups1(){
    setTimeout(function(){
        let duptext = document.getElementById('duptext1')
        document.getElementById('output2').value = duptext.value
        console.log("output:");
        console.log(document.getElementById('output2').value);
    }, 50);

}

//---------------------- Load first history entry -----------------
chrome.storage.sync.get(['history'], function(result) {
    if (result.history !== undefined) {
        if (result.history[0] !== undefined) {
            output.value = result.history[0]
        }
    }
})

//---------------------- Prepare select action --------------------
selectActions.addEventListener('change', ()=>{
    if (selectActions.value != "default") {
        go_button2.disabled = false
    } else {
        go_button2.disabled = true
    }
})

//---------------------- Copy start -------------------------------
let copy1 = document.getElementById('copy1')
let copy2 = document.getElementById('copy2')
let copy3 = document.getElementById('copy3')
let copy4 = document.getElementById('copy4')
let copy5 = document.getElementById('copy5')
let copy6 = document.getElementById('copy6')
copy1.addEventListener('click', () => {
    let text = document.getElementById('output').value.split(", ").join("|")
    if (text == "") { return }
    copyToClipboard(text)
    let copied = document.getElementById('copied1')

    //--------- try to paste sequence ---------------
    if (tab.url.startsWith("https://portal.roambee.com/#bees") || tab.url.startsWith("https://portal.roambee.de/#bees")) {
        chrome.storage.sync.set({seq: text});
        chrome.scripting.executeScript({ target: {tabId: tab.id}, function: pasteClassic },
            (injectionResults) => {
                if (copied.innerHTML == "") {
                    copied.innerHTML = "injected"
                    setTimeout(function(){
                        copied.innerHTML = ""
                    }, 1500);
                }
            }
        );
    // } else if(tab.url.startsWith("https://view.roambee.com/bees") || tab.url.startsWith("https://view.roambee.de/bees")) {
    //     chrome.storage.sync.set({seq: text});
    //     chrome.scripting.executeScript({ target: {tabId: tab.id}, function: pasteModern },
    //         (injectionResults) => {
    //             if (copied.innerHTML == "") {
    //                 copied.innerHTML = "injected"
    //                 setTimeout(function(){
    //                     copied.innerHTML = ""
    //                 }, 1500);
    //             }
    //         }
    //     );
    } else {
        if (copied.innerHTML == "") {
            copied.innerHTML = "copied"
            setTimeout(function(){
                copied.innerHTML = ""
            }, 1500);
        }
    }
    function pasteClassic() {
        let table = document.getElementById('admin-bees-table')
        let thead = table.getElementsByTagName('thead')[0]
        let row = thead.getElementsByTagName('tr')[0]
        let row1 = thead.getElementsByTagName('tr')[1]
        let th_names = row.getElementsByTagName('th')//*[@id="admin-bees-table"]/thead/tr[1]
        let index
        for (var i = 0; i < th_names.length; i++) {
            if (th_names[i].getAttribute("aria-label").startsWith('Bee Id')) {
                index = i
                break
            } else if (th_names[i].getAttribute("aria-label").startsWith('Bee Name')) {
                index = i
                break
            }
        }
        let filter = row1.getElementsByTagName('th')[index].getElementsByTagName('input')[0]
        chrome.storage.sync.get(['seq'], function(result) {
            filter.value = result.seq
            filter.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, keyCode: 13 }));
        })
        return true
    }
    // function pasteModern() {
    //     let head = document.getElementsByClassName('ui-table-scrollable-header-table')[0]
    //     let row = head.getElementsByTagName('thead')[0].getElementsByTagName('tr')[0]
    //     let row1 = head.getElementsByTagName('thead')[0].getElementsByTagName('tr')[1]
    //     let names = row.getElementsByTagName('th')
    //     let index
    //     for (var i = 1; i < names.length; i++) {
    //         let name = names[i].getElementsByTagName('div')[0].innerHTML
    //         if (name.startsWith(' Bee Number')) {
    //             index = i
    //         }
    //     }
    //     let filter = row1.getElementsByTagName('th')[index].getElementsByTagName('input')[0]
    //     chrome.storage.sync.get(['seq'], function(result) {
    //         filter.value = result.seq
    //         console.log(filter);
    //         // filter.submit()
    //         filter.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, keyCode: 13 }));
    //     })
    //     return true
    // }
})
copy2.addEventListener('click', () => {
    let text = document.getElementById('output').value.split(", ").join("\n")
    if (text == "") { return }
    copyToClipboard(text)
    let copied = document.getElementById('copied2')
    if (copied.innerHTML == "") {
        copied.innerHTML = "copied"
        setTimeout(function(){
            copied.innerHTML = ""
        }, 1500);
    }
})
copy3.addEventListener('click', () => {
    let text = document.getElementById('output2').value.split(", ").join("|")
    if (text == "") { return }
    copyToClipboard(text)
    let copied = document.getElementById('copied3')
    if (copied.innerHTML == "") {
        copied.innerHTML = "copied"
        setTimeout(function(){
            copied.innerHTML = ""
        }, 1500);
    }
})
copy4.addEventListener('click', () => {
    let text = document.getElementById('output2').value.split(", ").join("\n")
    if (text == "") { return }
    copyToClipboard(text)
    let copied = document.getElementById('copied4')
    if (copied.innerHTML == "") {
        copied.innerHTML = "copied"
        setTimeout(function(){
            copied.innerHTML = ""
        }, 1500);
    }
})
copy5.addEventListener('click', () => {
    let selectedOutput = document.getElementsByClassName('historyactive')[0]
    let text = selectedOutput.value.split(", ").join("|")
    if (text == "") { return }
    copyToClipboard(text)
    let copied = document.getElementById('copied5')
    if (copied.innerHTML == "") {
        copied.innerHTML = "copied"
        setTimeout(function(){
            copied.innerHTML = ""
        }, 1500);
    }
})
copy6.addEventListener('click', () => {
    let selectedOutput = document.getElementsByClassName('historyactive')[0]
    let text = selectedOutput.value.split(", ").join("\n")
    if (text == "") { return }
    copyToClipboard(text)
    let copied = document.getElementById('copied6')
    if (copied.innerHTML == "") {
        copied.innerHTML = "copied"
        setTimeout(function(){
            copied.innerHTML = ""
        }, 1500);
    }
})
function copyToClipboard(text) {
    let textarea = document.getElementById('temptext');
    textarea.innerHTML = "";
    textarea.innerHTML = text;
    textarea.focus();
    textarea.select();
    document.execCommand('copy');
    textarea.blur();
}
//---------------------- Copy end ---------------------------------

//---------------------- History start ----------------------------
let history1 = document.getElementById('history1')
let history2 = document.getElementById('history2')
let history3 = document.getElementById('history3')
history1.addEventListener('focus', ()=> {
    history2.classList.remove("historyactive")
    history3.classList.remove("historyactive")
    history2.classList.add("historytext")
    history3.classList.add("historytext")
    history1.classList.remove("historytext")
    history1.classList.add("historyactive")
    copy5.removeAttribute("disabled")
    copy6.removeAttribute("disabled")
})
history2.addEventListener('focus', ()=> {
    history1.classList.remove("historyactive")
    history3.classList.remove("historyactive")
    history1.classList.add("historytext")
    history3.classList.add("historytext")
    history2.classList.remove("historytext")
    history2.classList.add("historyactive")
    copy5.removeAttribute("disabled")
    copy6.removeAttribute("disabled")
})
history3.addEventListener('focus', ()=> {
    history1.classList.remove("historyactive")
    history2.classList.remove("historyactive")
    history1.classList.add("historytext")
    history2.classList.add("historytext")
    history3.classList.remove("historytext")
    history3.classList.add("historyactive")
    copy5.removeAttribute("disabled")
    copy6.removeAttribute("disabled")
})
function pushHistory(text) {
    history3.value = history2.value
    history2.value = history1.value
    history1.value = text
    let history = [history1.value, history2.value, history3.value]
    chrome.storage.sync.set({history: history})
    // chrome.storage.sync.get(['history'], function(result) {
    //     console.log(histryo);
    //     if (history[0] !== undefined) {
    //         history1.value = history[0]
    //     }
    //     if (history[1] !== undefined) {
    //         history2.value = history[1]
    //     }
    //     if (history[2] !== undefined) {
    //         history3.value = history[2]
    //     }
    // });
}
function loadHistory() {
    chrome.storage.sync.get(['history'], function(result) {
        if (result.history !== undefined) {
            let history = result.history
            if (history[0] !== undefined) {
                history1.value = history[0]
            }
            if (history[1] !== undefined) {
                history2.value = history[1]
            }
            if (history[2] !== undefined) {
                history3.value = history[2]
            }
        }
    });
}
//---------------------- History end ------------------------------

//---------------------- Finder start -----------------------------
go_button.addEventListener('click', ()=>{
    let text = document.getElementById('input').value
    findBees(text)
})
go_button2.addEventListener('click', ()=>{
    let text = document.getElementById('input1').value
    findImeis(text, selectActions.value)
})
function findBees(text) {
    text = text.toUpperCase()
    console.log("find bees");
    let result = [];
    var dups = [];

    // create regex pattern for all devices
    let and_pat = /[aA][nN][dD][0-9a-fA-F]{5}/g
    let rlx_pat = /[rR][lL][xX][0-9a-fA-F]{5}/g
    let rgs_pat = /[rR][gG][sS][0-9]{6}/g
    let ble_pat = /[bB][lL][eE][0-9a-fA-F]{6}/g
    let obd_pat = /[oO][bB][dD][0-9]{5}/g
    let blk_pat = /[bB][lL][kK][0-9]{5,6}/g
    let brt_pat = /[bB][rR][tT][0-9a-fA-F]{6}/g
    let rcr_pat = /[rR][cC][rR][0-9]{5}/g
    let bng_pat = /[bB][nN][gG][0-9]{6,7}/g
    let nlb_pat = /[nN][lL][bB][0-9]{5}/g
    let slr_pat = /[sS][lL][rR][0-9]{5}/g
    let sla_pat = /[sS][lL][aA][0-9]{5}/g
    let rnb_pat = /[rR][nN][bB][0-9]{5}/g
    let rbt_pat = /[rR][bB][tT][0-9]{5,6}/g
    let rgl_pat = /[rR][gG][lL][0-9]{5}/g
    let bfx_pat = /[bB][fF][xX][0-9a-fA-F]{5,6}/g
    let ios_pat = /[iI][oO][sS][0-9a-fA-F]{5}/g

    // load all matches into result array
    if (and_pat.test(text)) { result = result.concat(text.match(and_pat)); }
    if (rlx_pat.test(text)) { result = result.concat(text.match(rlx_pat)); }
    if (rgs_pat.test(text)) { result = result.concat(text.match(rgs_pat)); }
    if (ble_pat.test(text)) { result = result.concat(text.match(ble_pat)); }
    if (obd_pat.test(text)) { result = result.concat(text.match(obd_pat)); }
    if (blk_pat.test(text)) { result = result.concat(text.match(blk_pat)); }
    if (brt_pat.test(text)) { result = result.concat(text.match(brt_pat)); }
    if (rcr_pat.test(text)) { result = result.concat(text.match(rcr_pat)); }
    if (bng_pat.test(text)) { result = result.concat(text.match(bng_pat)); }
    if (nlb_pat.test(text)) { result = result.concat(text.match(nlb_pat)); }
    if (slr_pat.test(text)) { result = result.concat(text.match(slr_pat)); }
    if (sla_pat.test(text)) { result = result.concat(text.match(sla_pat)); }
    if (rnb_pat.test(text)) { result = result.concat(text.match(rnb_pat)); }
    if (rbt_pat.test(text)) { result = result.concat(text.match(rbt_pat)); }
    if (rgl_pat.test(text)) { result = result.concat(text.match(rgl_pat)); }
    if (bfx_pat.test(text)) { result = result.concat(text.match(bfx_pat)); }
    if (ios_pat.test(text)) { result = result.concat(text.match(ios_pat)); }

    // sort result array and remove duplicates
    if (result.length > 0) {
      result.sort();
      for (var i = 0; i <= result.length - 1; i++) {
        result[i] = result[i].toUpperCase();
        if ((result.length - 1) > i) {
          if (result[i] == result[i+1].toUpperCase()) {
            dups.push(result[i+1].toUpperCase());
            result.splice(i+1, 1);
            i--;
          }
        }
      }
      document.getElementById('amountBees').innerHTML = result.length
    } else {document.getElementById('amountBees').innerHTML = ""}


    // sort duplicates array and remove duplicated entries
    if (dups.length > 0) {
      dups.sort();
      for (var i = 0; i <= dups.length - 1; i++) {
        dups[i] = dups[i];
        if ((dups.length - 1) > i) {
          if (dups[i] == dups[i+1]) {
            dups.splice(i+1, 1);
            i--;
          }
        }
      }
      document.getElementById('amountBeesDups').innerHTML = dups.length
      document.getElementById('duptext').value = dups.join(", ")

    } else {document.getElementById('amountBeesDups').innerHTML = ""}

      // else {
      //   let pattern;
      //   if (config == 2) { pattern = /[0-9]{15}/g }
      //   else if (config == 3) { pattern = /[0-9a-fA-F]{6}/g }
      //   else if (config == 4) { pattern = /[0-9]{10}/g }
      //   else if (config == 5) { pattern = /[0-9a-fA-F]{12}/g }
      //   if (pattern.test(text)) { result = text.match(pattern) }
      // }

    document.getElementById('output').value = result.join(", ")
    pushHistory(result.join(", "))
    console.log("output set");
}
function findImeis(text, action) {
    text = text.toUpperCase()
    let result = [];
    var dups = [];

    let pattern;
    if (action == 0) { pattern = /[0-9]{15}/g }
    else if (action == 1) { pattern = /[0-9a-fA-F]{6}/g }
    else if (action == 2) { pattern = /[0-9]{10}/g }
    else if (action == 3) { pattern = /[0-9a-fA-F]{12}/g }
    else if (action == 4) { pattern = /([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}/g }
    else if (action == 5) { pattern = /[0-9]{19,20}/g }
    if (pattern.test(text)) { result = text.match(pattern) }

    // remove first half and and add BLE in front
    if (action == 4) {
        for (var i = 0; i < result.length; i++) {
            result[i] = result[i].replace(/:/g, "")
            result[i] = result[i].slice(6)
            result[i] = result[i].replace(/^/, "BLE")
        }
    }

    // sort result array and remove duplicates
    if (result.length > 0) {
        result.sort();
        for (var i = 0; i <= result.length - 1; i++) {
            result[i] = result[i].toUpperCase();
            if ((result.length - 1) > i) {
                if (result[i] == result[i+1].toUpperCase()) {
                    dups.push(result[i+1].toUpperCase());
                    result.splice(i+1, 1);
                    i--;
                }
            }
        }
        document.getElementById('amountImei').innerHTML = result.length
    } else {document.getElementById('amountImei').innerHTML = ""}


    // sort duplicates array and remove duplicated entries
    if (dups.length > 0) {
      dups.sort();
      for (var i = 0; i <= dups.length - 1; i++) {
        dups[i] = dups[i];
        if ((dups.length - 1) > i) {
          if (dups[i] == dups[i+1]) {
            dups.splice(i+1, 1);
            i--;
          }
        }
      }
      document.getElementById('amountImeiDups').innerHTML = dups.length
      document.getElementById('duptext1').value = dups.join(", ")

  } else {document.getElementById('amountImeiDups').innerHTML = ""}

    output2.value = result.join(", ")
    pushHistory(result.join(", "))
}
//---------------------- Finder end -------------------------------

});
