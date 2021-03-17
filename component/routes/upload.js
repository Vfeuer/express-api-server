var express = require('express');
var router = express.Router();
var fs = require("fs");
const { SuccessModel, ErrorModel } = require("../model/resModel")
var mqtt = require('mqtt')
const {MQTT_CONF} = require('../../conf/configuration')

router.post('/firmware', (req, res, next) => {
    const dirname = "D:\\vue\\Git\\UI-server\\public"

    var des_file = dirname + "/" + req.files[0].originalname; //destination folder and name of file
    return fs.readFile( req.files[0].path, function (err, data) {  // 异步读取文件内容
        return fs.writeFile(des_file, data, function (err) { // des_file是文件名，data，文件数据，异步写入到文件
            if( err ){
                console.log( err );
                return new ErrorModel({'msg': err, 'status': 400})
            } 
            else{
                var client = mqtt.connect(MQTT_CONF)
                message = JSON.stringify(
                    { "cmd": "upgrade",
                      "version": "6.4",
                      "board": "m5stick" }
                )
                client.on('connect', function () {
                    client.publish('/DEMESH/root/control', message, {qos:1})
                    console.log(message)
                    client.end()
                })
                return res.json( new SuccessModel({'msg': 'File ' + req.files[0].originalname +' uploaded successfully', 'status': 202})
            )}
        })
    })
});

module.exports = router;