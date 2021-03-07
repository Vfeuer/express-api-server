var mqtt = require('mqtt')
const { macReg} = require('./dataControl')

// scan the mesh for 30s to find whether there is new node to add
function scanMesh (top) {
    // var client = mqtt.connect('mqtt:192.168.2.109:1884')
    var client = mqtt.connect('mqtt:192.168.5.1:1884')
    // var client = mqtt.connect('mqtt:raspberrypi:1884')
    client.subscribe(top,{qos:0})

    client.on('message', function (topic,message) {
        var mesJson = JSON.parse(message)
        macReg(mesJson.dev).then(res => {
            if (res){
                console.log('new node has been added')
            }
        })

    })
    return client  
}

module.exports = {
    scanMesh
}