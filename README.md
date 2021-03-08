## express-api-server for project AGCCS-CTRL22

### Guidelines for Installation

##### Development environment
nodejs v14.15.3
npm v6.14.10 (compatibility of lower version hasn't been tested)
mysql v8.0.22

##### Project setup
```
npm install
npm install --save-dev nodemon
npm install --save-dev pm2
```

##### Compiles for development
```
npm run dev
```

##### Compiles for production
```
npm run prd
```

##### Requirement
Local mysql-database are required to run this api-server, which is included in the folder config.
