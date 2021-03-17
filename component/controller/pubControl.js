var mqtt = require('mqtt')
const {MQTT_CONF} = require('../../conf/configuration')

// select the phases for the node
function setPhase (macADR, Phases) {
    var client = mqtt.connect(MQTT_CONF)
    message = JSON.stringify(
        { "cmd": "avrsetpar",
          "avrpar": "phases",
          "avrval": Phases }
    )
    client.on('connect', function () {
        client.publish('/DEMESH/'+macADR+'/control', message, {qos:1})
        client.end()
    })
}

// set max Current for the node
function setMaxCur (macADR, maxCur) {
    var client = mqtt.connect(MQTT_CONF)
    message = JSON.stringify(
        { "cmd": "avrsetpar",
          "avrpar": "smaxcur",
          "avrval": maxCur*10 }
    )
    client.on('connect', function () {
        client.publish('/DEMESH/'+macADR+'/control', message, {qos:1})
        client.end()
    })
}

// function to press button B, only for test
function pressButtonB (macADR) {
    var client = mqtt.connect(MQTT_CONF)
    message = JSON.stringify(
        { "cmd": "avrsetpar",
          "avrpar": "opbutton",
          "avrval": 1 }
    )

    client.on('connect', function () {
        client.publish('/DEMESH/'+macADR+'/control', message, {qos:1})
        client.end()
    })
}

function Blink (macADR) {
    var client = mqtt.connect(MQTT_CONF)
    message = JSON.stringify(
        { "cmd": "avrsetpar",
          "avrpar": "blinks",
          "avrval": 10 }
    )
    client.on('connect', function () {
        client.publish('/DEMESH/'+macADR+'/control', message, {qos:1})
        client.end()
    })
}

function noBlink (macADR) {
    var client = mqtt.connect(MQTT_CONF)
    message = JSON.stringify(
        { "cmd": "avrsetpar",
          "avrpar": "blinks",
          "avrval": 0 }
    )
    client.on('connect', function () {
        client.publish('/DEMESH/'+macADR+'/control', message, {qos:1})
        client.end()
    })
}

module.exports = {
    setPhase,
    pressButtonB,
    setMaxCur,
    Blink,
    noBlink
}