const {currentUpdate, connectUpdate, statusUpdate, getList, getInfo, macReg, infoUpdate} = require('./dataControl')
const {MQTT_CONF} = require('../../conf/configuration')
var mqtt = require('mqtt')
var noConnect = new Array()
var connect = false

// 15sec no reset the Timer -> no connection
function checkConnect (id, macADR) {
    noConnect[id]= setTimeout(() => {
       connect = false
       connectUpdate(id, macADR, connect)
    }, 15000);
}

// Timer reset and update connection as true
function onConnect (id, macADR) {
    connect = true
    connectUpdate(id, macADR, connect)
    clearTimeout(noConnect[id])
}

//Client subscribe heartbeat task to read the data of all nodes and check its connection
function readData () {
    var client = mqtt.connect(MQTT_CONF)
    client.subscribe('/DEMESH/+/heartbeat',{qos:1})
    //start the connection check
    getList().then(meshList => {
        if(meshList[0]) {
            for (var i = 0; i < meshList.length; i++) {
                checkConnect (meshList[i].id ,meshList[i].macADR)
            }
        }
        client.on('message', function (topic,message) {
            var mesJson = JSON.parse(message)
            getInfo(mesJson.dev).then(dataRows => {
                // this is a new Node
                if(!dataRows) {
                    macReg(mesJson.dev).then(val => {
                        if(val) {
                            getInfo(mesJson.dev).then(dataRows => {
                                id = dataRows[0].id
                                onConnect(id, mesJson.dev)  // once message received, reset the timer 
                                checkConnect(id, mesJson.dev)
                                statusUpdate(id, mesJson.dev ,mesJson.ccss)
                                currentUpdate(id, mesJson.dev ,mesJson.smaxcur, mesJson.cmaxcur, mesJson.phases, mesJson.cur1, mesJson.cur2, mesJson.cur3)
                                readInfo(mesJson.dev)
                            })
                        }
                    })

                }
                else {
                    id = dataRows[0].id
                    onConnect(id, mesJson.dev)  // once message received, reset the timer 
                    checkConnect(id, mesJson.dev)
                    statusUpdate(id, mesJson.dev ,mesJson.ccss)
                    currentUpdate(id, mesJson.dev ,mesJson.smaxcur, mesJson.cmaxcur, mesJson.phases, mesJson.cur1, mesJson.cur2, mesJson.cur3)
                }
            })
        })
    })
    return client
}

// read the status and system information of node with mqtt
function readInfo (macADR) {
    var client = mqtt.connect(MQTT_CONF)
    client.subscribe('/DEMESH/+/acknowledge',{qos:1})
    client.publish('/DEMESH/'+macADR+'/control', JSON.stringify({"cmd": "status"}), {qos:2})
    client.publish('/DEMESH/'+macADR+'/control', JSON.stringify({"cmd": "system"}), {qos:2})
    var subSuccess = -1 // -1: no message arrived, 0: received one message, 1:received both 2 message
    client.on('message', function (topic,message){
        var mesJson = JSON.parse(message)
        getInfo(mesJson.dev).then(dataRows => {
            if(!dataRows) {
                return false
            }
            id = dataRows[0].id
            infoUpdate(id, mesJson.dev, mesJson.parent, mesJson.rssi, mesJson.layer, mesJson.plat, mesJson.version,
                mesJson.board, mesJson.avrver).then(val => {
                    if(val) {
                        subSuccess++
                    }
                    if(subSuccess>0) {
                        client.end()
                        return true
                    }
                })
        })
    })
}

//read the status and system information of all nodes
function readAllInfo () {
    getList().then(meshList => {
        if(meshList[0]) {
            for (var i = 0; i < meshList.length; i++) {
                readInfo(meshList[i].macADR)
                if(i==meshList.length-1) {
                    return true
                }
            }
        }
        return false
    })
}

module.exports = {
    readData,
    readInfo,
    readAllInfo
}