## express-api-server for project AGCCS-CTRL22
This programm aims to develop the server and API-interface for the user interface of project AGCCS-CTRL22. It also contains the compiled user interface, which is running on port 80.

### Guidelines for Installation

##### Development environment
```
nodejs v14.15.3
npm v6.14.10 (compatibility of lower version hasn't been tested)
mysql v8.0.22(at least v5.5.53)
```

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