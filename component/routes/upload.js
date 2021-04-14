var express = require('express');
var router = express.Router();
var fs = require("fs");
const crc32 = require('crc32');
const { SuccessModel, ErrorModel } = require('../model/resModel')
const {readInfo} = require('../controller/subControl')
var mqtt = require('mqtt')
const {MQTT_CONF, dirName} = require('../../conf/configuration')

router.post('/', (req, res, next) => {
    var des_file = dirName + "/" + req.files[0].originalname; //destination folder and name of file
    return fs.readFile( req.files[0].path, function (err, data) {  // Read file data asynchronously
        return fs.writeFile(des_file, data, function (err) { // des_file: file name，data: file data，asynchronously
            if( err ){
                return new ErrorModel({'msg': err, 'status': 400})
            } 
            else{
                return res.json( new SuccessModel({'msg': 'File ' + req.files[0].originalname +' uploaded successfully', 'status': 202})
            )}
        })
    })
});

router.post('/ESP32', (req, res, next) => {
    const board = req.body.Board
    const ver = req.body.Version
    var client = mqtt.connect(MQTT_CONF)
    var message = JSON.stringify(
            { "cmd": "upgrade",
              "version": ver,
              "board": board })
              
    client.on('connect', function () {
        client.publish('/DEMESH/root/control', message, {qos:1})
        client.end()
    })
    return res.json( new SuccessModel({'msg': 'ESP32 will download the Firmaware "'+board+'" v'+ver+' now.', 'status': 202})
    )
});

router.post('/AVR', (req, res, next) => {
    const fileName = req.body.fileName
    const macADR = req.body.macADR
    const macAddr = req.body.macAdress
    const firmware = fs.readFileSync(dirName+"/"+fileName)
    const byteLength = firmware.length
    var avraddr = 0
    var client = mqtt.connect(MQTT_CONF)
    // client.subscribe(('/DEMESH/'+macADR+'/acknowledge', {qos:1}))
    client.subscribe('/DEMESH/+/acknowledge',{qos:1})
    var cmd = JSON.stringify(
            { "dst": macADR,
              "cmd": "avrota",
              "state": "recimg"
            })
              
    client.on('connect', function () {
        client.publish('/DEMESH/root/control', cmd, {qos:1})
    })
    client.on('message', function (topic,message) {
        var mesJson = JSON.parse(message)
        if (mesJson.mtype === 'avrota') {
            if(mesJson.state === 'recimg') {
                let avrdata = Buffer.from(firmware.slice(avraddr, avraddr+128), 'binary')
                let avrdataString = avrdata.toString('base64')
                var crc = crc32(avrdata)
                var crcNum = parseInt(crc, 16)
                if (crcNum >= 2**31) {
                    crcNum = crcNum - 2**32
                }
                var mes = JSON.stringify({
                    "dst": macAddr,
                    "cmd": "avrimg",
                    "avraddr": avraddr,
                    "avrdata": avrdataString,
                    "avrcrc": crcNum
                })
                client.publish('/DEMESH/root/control', mes, {qos:1})
            }
            else if (mesJson.state === 'running') {
                readInfo(macADR)
            }
        }
        else if (mesJson.mtype === 'avrimg' && mesJson.avrcrc==='ok') {
            avraddr = mesJson.avraddr+128
            if(avraddr <= byteLength) {
                let avrdata = Buffer.from(firmware.slice(avraddr, avraddr+128), 'binary')
                let avrdataString = avrdata.toString('base64')
                var crc = crc32(avrdata)
                var crcNum = parseInt(crc, 16)
                if (crcNum >= 2**31) {
                    crcNum = crcNum - 2**32
                }
                var mes = JSON.stringify({
                    "dst": macAddr,
                    "cmd": "avrimg",
                    "avraddr": avraddr,
                    "avrdata": avrdataString,
                    "avrcrc": crcNum
                })
                client.publish('/DEMESH/root/control', mes, {qos:1})
            }
            else {
                var mes = JSON.stringify({
                    "dst": macAddr,
                    "cmd": "avrota",
                    "state": "flash",
                    "avrimgcnt": byteLength
                })
                client.publish('/DEMESH/root/control', mes, {qos:1})
            }
        }
    })
    return res.json( new SuccessModel({'msg': 'Node ' + macADR + 'will download the Firmaware ' + fileName + 'now.', 'status': 202})
    )
});

module.exports = router;