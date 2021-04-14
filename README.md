## express-api-server for project AGCCS-CTRL22
This programm aims to develop the server and API-interface for the user interface of project AGCCS-CTRL22. It also contains the compiled user interface, which is running on port 8071 (could be edited in the app.js L26).

The whole work is developed based on nodejs and uses express as web framework. Now it contains the following 3 main functions:

1. Contact nodes with MQTT. This function is mainly compiled by pubcontrol.js, subcontrol.js and initcontrol.js. The needed mqtt server should be created by raspberry Pi with mosquitto (default adrress is 192.168.5.1 and port is 1884, which is defined in configuration.js in forlder 'conf').
2. Read data and information of node from the database or store data and imformation that is sent by nodes via mqtt.
3. Upload the firmware of ESP32 (which now is specific m5stick). The uploaded firmware will be stored in the folder 'public'. So in order to operate successfully, the parameter 'dirName' in the configuration.js(in folder 'conf') should be the same path of the folder 'public'. The ESP32 should be able send a http-get-request to the your ipadress:8071. 
4. Create subuser to check all the data and change the password of users. Subuser has no authority to operate.

### Guidelines for Installation

##### Development environment
```
nodejs v14.15.3
npm v6.14.10 (compatibility of lower version hasn't been tested)
redis v5.0.3
```

##### Project setup
```
npm install
npm install --save cross-env
npm install --save slite3
npm install --save-dev nodemon
npm install --save pm2
```

##### Instruction for Redis
```
For raspberry Pi:
sudo nano /etc/redis/redis.conf
find "bind 127.0.0.1 ::1"
replace with "#bind 127.0.0.1 ::1"
sudo service redis-server restart
redis-server
```

##### Compiles for development
```
npm run dev
```
notes: There is always an error about getting /favicon.ico with raspberry Pi. I have eliminated it on windows system. But it is still there on rasbian. But it can be ignored.

##### Compiles for production
```
npm run prd
```
