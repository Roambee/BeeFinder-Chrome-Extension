class BeesTable {
    constructor() {
        this.wrapper = document.getElementById('admin-bees-table_wrapper')
        this.headers = this.wrapper.getElementsByTagName('th')
        this.rows = this.wrapper.getElementsByTagName('tr')
        this.tableText = document.getElementById('admin-bees-table').innerHTML
    }
    checkColumns() {
        this.type_index = this.getIndex("Type")
        this.name_index = this.getIndex("Bee Name")
        this.id_index = this.getIndex("Bee Id")
        this.account_index = this.getIndex("Account")
        this.fw_index = this.getIndex("Firmware Rev")
        this.mode_index = this.getIndex("Device Mode")
        this.battery_index = this.getIndex("Battery Percentage")
        this.prf_index = this.getIndex("Ping Frequency")
        this.com_index = this.getIndex("Communication")
        this.tmp_index = this.getIndex("Current Temperature")
        this.hum_index = this.getIndex("Humidity")
        this.prs_index = this.getIndex("Pressure")
        this.amb_index = this.getIndex("Ambient")
        this.ble_index = this.getIndex("BLE State")
        this.shk_index = this.getIndex("Shock")

        if (this.type_index == undefined) {return false}
        if (this.headers[this.type_index].innerHTML.includes("Device")) {return false}
        if (this.headers[this.type_index].innerHTML.includes("Battery")) {return false}
        if (this.headers[this.type_index].innerHTML.includes("Sim")) {return false}
        if (this.headers[this.type_index].innerHTML.includes("Case")) {return false}
        if (this.name_index == undefined) {return false}
        if (this.id_index != undefined) {this.name_index = this.id_index}
        if (this.account_index == undefined) {return false}
        if (this.fw_index == undefined) {return false}
        if (this.mode_index == undefined) {return false}
        if (this.battery_index == undefined) {return false}
        if (this.prf_index == undefined) {return false}
        if (this.com_index == undefined) {return false}
        if (this.tmp_index == undefined) {return false}
        if (this.hum_index == undefined) {return false}
        if (this.prs_index == undefined) {return false}
        if (this.amb_index == undefined) {return false}
        if (this.shk_index == undefined) {return false}
        if (this.ble_index == undefined) {return false}

        return true
    }
    getIndex(label_text){
        for (var i = 0; i < this.headers.length; i++) { if (this.headers[i].innerHTML.includes(label_text)) {
            return i } }
    }
    isDashboardAvailable(){
        if (this.wrapper.innerHTML.includes("beefinder_dashboard")) {
            return true
        }
        return false
    }
}

const dashboard = {
    bt : null,
    tableChanged : function(bt){
        if (bt.tableText.includes("loading-message loading-message-boxed")) {
            return false
        }
        if (this.bt == null) {
            this.bt = bt
            return true
        }
        if (this.bt.tableText !== bt.tableText) {
            this.bt = bt
            return true
        }
        return false
    },
    update : function(){
        console.log("update");
        dashboard.updateTemplates()
        if (dashboard.bt === null) {
            return
        }
        if (!dashboard.bt.checkColumns()) {
                return
        }
        bees = getBees(dashboard.bt)
        dashboard.bees = bees
        if (bees.length == 0) {
            return
        }

        let select = document.getElementById('bees-checked')
        select.innerHTML = "Bees checked: " + bees.length
        select.style.marginRight = "1rem"

        chrome.storage.sync.get(['firmwares', 'templates', 'selectedTemplate'], function (result) {
            dashboard.updateBar(checkHealth(bees))
            dashboard.updateBar(checkFw(bees, result.firmwares))
            dashboard.updateBar(checkReadyToShip(bees))
            dashboard.updateBar(checkConfigs(bees, result.templates, result.selectedTemplate))
        })

        function getBees(bt) {
            let bees = []
            if (bt.rows[2].innerHTML.includes("No data available in table")) {
                return bees
            }
            // var table = table_rows.splice(0, 2)
            for (var i = 2; i < bt.rows.length; i++) {
                let bee = {}
                let data = bt.rows[i].getElementsByTagName('td')

                bee.type = data[bt.type_index].innerHTML
                if (!bee.type.includes("BeeSense")) {continue}

                bee.name = data[bt.name_index].innerHTML
                let rcr_pat = /[rR][cC][rR][0-9]{5}/g
                if (rcr_pat.test(bee.name)) {
                    bee.name = bee.name.match(rcr_pat)[0]
                } else {continue}

                bee.account = data[bt.account_index].innerHTML
                //bee.carrier = data[carrier_index].innerHTML
                bee.fw = data[bt.fw_index].innerHTML
                bee.mode = data[bt.mode_index].innerHTML.toUpperCase()
                if (bee.mode !== "NM" && bee.mode !== "OM") { continue }


                bee.battery = data[bt.battery_index].getElementsByTagName('span')[0].innerHTML
                let battery_pat = /[0-9]{1,3}/g
                if (battery_pat.test(bee.battery)) {
                    bee.battery = bee.battery.match(battery_pat)[0]
                    bee.battery = (bee.battery >= 70) ? true:false
                } else {continue}

                bee.prf = data[bt.prf_index].innerHTML
                bee.com = (data[bt.com_index].innerHTML.includes("OK")) ? true:false
                bee.tmp = (data[bt.tmp_index].innerHTML.includes("N/A") || data[bt.tmp_index].innerHTML.includes("null")) ? false:true
                bee.hum = (data[bt.hum_index].innerHTML.includes("N/A") || data[bt.hum_index].innerHTML.includes("null")) ? false:true
                bee.prs = (data[bt.prs_index].innerHTML.includes("N/A") || data[bt.prs_index].innerHTML.includes("null")) ? false:true
                bee.amb = (data[bt.amb_index].innerHTML.includes("N/A") || data[bt.amb_index].innerHTML.includes("null")) ? false:true
                bee.shk = (data[bt.shk_index].innerHTML.includes("N/A") || data[bt.shk_index].innerHTML.includes("null")) ? false:true
                bee.ble = (data[bt.ble_index].innerHTML.includes("On")) ? true:false

                bee.rowIndex = i

                bees.push(bee)
            }
            return bees
        }
        function checkHealth(bees){
            let healthy = 0
            for (var i = 0; i < bees.length; i++) {
                let cells = dashboard.bt.rows[bees[i].rowIndex].getElementsByTagName('td')
                if (bees[i].com) {
                    for (var j = 1; j < cells.length; j++) {
                        if (cells[j] !== undefined) {
                            cells[j].style.backgroundColor = "#5cb85c"
                            cells[j].style.color = "black"
                        }
                    }
                    bees[i].isHealthy = true
                    healthy++
                } else {
                    for (var j = 1; j < cells.length; j++) {
                        if (cells[j] !== undefined) {
                            cells[j].style.backgroundColor = "#ed4e2a"
                            cells[j].style.color = "white"
                        }
                    }
                    bees[i].isHealthy = false
                }
            }
            let values = {
                section : "healthy",
                pos : healthy,
                neg : bees.length - healthy,
                percentage : (healthy/bees.length) * 100
            }
            return values
        }
        function checkFw(bees, firmwares) {
            let fw = 0
            for (var i = 0; i < bees.length; i++) {
                if (fwActive(firmwares, bees[i].fw)) {
                    bees[i].onLatestFirmware = true
                    fw++
                } else {
                    if (bees[i].isHealthy) {
                        let cells = dashboard.bt.rows[bees[i].rowIndex].getElementsByTagName('td')
                        cells[dashboard.bt.fw_index].style.backgroundColor = '#ffb347'
                        cells[dashboard.bt.fw_index].style.color = 'black'
                    }
                    bees[i].onLatestFirmware = false
                }
            }
            let values = {
                section : "fw",
                pos : fw,
                neg : bees.length - fw,
                percentage : (fw/bees.length) * 100
            }
            return values
        }
        function checkReadyToShip(bees) {
            var ready = 0
            for (var i = 0; i < bees.length; i++) {
                if (bees[i].isHealthy && bees[i].onLatestFirmware && bees[i].battery && bees[i].account === "Roambee") {
                    bees[i].isReady = true
                    ready++
                } else {
                    bees[i].isReady = false
                    if (bees[i].isHealthy) {
                        if (!bees[i].battery) {
                            let cells = dashboard.bt.rows[bees[i].rowIndex].getElementsByTagName('td')
                            cells[dashboard.bt.battery_index].style.backgroundColor = '#ffb347'
                            cells[dashboard.bt.battery_index].style.color = 'black'
                        }
                        if (bees[i].account !== "Roambee") {
                            let cells = dashboard.bt.rows[bees[i].rowIndex].getElementsByTagName('td')
                            cells[dashboard.bt.account_index].style.backgroundColor = '#ffb347'
                            cells[dashboard.bt.account_index].style.color = 'black'
                        }
                    }
                }
            }
            let values = {
                section : "ready",
                pos : ready,
                neg : bees.length - ready,
                percentage : (ready/bees.length) * 100
            }
            return values
        }
        function checkConfigs(bees, templates, selected) {
            var onConfig = 0
            var template = null

            if (templates.length === 1) {
                template = templates[0]
            } else {
                for (var i = 0; i < templates.length; i++) {
                    if (templates[i].name === selected) {
                        template = templates[i]
                    }
                }
            }
            console.log(template);
            for (var i = 0; i < bees.length; i++) {
                if (match(bees[i], template)) {
                    bees[i].onConfig = true
                    onConfig++
                }
            }

            let values = {
                section : "config",
                pos : onConfig,
                neg : bees.length - onConfig,
                percentage : (onConfig/bees.length) * 100
            }
            return values

            function match(bee, template) {
                let result = true
                let danger = "#ffb347"
                let fontColor = "black"
                let cells = dashboard.bt.rows[bees[i].rowIndex].getElementsByTagName('td')
                // console.log(template);
                // if (template.healthCheck) {
                //     if (!bee.isHealthy) {
                //         result = false
                //     }
                // }
                // if (template.fwCheck) {
                //     if (!bee.onLatestFirmware) {
                //         result = false
                //     }
                // }
                // if (template.batCheck) {
                //     if (!bee.battery) {
                //         result = false
                //     }
                // }
                if (template.modeCheck) {
                    if (bee.mode !== template.mode) {
                        if (bee.isHealthy) {
                            cells[dashboard.bt.mode_index].style.backgroundColor = danger
                            cells[dashboard.bt.mode_index].style.color = fontColor
                        }
                        result = false
                    }
                }
                if (template.prfCheck) {
                    if (bee.prf != template.prf) {
                        if (bee.isHealthy) {
                            cells[dashboard.bt.prf_index].style.backgroundColor = danger
                            cells[dashboard.bt.prf_index].style.color = fontColor
                        }
                        result = false
                    }
                }
                if (template.tmpCheck) {
                    if (bee.tmp !== template.tmp) {
                        if (bee.isHealthy) {
                            cells[dashboard.bt.tmp_index].style.backgroundColor = danger
                            cells[dashboard.bt.tmp_index].style.color = fontColor
                        }
                        result = false
                    }
                }
                if (template.prsCheck) {
                    if (bee.prs !== template.prs) {
                        if (bee.isHealthy) {
                            cells[dashboard.bt.prs_index].style.backgroundColor = danger
                            cells[dashboard.bt.prs_index].style.color = fontColor
                        }
                        result = false
                    }
                }
                if (template.humCheck) {
                    if (bee.hum !== template.hum) {
                        if (bee.isHealthy) {
                            cells[dashboard.bt.hum_index].style.backgroundColor = danger
                            cells[dashboard.bt.hum_index].style.color = fontColor
                        }
                        result = false
                    }
                }
                if (template.ambCheck) {
                    if (bee.amb !== template.amb) {
                        if (bee.isHealthy) {
                            cells[dashboard.bt.amb_index].style.backgroundColor = danger
                            cells[dashboard.bt.amb_index].style.color = fontColor
                        }
                        result = false
                    }
                }
                if (template.shkCheck) {
                    if (bee.shk !== template.shk) {
                        if (bee.isHealthy) {
                            cells[dashboard.bt.shk_index].style.backgroundColor = danger
                            cells[dashboard.bt.shk_index].style.color = fontColor
                        }
                        result = false
                    }
                }
                if (template.bleCheck) {
                    if (bee.ble !== template.ble) {
                        if (bee.isHealthy) {
                            cells[dashboard.bt.ble_index].style.backgroundColor = danger
                            cells[dashboard.bt.ble_index].style.color = fontColor
                        }
                        result = false
                    }
                }

                return result
            }
        }
        function fwActive(firmwares, fw) {
            for (var i = 0; i < firmwares.length; i++) {
                if (firmwares[i].name === fw) {
                    if (firmwares[i].active) {
                        return true
                    }
                }
            }
            return false
        }
    },
    create : function(bt){
        injectStyles()

        dashboard.bt = bt

        let dashboardDiv = createDashboard()
        injectDashboard(dashboardDiv)
        dashboard.injectTemplates()
        dashboard.setEventListener()

        document.getElementsByClassName('reload')[0].addEventListener('click', dashboard.update)

        let node1 = document.getElementById('admin-bees-table_filter').parentNode

        let label = document.createElement("label")
        label.innerHTML = ""
        label.id = "bees-checked"

        let select = document.getElementById('admin-bees-table_length').getElementsByTagName('select')[0]
        select.parentNode.insertBefore(label, select)

        let row = node1.parentNode
        let cols = row.childNodes
        for (var i = 0; i < cols.length; i++) {
            cols[i].classList.remove("col-sm-4")
            cols[i].classList.add("col-sm-3")
        }
        let newCol = document.createElement("div")
        newCol.classList.add('col-sm-3')
        let back = document.createElement("button")
        back.classList.add("btn")
        back.id = "back-bees"
        back.innerHTML = "Back"
        back.style.display = "none"
        back.addEventListener('click', function(){
            chrome.storage.sync.get(['back'], function(result){
                let bees = []
                bees = result.back
                dashboard.searchBees(bees[result.back.length-1])
                bees.pop()
                chrome.storage.sync.set({back: bees});
                // console.log("Last item has been removed, new length: "+bees.length);
                if (bees.length == 0) {
                    document.getElementById('back-bees').style.display = "none"
                }
            })
        })
        newCol.appendChild(back)
        row.insertBefore(newCol, cols[1])
        // console.log(document.getElementById('admin-bees-table_length').parentNode.parentNode.parentNode);


        function injectStyles(){
            if (document.getElementById('dashboard-styles')) { return }
            let style = document.createElement('style');
            style.id = "dashboard-styles"
            style.type = 'text/css';
            style.innerHTML = bootstrap_classes
            document.getElementsByTagName('head')[0].appendChild(style);
        }
        function createDashboard() {
            let dashboard = document.createElement("div")
            dashboard.classList.add('container-fluid')
            dashboard.id = "beefinder_dashboard"

            let noData = document.createElement("div")
            noData.innerHTML = "No Bees found."
            noData.id='no-bees-overlay'
            // dashboard.append(noData)

            // dashboard rows
            let row = createElement("div", ["row1"])
            let row1 = createElement("div", ["row1"])

            let healthy = createCard("Healthy Bees", "healthy")
            healthy.style.paddingRight="2rem"
            let fw = createCard("On latest Firmware", "fw")
            fw.style.paddingLeft="2rem"

            let ready = createCard("Ready to ship", "ready")
            ready.style.paddingRight="2rem"
            let configText = "On <select class='form-control input-sm' id='select-template'></select> configs"
            let config = createCard(configText, "config")
            config.style.paddingLeft="2rem"

            row.appendChild(healthy)
            row.appendChild(fw)
            row1.appendChild(ready)
            row1.appendChild(config)

            dashboard.appendChild(row)
            dashboard.appendChild(row1)

            return dashboard

            function createCard(title, index) {
                let card = createElement("div", ["col-sm"])
                let card1 = createElement("div", ["card1", "h-100"]) // , "shadow"
                let card1_body = createElement("div", ["card1-body"])
                let inner_row = createElement("div", ["align-items-center"])
                let col = createElement("div", ["col"]) // css bis hier gemacht
                let text = createElement("div", ["title", "strong", "text-primary", "mb-2"]) //, "text-uppercase"
                text.innerHTML = title
                text.style.fontSize = "18px"
                text.style.marginLeft = ".4rem"
                let badge_pos = createElement("span", ["badge1", "bg1-success"])
                badge_pos.id = index+"-badge-pos"
                badge_pos.innerHTML = ""
                let badge_neg = createElement("span", ["badge1", "bg1-danger"])
                badge_neg.id = index+"-badge-neg"
                badge_neg.innerHTML = ""
                text.appendChild(badge_pos)
                text.appendChild(badge_neg)
                let text1 =  createElement("div", ["row1", "align-items-center"]) // ab hier wieder gemacht
                // let col_auto = createElement("div", ["col-auto"])
                // let pos_value = createElement("p", ["text-start"])
                // pos_value.id = index+"_pos_value"
                // pos_value.innerHTML = "0"
                // col_auto.appendChild(pos_value)
                let col_progress = createElement("div", ["col"])
                let progress = createElement("div", ["progress1"]) //, "progress-striped"
                let bar = createElement("div", ["progress-bar", "progress-bar-success"])
                bar.id = index+"_bar"
                bar.role = "progressbar"
                bar.style.width = "0%"
                bar.setAttribute("aria-valuenow", "0")
                bar.setAttribute("aria-valuemin", "0")
                bar.setAttribute("aria-valuemax", "100")
                // let pos_value = document.createElement("p")
                // pos_value.id = index+"_pos_value"
                // pos_value.style.marginTop = "1rem"
                // pos_value.style.fontSize = "2rem"
                // bar.appendChild(pos_value)
                progress.appendChild(bar)
                col_progress.appendChild(progress)
                // let col_auto_neg = createElement("div", ["col-auto"])
                // let neg_value = createElement("span", ["badge"])
                // neg_value.id = index+"_neg_value"
                // col_auto_neg.appendChild(neg_value)
                // text1.appendChild(col_auto)
                text1.appendChild(col_progress)
                // text1.appendChild(col_auto_neg)
                col.appendChild(text)
                col.appendChild(text1)
                inner_row.appendChild(col)
                card1_body.appendChild(inner_row)
                card1.appendChild(card1_body)
                card.appendChild(card1)
                card.style.marginBottom = "1rem"

                return card
            }
            function createElement(tag, class_names){
                let element = document.createElement(tag)
                element.classList.add(...class_names)
                return element
            }
        }
        function injectDashboard(dashboard) {
            let node = document.getElementById('admin-bees-table_wrapper').getElementsByClassName('row')[0];
            node.parentNode.insertBefore(dashboard, node);
        }
    },
    updateBar : function ({section, pos, neg, percentage}) {
        document.getElementById(section+'_bar').style.width = percentage + "%"
        if (pos === 0) {
            document.getElementById(section+'-badge-pos').innerHTML = ""
        } else {
            document.getElementById(section+'-badge-pos').innerHTML = pos
        }
        if(neg === 0) {
            document.getElementById(section+'-badge-neg').innerHTML = ""
        } else {
            document.getElementById(section+'-badge-neg').innerHTML = neg
        }
        if (percentage === 0) {
            document.getElementById(section+'_bar').innerHTML = ""
        } else {
            document.getElementById(section+'_bar').innerHTML = Math.round(percentage) + "%"
        }
    },
    setEventListener : function() {
        document.getElementById('healthy-badge-pos').addEventListener('click', function(){
            let bees = []
            for (var i = 0; i < dashboard.bees.length; i++) {
                if (dashboard.bees[i].isHealthy) {
                    bees.push(dashboard.bees[i].name)
                }
            }
            dashboard.pushBees()
            dashboard.searchBees(bees)
        })
        document.getElementById('healthy-badge-neg').addEventListener('click', function(){
            let bees = []
            for (var i = 0; i < dashboard.bees.length; i++) {
                if (!dashboard.bees[i].isHealthy) {
                    bees.push(dashboard.bees[i].name)
                }
            }
            dashboard.pushBees()
            dashboard.searchBees(bees)
        })
        document.getElementById('fw-badge-pos').addEventListener('click', function(){
            let bees = []
            for (var i = 0; i < dashboard.bees.length; i++) {
                if (dashboard.bees[i].onLatestFirmware) {
                    bees.push(dashboard.bees[i].name)
                }
            }
            dashboard.pushBees()
            dashboard.searchBees(bees)
        })
        document.getElementById('fw-badge-neg').addEventListener('click', function(){
            let bees = []
            for (var i = 0; i < dashboard.bees.length; i++) {
                if (!dashboard.bees[i].onLatestFirmware) {
                    bees.push(dashboard.bees[i].name)
                }
            }
            dashboard.pushBees()
            dashboard.searchBees(bees)
        })
        document.getElementById('ready-badge-pos').addEventListener('click', function(){
            let bees = []
            for (var i = 0; i < dashboard.bees.length; i++) {
                if (dashboard.bees[i].isReady) {
                    bees.push(dashboard.bees[i].name)
                }
            }
            dashboard.pushBees()
            dashboard.searchBees(bees)
        })
        document.getElementById('ready-badge-neg').addEventListener('click', function(){
            let bees = []
            for (var i = 0; i < dashboard.bees.length; i++) {
                if (!dashboard.bees[i].isReady) {
                    bees.push(dashboard.bees[i].name)
                }
            }
            dashboard.pushBees()
            dashboard.searchBees(bees)
        })
        document.getElementById('config-badge-pos').addEventListener('click', function(){
            let bees = []
            for (var i = 0; i < dashboard.bees.length; i++) {
                if (dashboard.bees[i].onConfig) {
                    bees.push(dashboard.bees[i].name)
                }
            }
            dashboard.pushBees()
            dashboard.searchBees(bees)
        })
        document.getElementById('config-badge-neg').addEventListener('click', function(){
            let bees = []
            for (var i = 0; i < dashboard.bees.length; i++) {
                if (!dashboard.bees[i].onConfig) {
                    bees.push(dashboard.bees[i].name)
                }
            }
            dashboard.pushBees()
            dashboard.searchBees(bees)
        })
    },
    searchBees : function(bees) {
        let index = this.bt.name_index
        let input = this.bt.rows[1].getElementsByTagName('th')[index].getElementsByTagName('input')[0]
        input.value = bees.join("|")
        input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, keyCode: 13 }));
    },
    pushBees : function() {
        chrome.storage.sync.get(['back'], function (result) {
            let bees = result.back
            let beeNames = []
            for (var i = 0; i < dashboard.bees.length; i++) {
                beeNames.push(dashboard.bees[i].name)
            }
            bees.push(beeNames)
            // console.log("item has been pushed, new length: "+bees.length);
            chrome.storage.sync.set({back: bees});
            document.getElementById('back-bees').style.display = "block"
        })
    },
    injectTemplates : function() {
        let k1 = getData('templates')
        let k2 = getData('selectedTemplate')
        Promise.all([k1, k2]).then(values => {
            let select = document.getElementById('select-template')
            let templates = values[0]
            for (var i = 0; i < templates.length; i++) {
                let option = document.createElement('option')
                option.value = templates[i].name
                option.innerHTML = templates[i].name
                select.appendChild(option)
            }

            let add = document.createElement('option')
            add.value = "Add"
            add.id = "add-template"
            add.innerHTML = "Add"
            select.appendChild(add)

            select.addEventListener('change', function(){
                if (this.value === "Add") {
                    chrome.runtime.sendMessage({message: 'add'})
                    select.value = "Default"
                    return
                } else {
                    chrome.storage.sync.set({selectedTemplate: this.value})
                    dashboard.update()
                }
            })
            select.value = values[1]
        })
    },
    updateTemplates : function() {
        let k1 = getData('templates')
        let k2 = getData('selectedTemplate')
        Promise.all([k1, k2]).then(values => {
            let select = document.getElementById('select-template')

            select.innerHTML = ""
            let templates = values[0]
            for (var i = 0; i < templates.length; i++) {
                let option = document.createElement('option')
                option.value = templates[i].name
                option.innerHTML = templates[i].name
                select.appendChild(option)
            }

            let add = document.createElement('option')
            add.value = "Add"
            add.id = "add-template"
            add.innerHTML = "Add"
            select.appendChild(add)

            console.log(values[1]);
            select.value = values[1]
        })
    }
}


setInterval(function(){
    if (document.getElementById('admin-bees-table_wrapper')) {
        var bt = new BeesTable()
        if (!bt.checkColumns()) {
            console.log("Could not find all needed columns");
            return
        }

        if (bt.isDashboardAvailable()) {
            if (dashboard.tableChanged(bt)) {
                dashboard.update()
            }
        } else {
            dashboard.create(bt)
        }
    }
}, 300)

const getData = async (key) => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get([key], function (result) {
            if (result[key] === undefined) {
                reject();
            } else {
                resolve(result[key]);
            }
        });
    });
};

let overlay = "#no-bees-overlay{position:absolute;left:0px;top:0px;z-index:10;display:block;right:0px;height:100%;background:rgba(0,0,0,.5)}"
const bootstrap_classes = ".container,.container-fluid,.container-lg,.container-md,.container-sm,.container-xl,.container-xxl{width:100%;padding-right:var(--bs-gutter-x,.75rem);padding-left:var(--bs-gutter-x,.75rem);margin-right:auto;margin-left:auto}.d-sm-flex{display:flex!important}.align-items-center{align-items:center!important}.justify-content-between{justify-content:space-between!important}.mt-2{margin-top:.5rem!important}.mb-0{margin-bottom:0!important}.mb-2{margin-bottom:.5rem!important}.mb-4{margin-bottom:1.5rem!important}.progress1{display:flex;height:20px;overflow:hidden;margin-bottom:0!important;font-size:1rem;background-color:#e9ecef!important;border-radius:.5rem!important;margin-left:1rem!important;margin-right:1rem!important}.bg-info{background-color:#0dcaf0!important}.row1{--bs-gutter-x:1.5rem;--bs-gutter-y:0;display:flex;flex-wrap:wrap;margin-top:calc(var(--bs-gutter-y) * -1);margin-right:calc(var(--bs-gutter-x)/ -2);margin-left:calc(var(--bs-gutter-x)/ -2)}.col{flex:1 0 0%}.card1{position:relative;display:flex;flex-direction:column;min-width:0;word-wrap:break-word!important;background-color:#fff!important;background-clip:border-box!important}.card1-body{flex:1 1 auto}.shadow{box-shadow:0 .5rem 1rem rgba(0,0,0,.15)!important}.h-100{height:100%!important}.py-2{padding-top:.5rem!important;padding-bottom:.5rem!important}.align-items-center{align-items:center!important}.col-auto{flex:0 0 auto;width:auto;margin-left:1rem!important;margin-right:1rem!important}@media (min-width:576px){.col-sm{flex:1 0 0%}.row-cols-sm-auto>*{flex:0 0 auto;width:auto}.row-cols-sm-1>*{flex:0 0 auto;width:100%}.row-cols-sm-2>*{flex:0 0 auto;width:50%}.row-cols-sm-3>*{flex:0 0 auto;width:33.3333333333%}.row-cols-sm-4>*{flex:0 0 auto;width:25%}.row-cols-sm-5>*{flex:0 0 auto;width:20%}.row-cols-sm-6>*{flex:0 0 auto;width:16.6666666667%}.col-sm-auto{flex:0 0 auto;width:auto}.col-sm-1{flex:0 0 auto;width:8.3333333333%}.col-sm-2{flex:0 0 auto;width:16.6666666667%}.col-sm-3{flex:0 0 auto;width:25%}.col-sm-4{flex:0 0 auto;width:33.3333333333%}.col-sm-5{flex:0 0 auto;width:41.6666666667%}.col-sm-6{flex:0 0 auto;width:50%}.col-sm-7{flex:0 0 auto;width:58.3333333333%}.col-sm-8{flex:0 0 auto;width:66.6666666667%}.col-sm-9{flex:0 0 auto;width:75%}.col-sm-10{flex:0 0 auto;width:83.3333333333%}.col-sm-11{flex:0 0 auto;width:91.6666666667%}.col-sm-12{flex:0 0 auto;width:100%}.offset-sm-0{margin-left:0}.offset-sm-1{margin-left:8.3333333333%}.offset-sm-2{margin-left:16.6666666667%}.offset-sm-3{margin-left:25%}.offset-sm-4{margin-left:33.3333333333%}.offset-sm-5{margin-left:41.6666666667%}.offset-sm-6{margin-left:50%}.offset-sm-7{margin-left:58.3333333333%}.offset-sm-8{margin-left:66.6666666667%}.offset-sm-9{margin-left:75%}.offset-sm-10{margin-left:83.3333333333%}.offset-sm-11{margin-left:91.6666666667%}}.strong{font-weight:500}.text-primary{color:#000!important}.text-uppercase{text-transform:uppercase!important}.badge1{display:inline-block;padding:.4rem;padding-left:.7rem;padding-right:.7rem;font-size:12px;font-weight:500;line-height:1;color:#fff;text-align:center;white-space:nowrap;vertical-align:baseline;border-radius:.5rem!important;margin-left:1rem;height:19px;cursor:pointer}.badge1:empty{display:none}.bg1-success{background-color:#5cb85c!important}.bg1-danger{background-color:#ed4e2a!important}"+overlay
