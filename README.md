## express-api-server for project AGCCS-CTRL22
This programm aims to develop the server and API-interface for the user interface of project AGCCS-CTRL22. It also contains the compiled user interface, which is running on port 80.

The whole work is developed based on nodejs and uses express as web framework. Now it contains the following 3 main functions:

1. Contact nodes with MQTT. This function is mainly compiled by pubcontrol.js, subcontrol.js and initcontrol.js. The needed mqtt server should be created by raspberry Pi with mosquitto (default adrress is 192.168.5.1 and port is 1884, which is defined in configuration.js in forlder 'conf').
2. Read data and information of node from the database or store data and imformation that is sent by nodes via mqtt.

### Guidelines for Installation

##### Development environment
```
nodejs v14.15.3
npm v6.14.10 (compatibility of lower version hasn't been tested)
mysql v8.0.22(at least v5.5.53) or MariaDB v10.0.28 (for rasbian) 
redis v5.0.3
```

##### Project setup
```
npm install
npm install --save cross-env
npm install --save-dev nodemon
npm install --save pm2
```
##### Instruction for source the database
```
mysql -uroot -proot 
(default user and password, which can be changed in configuration.js in folder 'conf')

Command for MariaDB:
use mysql;
update user set authentication_string=password('root'),plugin='mysql_native_password' where user='root';
create database chargingpark;
use chargingpark;
source XXX/conf/chargingpark.sql; (replace XXX with proper path)

Command for mysql:
alter user 'root'@'localhost' identified with mysql_native_password by '123456';
create database chargingpark;
use chargingpark;
source XXX/conf/chargingpark.sql; (replace XXX with proper path)

```
notes: 
The default username and password to login is 'admin' and '123456', which now are unchangeable at first run. After first login, they can be modified in the userface, that is realized in 'user setting'.
There is also a default max Current value for the whole mesh, which is settled as 100A and can be changed in 'mesh setting'

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
