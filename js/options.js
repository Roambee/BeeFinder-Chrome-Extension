window.addEventListener('DOMContentLoaded', async (event) => {

document.getElementById('activate-btn').addEventListener('click', enableDashboard)
document.getElementById('disable-btn').addEventListener('click', disableDashboard)

chrome.storage.sync.get(['dashboard'], function(result) {
    (result.dashboard) ? enableDashboard() : disableDashboard()
})


function enableDashboard() {
    console.log("dashboard enabled");
    // document.getElementById('about-btn').style.display = "none"
    document.getElementById('activate-btn').style.display ="none"
    document.getElementById('template-btn').style.display ="block"
    document.getElementById('see-templates-btn').style.display ="block"
    document.getElementById('firmware-btn').style.display ="block"
    document.getElementById('disable-btn').style.display ="block"
    document.getElementById('template').style.display ="block"
    document.getElementById('your-templates').style.display ="block"
    document.getElementById('firmware').style.display ="block"
    loadTemplates()
    loadFirmwares()
    chrome.storage.sync.set({dashboard: true});
}
function disableDashboard() {
    console.log("dashboard disabled");
    // document.getElementById('about-btn').style.display = "block"
    document.getElementById('activate-btn').style.display ="block"
    document.getElementById('template-btn').style.display ="none"
    document.getElementById('see-templates-btn').style.display ="none"
    document.getElementById('firmware-btn').style.display ="none"
    document.getElementById('disable-btn').style.display ="none"
    document.getElementById('template').style.display ="none"
    document.getElementById('your-templates').style.display ="none"
    document.getElementById('firmware').style.display ="none"
    chrome.storage.sync.set({dashboard: false});
}

document.getElementById('modeCheck').addEventListener('change', function(){
    if (this.checked) {
        document.getElementById('mode-nm').setAttribute('disabled', true)
        document.getElementById('mode-om').setAttribute('disabled', true)
    } else {
        document.getElementById('mode-nm').removeAttribute('disabled')
        document.getElementById('mode-om').removeAttribute('disabled')
    }
})
document.getElementById('prfCheck').addEventListener('change', function(){
    if (this.checked) {
        document.getElementById('prf').setAttribute('disabled', true)
    } else {
        document.getElementById('prf').removeAttribute('disabled')
    }
})
document.getElementById('tmpCheck').addEventListener('change', function(){
    if (this.checked) {
        document.getElementById('tmp').setAttribute('disabled', true)
    } else {
        document.getElementById('tmp').removeAttribute('disabled')
    }
})
document.getElementById('prsCheck').addEventListener('change', function(){
    if (this.checked) {
        document.getElementById('prs').setAttribute('disabled', true)
    } else {
        document.getElementById('prs').removeAttribute('disabled')
    }
})
document.getElementById('humCheck').addEventListener('change', function(){
    if (this.checked) {
        document.getElementById('hum').setAttribute('disabled', true)
    } else {
        document.getElementById('hum').removeAttribute('disabled')
    }
})
document.getElementById('ambCheck').addEventListener('change', function(){
    if (this.checked) {
        document.getElementById('amb').setAttribute('disabled', true)
    } else {
        document.getElementById('amb').removeAttribute('disabled')
    }
})
document.getElementById('shkCheck').addEventListener('change', function(){
    if (this.checked) {
        document.getElementById('shk').setAttribute('disabled', true)
    } else {
        document.getElementById('shk').removeAttribute('disabled')
    }
})
document.getElementById('bleCheck').addEventListener('change', function(){
    if (this.checked) {
        document.getElementById('ble').setAttribute('disabled', true)
    } else {
        document.getElementById('ble').removeAttribute('disabled')
    }
})

document.getElementById('create-template').addEventListener('click', createTemplate)
function createTemplate(){
    chrome.storage.sync.get(['templates'], function(result) {
        let name = document.getElementById('template-name').value
        console.log("check the name");
        for (var i = 0; i < result.templates.length; i++) {
            if (result.templates[i].name === name) {
                console.log("template already exist");
                let myAlert = document.getElementById('toastFailed')
                let bsAlert = new bootstrap.Toast(myAlert)
                bsAlert.show()
                document.getElementById('template-name').value = ""
                return
            }
        }
        if (name === "") {
            document.getElementById('template-name').reportValidity()
            return
        }
        if(!document.getElementById('prfCheck').checked){
            if (document.getElementById('prf').value === "") {
                console.log("true");
                document.getElementById('prf').reportValidity()
                return
            }
        }
        console.log("create the template");
        let inputs = document.getElementById('template-form').getElementsByTagName('input')
        const template = {
            name : name,

            modeCheck : (inputs.modeCheck.checked)?false:true,
            prfCheck : (inputs.prfCheck.checked)?false:true,
            tmpCheck : (inputs.tmpCheck.checked)?false:true,
            prsCheck : (inputs.prsCheck.checked)?false:true,
            humCheck : (inputs.humCheck.checked)?false:true,
            ambCheck : (inputs.ambCheck.checked)?false:true,
            shkCheck : (inputs.shkCheck.checked)?false:true,
            bleCheck : (inputs.bleCheck.checked)?false:true,


            mode : (document.getElementById('mode-nm').checked)?"NM":"OM",
            prf : inputs.prf.value,
            tmp : inputs.tmp.checked,
            prs : inputs.prs.checked,
            hum : inputs.hum.checked,
            amb : inputs.amb.checked,
            shk : inputs.shk.checked,
            ble : inputs.ble.checked
        }
        let templates = result.templates.concat(new Array(template))
        chrome.storage.sync.set({templates:templates}, () => {
            var error = chrome.runtime.lastError;
            if (error) {
                let myAlert = document.getElementById('toastFailed1')
                let bsAlert = new bootstrap.Toast(myAlert)
                bsAlert.show()
                return
            }
            document.getElementById('template-name').value = ""
            let myAlert = document.getElementById('toastSuccess')
            let bsAlert = new bootstrap.Toast(myAlert)
            bsAlert.show()
            loadTemplates()
        })

        document.getElementById('template').scrollIntoView()
    })
}


document.getElementById('see-template-select').addEventListener('change', function () {
    // if (this.value === "Default") {
    //     console.log("disable button");
    //     document.getElementById('delete-template').setAttribute('disabled', true)
    // } else {
    //     console.log("activate button");
    //     document.getElementById('delete-template').removeAttribute('disabled')
    // }
    injectTemplate(this.value)
})
document.getElementById('delete-template').addEventListener('click', deleteTemplate)
function loadTemplates() {
    chrome.storage.sync.get(['templates'], (result) => {
        let select = document.getElementById('see-template-select')
        select.innerHTML = ""
        for (var i = 0; i < result.templates.length; i++) {
            let option = document.createElement('option')
            option.innerHTML = result.templates[i].name
            option.value = result.templates[i].name
            select.appendChild(option)
        }
        injectTemplate('Default')
    })
}
function injectTemplate(name) {
    chrome.storage.sync.get(['templates'], (result) => {
        for (var i = 0; i < result.templates.length; i++) {
            if (result.templates[i].name === name) {
                if (result.templates[i].prfCheck) {
                    document.getElementById('see-prf').innerHTML = result.templates[i].prf
                } else {
                    document.getElementById('see-prf').innerHTML = "Ignore"
                }
                if (result.templates[i].modeCheck) {
                    document.getElementById('see-mode').innerHTML = result.templates[i].mode
                } else {
                    document.getElementById('see-mode').innerHTML = "Ignore"
                }
                if (result.templates[i].tmpCheck) {
                    document.getElementById('see-tmp').innerHTML = (result.templates[i].tmp) ? "On":"Off"
                } else {
                    document.getElementById('see-tmp').innerHTML = "Ignore"
                }
                if (result.templates[i].prsCheck) {
                    document.getElementById('see-prs').innerHTML = (result.templates[i].prs) ? "On":"Off"
                } else {
                    document.getElementById('see-prs').innerHTML = "Ignore"
                }
                if (result.templates[i].humCheck) {
                    document.getElementById('see-hum').innerHTML = (result.templates[i].hum) ? "On":"Off"
                } else {
                    document.getElementById('see-hum').innerHTML = "Ignore"
                }
                if (result.templates[i].ambCheck) {
                    document.getElementById('see-amb').innerHTML = (result.templates[i].amb) ? "On":"Off"
                } else {
                    document.getElementById('see-amb').innerHTML = "Ignore"
                }
                if (result.templates[i].shkCheck) {
                    document.getElementById('see-shk').innerHTML = (result.templates[i].shk) ? "On":"Off"
                } else {
                    document.getElementById('see-shk').innerHTML = "Ignore"
                }
                if (result.templates[i].bleCheck) {
                    document.getElementById('see-ble').innerHTML = (result.templates[i].ble) ? "On":"Off"
                } else {
                    document.getElementById('see-ble').innerHTML = "Ignore"
                }
            }
        }
    })
}
function deleteTemplate() {
    var name = document.getElementById('see-template-select').value
    if (name === "Default") {
        let myAlert = document.getElementById('toastFailed3')
        let bsAlert = new bootstrap.Toast(myAlert)
        bsAlert.show()
        return
    }

    chrome.storage.sync.get(['templates'], (result) => {
        var templates = result.templates
        let index = 0

        for (var i = 0; i < result.templates.length; i++) {
            if (result.templates[i].name === name) {
                index = i
                break
            }
        }

        templates.pop(index, 1)
        let myAlert = document.getElementById('toastSuccess1')
        let bsAlert = new bootstrap.Toast(myAlert)
        bsAlert.show()

        chrome.storage.sync.set({templates:templates}, ()=> {
            loadTemplates()
        })
    })


}


document.getElementById('add-fw').addEventListener('click', addFirmware)
document.getElementById('reset-fw').addEventListener('click', resetFirmwares)
function addFirmware() {
    chrome.storage.sync.get(['firmwares'], function(result) {
        let fw = document.getElementById('fw-text')
        let exist = false
        for (var i = 0; i < result.firmwares.length; i++) {
            if (Object.values(result.firmwares[i]).indexOf(fw.value) >= 0) {
                exist = true
                let myAlert = document.getElementById('toastFailed2')
                let bsAlert = new bootstrap.Toast(myAlert)
                bsAlert.show()
                break
            }
        }
        if (fw.value !== "" && !exist) {
            let firmwares = new Array({name:fw.value, active:true})
            firmwares = firmwares.concat(result.firmwares)
            chrome.storage.sync.set({firmwares: firmwares}, () => {
                var error = chrome.runtime.lastError;
                if (error) {
                    document.getElementById('fw-text').value = ""
                    let myAlert = document.getElementById('toastFailed3')
                    let bsAlert = new bootstrap.Toast(myAlert)
                    bsAlert.show()
                } else {
                    loadFirmwares()
                    document.getElementById('fw-text').value = ""
                }
            });
        }
        if (fw.value === "") {
            document.getElementById('fw-text').reportValidity()
        }
        if (exist) {
            document.getElementById('fw-text').value = ""
        }
        document.getElementById('firmware').scrollIntoView()
    })
}
function loadFirmwares() {
    chrome.storage.sync.get(['firmwares'], function(result) {
        let list = document.getElementById('fw-group')
        list.innerHTML = ""
        result.firmwares.forEach((fw) => {
            list.appendChild(createListItem(fw))
            document.getElementById(fw.name).addEventListener('change', function(){
                for (var i = 0; i < result.firmwares.length; i++) {
                    if (Object.values(result.firmwares[i]).indexOf(this.id) >= 0) {
                        result.firmwares[i].active=!result.firmwares[i].active
                        chrome.storage.sync.set({firmwares: result.firmwares});
                        loadFirmwares()
                        break
                    }
                }
            })
        })
    })
    function createListItem(fw) {
        let label = document.createElement("label")
        label.classList.add("list-group-item")
        if (fw.active) {
            label.innerHTML = '<input class="form-check-input me-2" type="checkbox" checked id="'+fw.name+'">'+fw.name
        } else {
            label.innerHTML = '<input class="form-check-input me-2" type="checkbox" id="'+fw.name+'">'+fw.name
        }
        return label
    }
}
function resetFirmwares() {
    let firmwares = [{name:"RB3AUTF600", active:true}, {name:"RB3AGTF601", active:true}, {name:"RB3TUTF602", active:true}, {name:"RB3TGTF603", active:true}]
    chrome.storage.sync.set({firmwares: firmwares})
    loadFirmwares()
    document.getElementById('firmware').scrollIntoView()
}

})
