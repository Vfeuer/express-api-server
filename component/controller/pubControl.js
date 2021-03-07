// const { dbExec, escape } = require('../db/mysql')
// const {getInfo} = require('./dataControl')
var mqtt = require('mqtt')

// select the phases for the node
function setPhase (macADR, Phases) {
    // var client = mqtt.connect('mqtt:192.168.2.109:1884')
    var client = mqtt.connect('mqtt:192.168.5.1:1884')
    // var client = mqtt.connect('mqtt:raspberrypi:1884')
    message = JSON.stringify(
        { "cmd": "avrsetpar",
          "avrpar": "phases",
          "avrval": Phases }
    )
    client.publish('/DEMESH/'+macADR+'/control', message, {qos:1})
    client.end
}

function setMaxCur (macADR, maxCur) {
    // var client = mqtt.connect('mqtt:192.168.2.109:1884')
    var client = mqtt.connect('mqtt:192.168.5.1:1884')
    // var client = mqtt.connect('mqtt:raspberrypi:1884')
    message = JSON.stringify(
        { "cmd": "avrsetpar",
          "avrpar": "maxcur",
          "avrval": maxCur*10 }
    )
    client.publish('/DEMESH/'+macADR+'/control', message, {qos:1})
    client.end
}

// function to press button B, only for test
function pressButtonB (macADR) {
    // var client = mqtt.connect('mqtt:192.168.2.109:1884')
    var client = mqtt.connect('mqtt:192.168.5.1:1884')
    // var client = mqtt.connect('mqtt:raspberrypi:1884')
    message = JSON.stringify(
        { "cmd": "avrsetpar",
          "avrpar": "buttonB",
          "avrval": 1 }
    )
    client.publish('/DEMESH/'+macADR+'/control', message, {qos:1})
    client.end
}

module.exports = {
    setPhase,
    pressButtonB,
    setMaxCur
}