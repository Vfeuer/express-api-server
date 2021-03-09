const {currentUpdate, connectUpdate, statusUpdate, getList, getInfo} = require('./dataControl')
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

// // every node has its own client to receive and update the currentvalue
// function readCurrent (top, id, macADR) {
//     var client = mqtt.connect('mqtt:192.168.2.109:1884')
//     client.subscribe(top,{qos:1})
//     client.on('message', function (topic,message) {
//         var mesJson = JSON.parse(message)
//         currentUpdate(id, mesJson.dev, mesJson.load, mesJson.maxload)
//         onConnect(id, mesJson.dev)  // once message received, reset the timer 
//         checkConnect(id, mesJson.dev)
//     })
//     return client
// }

// one client reveive the data of all nodes and control
function readCurrent () {
    // var client = mqtt.connect('mqtt:192.168.2.109:1884')
    var client = mqtt.connect('mqtt:192.168.5.1:1884')
    // var client = mqtt.connect('mqtt:raspberrypi:1884')

    // subscribe to all the nodes and start the connection check
    getList().then(meshList => {
        for (var i = 0; i < meshList.length; i++) {
            client.subscribe('/DEMESH/'+meshList[i].macADR+'/heartbeat',{qos:1})
            checkConnect (meshList[i].id ,meshList[i].macADR)
        }
    })

    client.on('message', function (topic,message) {
        var mesJson = JSON.parse(message)
        getInfo(mesJson.dev).then(dataRows => {
            id = dataRows[0].id
            onConnect(id, mesJson.dev)  // once message received, reset the timer 
            checkConnect(id, mesJson.dev)
            statusUpdate(id, mesJson.dev ,mesJson.ccss)
            currentUpdate(id, mesJson.dev ,mesJson.smaxcur, mesJson.cmaxcur, mesJson.phases, mesJson.cur1, mesJson.cur2, mesJson.cur3)
        })
    })
    return client
}

module.exports = {
    readCurrent
}