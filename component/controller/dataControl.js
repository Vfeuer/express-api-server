const {queryData, dataExec, escape} = require('../db/sqlite')
const {setPhase, setMaxCur} = require('./pubControl')

// ccss: OFFx: off, waiting for EV: Ax, negotiating power: Bx,
// charging: Cx, pausing Px, waiting for power: Wx, z: Error

// // function to register the mac address and id
const macReg = (macADR) => {
    macADR = escape(macADR)
    let sql = `select * from nodestatus where macADR = ${macADR};`
    return queryData(sql).then(rows =>{
        if(rows[0]){
            return false  // macADR is already registered
        }
        sql = `insert into nodestatus (macADR, workmode) values (${macADR}, 'auto');`
        return dataExec(sql).then(updateData =>{
            if (updateData.changes > 0) {
                return true
            }
            return false
        })
    })
}

// get the list of all nodes
const getList = () => {
    let sql = `select id, macADR from nodestatus;`
    return queryData(sql).then(rows =>{
        if(!rows[0]){
            return false  // no info from database
        }
        return rows
    })
}

// require for the info of node according to mac address
const getInfo = (macADR) => {
    macADR = escape(macADR)
    let sql = `select * from nodestatus where macADR = ${macADR};`
    return queryData(sql).then(rows =>{
        if(rows[0]){
            return rows
        }
        return false
    })
}

// update the currentvalue and phases of node which id=? and macADR=?
const currentUpdate = (id, macADR ,maxCur, cmaxCur, phases, cur1, cur2, cur3) => {
    id = escape(id)
    macADR = escape(macADR)
    maxCur = maxCur < 0 ? escape(0) : escape(maxCur/10)
    cmaxCur = cmaxCur < 0 ? escape(0) : escape(cmaxCur/10)
    phases = escape(phases)
    cur1 = cur1 < 0 ? escape(0) : escape(cur1/10)
    cur2 = cur2 < 0 ? escape(0) : escape(cur2/10)
    cur3 = cur3 < 0 ? escape(0) : escape(cur3/10)
    let sql = `update nodestatus set cmaxCur = ${cmaxCur}, Phases = ${phases},
    cur1 = ${cur1}, cur2 = ${cur2}, cur3 = ${cur3}, maxCur = ${maxCur} where id = ${id} and macADR = ${macADR};`
    return dataExec(sql).then(updateData =>{
        if (updateData.changes > 0) {
            return true 
        }
        return false // id and macADR do not match or no connection(no currentvalue received)
    })
}

// set connect to false when no connection to the node
const connectUpdate = (id, macADR, connect=false) => {
    let sql = ``
    id = escape(id)
    macADR = escape(macADR)
    if(connect) {
        connect = escape(connect)
        sql = `update nodestatus set connect = ${connect} where id = ${id} and macADR = ${macADR};`
    }
    else {
        // If one node lose connection, reset the workmode of node to auto
        connect = escape(connect)
        sql = `update nodestatus set connect = ${connect}, workmode = 'auto', Phases = 0, maxCur = 0, workStatus = 0,
        cur1 = 0, cur2 = 0, cur3 = 0, cmaxCur = 0, sPhases = 0, smaxCur = 0 where id = ${id} and macADR = ${macADR};`
    }
    return dataExec(sql).then(updateData => {
        return true
    })
}

const statusUpdate = (id, macADR, ccss) => {
    id = escape(id)

    // check whether workStatus is changed
    return getInfo(macADR).then(rows => {
        let sql = ``
        if(!rows[0]) {
            return false // no connection to database
        }
        // make no change and return if workStatus do not change.
        if(ccss === rows[0].workStatus) {
            return true 
        }
        // When charging ends up. reset workmode to auto, sphases and smaxCur to zero.
        if (ccss<10 && ccss>=0) {
            setPhase(macADR, 0)
            setMaxCur(macADR, 0)
            sql = `update nodestatus set workStatus = ${escape(ccss)}, workmode = 'auto', smaxCur = 0, sPhases = 0
            where id = ${id} and macADR = ${escape(macADR)};`
        }
        // When wait EV
        else {
            sql = `update nodestatus set workStatus = ${escape(ccss)} where id = ${id} and macADR = ${escape(macADR)};`
        }
        return dataExec(sql).then(updateData => {
            if(!updateData.changes) {
                return false // Database Error
            }
            return sumManCur().then(val1 => {
                if(val1) {
                    autoWork().then(val2 => {
                        if(val2) {
                            return true
                        }
                        return false
                    })
                }
                return false
            })    
        })
    })
}

const infoUpdate = (id, macADR, Parent = null,
    Rssi = null, Layer = null, Plat = null, Version = null, Board = null, avrVer = null) => {
    id = escape(id)
    macADR = escape(macADR)
    let sql = `update nodestatus set `
    if (Parent) {
        Parent = escape(Parent)
        sql+=`Parent=${Parent}, `
    }
    if (Rssi) {
        Rssi = escape(Rssi)
        sql+=`Rssi=${Rssi}, `
    }
    if (Layer) {
        Layer = escape(Layer)
        sql+=`Layer=${Layer}, `
    }
    if (Plat!==null) {
        Plat = escape(Plat)
        sql+=`Plat=${Plat}, `
    }
    if (Version) {
        Version = escape(Version)
        sql+=`Version=${Version}, `
    }
    if (Board) {
        Board = escape(Board)
        sql+=`Board=${Board}, `
    }
    if (avrVer!=null) {
        avrVer = escape(avrVer)
        sql+=`avrVer=${avrVer}, `
    }
    sql += `macADR=${macADR} where id=${id};`
    return dataExec(sql).then(updateData =>{
        if (updateData.changes > 0) {
            return true 
        }
        return false // id and macADR do not match or no connection(no currentvalue received)
    })
}

// calculate the total current that are supplied to manual mode in each phase
const sumManCur = () => {
    // usedCur: the power is supplied to the connected EV. totalCur: the power should be supplied to the node.
    var usedCur1 = 0
    var usedCur2 = 0
    var usedCur3 = 0
    var totalCur1 = 0
    var totalCur2 = 0
    var totalCur3 = 0
    let sql = `select id, macADR, smaxCur, sPhases, cmaxCur, workStatus
    from nodestatus where workmode='manual' and connect = 1 and workStatus between 10 and 60 order by id;`
    return queryData(sql).then(rows => {
        if(!rows[0]){ // No node in manual mode
            sql = `update meshsetting set usedCur1=0, usedCur2=0, usedCur3=0, totalCur1=0, totalCur2=0, totalCur3=0;`
            return dataExec(sql).then(updateData => {
                if (updateData.changes > 0) {
                    return true
                }
                return false // no connection
            })
        }
        var maxCur=0
        for (let i = 0; i < rows.length; i++) {
            if (rows[i].smaxCur > rows[i].cmaxCur && rows[i].cmaxCur>5) {
                rows[i].smaxCur = rows[i].cmaxCur
                sql = `update nodestatus set smaxCur = '${rows[i].cmaxCur}' where id = '${rows[i].id}' and macADR = '${rows[i].macADR}' `
                dataExec(sql)
            }
            rows[i].Phases = rows[i].sPhases.toString()
            maxCur = rows[i].smaxCur
            // when ccss is Ax -> wait Ev -> only calculate the totalCur
            if (rows[i].workStatus<20) {
                if (rows[i].Phases.indexOf("1") >= 0) {
                    totalCur1 += maxCur
                }
                if (rows[i].Phases.indexOf("2") >= 0) {
                    totalCur2 += maxCur
                }
                if (rows[i].Phases.indexOf("3") >= 0) {
                    totalCur3 += maxCur
                }
            }
            else if (rows[i].workStatus>=20) {
                 // when ccss is Bx -> negotiation -> set sPhases and smaxCur
                if (rows[i].workStatus<30) {
                    setMaxCur(rows[i].macADR, rows[i].smaxCur)
                    setPhase(rows[i].macADR, rows[i].sPhases)
                }
                if (rows[i].Phases.indexOf("1") >= 0) {
                    usedCur1 += maxCur
                    totalCur1 += maxCur
                }
                if (rows[i].Phases.indexOf("2") >= 0) {
                    usedCur2 += maxCur
                    totalCur2 += maxCur
                }
                if (rows[i].Phases.indexOf("3") >= 0) {
                    usedCur3 += maxCur
                    totalCur3 += maxCur
                }
            }
        }
        sql = `update meshsetting set usedCur1 = ${usedCur1}, usedCur2 = ${usedCur2}, usedCur3 = ${usedCur3},
        totalCur1 = ${totalCur1}, totalCur2 = ${totalCur2}, totalCur3 = ${totalCur3};`
        return dataExec(sql).then(updateData => {
            return true
        })
    })
}

// For Node in auto workmode
const autoWork = () => {
    return calRemain().then(remain => {
        let sql = `select id, macADR, cmaxCur from nodestatus where workmode='auto'
        and connect = 1 and workStatus between 20 and 60 order by cmaxCur;`
        return queryData(sql).then(rows => {
            // calculate the available average Current and number of cars in auto mode
            var autoNum = rows.length
            for (let j = 0; j < rows.length; j++) {
                if(!autoNum) {
                    break
                }
                var bestResult =calBestCur(autoNum, rows[j].cmaxCur, remain)
                setPhase(rows[j].macADR, Number(bestResult.Phases))
                setMaxCur(rows[j].macADR, bestResult.maxCur)
                remain = bestResult.remain
                autoNum = bestResult.autoNum
            }
            return true
        })
    })
}

// calculate the available remaining current and remaining phases
const calRemain = () => {
    let sql = `select * from meshsetting;`
    return queryData(sql).then(rows => {
        if(!rows[0]){
            return false // no connection with database
        }
        var Cur1 = rows[0].wholeMax-rows[0].usedCur1
        var Cur2 = rows[0].wholeMax-rows[0].usedCur2
        var Cur3 = rows[0].wholeMax-rows[0].usedCur3
        var totalRemain = calTotalRemain(Cur1,Cur2,Cur3)
        var CurSum = totalRemain.CurSum
        var Phase = totalRemain.Phase
        return [Phase, Cur1, Cur2, Cur3, CurSum]
    })
}

// calculate the available remaining phases
const calTotalRemain = (Cur1,Cur2,Cur3) =>{
    var Phase = ''
    var CurSum = 0
    if (Cur1>=5) {
        Phase+="1"
        CurSum+=Cur1
    }
    if (Cur2>=5) {
        Phase+="2"
        CurSum+=Cur2
    }
    if (Cur3>=5) {
        Phase+="3"
        CurSum+=Cur3
    }
    return {Phase, CurSum}
}

// calculate the biggest available remaining current and its phase
const calBigRemain = (Cur1, Cur2, Cur3) => {
    var Cur = Cur1
    var Phase = '1'
    if (Cur < Cur2) {
        Cur = Cur2
        Phase = '2'
    }
    if (Cur < Cur3) {
        Cur = Cur3
        Phase = '3'
    }
    if (Cur < 5) {
        Cur = 0
        Phase = ''
    }
    return {Cur, Phase}
}

// calculate the smallest available remaining current and its phase
const calSmallRemain = (Cur1, Cur2, Cur3) => {
    var Cur = Cur1
    var Phase = '1'
    if (Cur > Cur2) {
        Cur = Cur2
        Phase = '2'
    }
    if (Cur > Cur3) {
        Cur = Cur3
        Phase = '3'
    }
    if (Cur < 5) {
        Cur = 0
        Phase = '0'
    }
    return {Cur, Phase}
}

// calculate the best current value and its phases for the node based on the averageCur
const calBestCur = (autoNum, cmaxCur, remain) => {
    var Phases = ''
    var maxCur = 0
    var phasesArray = new Array()
    var curArray = new Array()
    var PhaseNum= 0
    var averageCur = 0
    for (let i = 0; i < autoNum; i++) {
        averageCur = remain[4] / autoNum
        if(averageCur>=5) {
            break
        }
        autoNum--
}
    // case1: allocate the current as average current as possible
    for (let x = 0; x < remain[0].length; x++) {
            PhaseNum = remain[0].length-x
            phasesArray[0] = ''
            if( (averageCur/PhaseNum) < cmaxCur && (averageCur/PhaseNum)>=5 ) {
                curArray[0] = averageCur/PhaseNum
                if( (remain[0].indexOf('1') >= 0) && PhaseNum && (remain[1]-curArray[0]>=0)) {
                    PhaseNum--
                    phasesArray[0]+='1'
                }
                if( (remain[0].indexOf('2') >= 0) && PhaseNum && remain[2]-curArray[0]>=0) {
                    PhaseNum--
                    phasesArray[0]+='2'
                }
                if( (remain[0].indexOf('3') >= 0) && PhaseNum && remain[3]-curArray[0]>=0) {
                    PhaseNum--
                    phasesArray[0]+='3'
                }
                break
            }
            else if ((averageCur/PhaseNum) >= cmaxCur) {
                var bigRemain = calBigRemain(remain[1],remain[2],remain[3])
                curArray[0] = cmaxCur
                // allocate Current start with the biggest remaining Current and its Phase
                if (remain[0].indexOf(bigRemain.Phase) >= 0
                && remain[Number(bigRemain.Phase)]>=cmaxCur && PhaseNum) {
                    phasesArray[0]+=bigRemain.Phase
                    PhaseNum--
                }
                if (bigRemain.Phase.indexOf('1')<0 && remain[0].indexOf('1') >=0
                && remain[1] >=cmaxCur && PhaseNum) {
                    phasesArray[0]+='1'
                    PhaseNum--
                }
                if (bigRemain.Phase.indexOf('2')<0 && remain[0].indexOf('2') >=0
                && remain[2] >=cmaxCur && PhaseNum) {
                    phasesArray[0]+='2'
                    PhaseNum--
                }
                if (bigRemain.Phase.indexOf('3')<0 && remain[0].indexOf('3') >=0
                && remain[3] >=cmaxCur && PhaseNum) {
                    phasesArray[0]+='3'
                    PhaseNum--
                }
                break
            }
    }

    // case2: one of the remaining current is too high so that the averageCur is too high
    curArray[1] = calSmallRemain(remain[1],remain[2],remain[3]).Cur
    phasesArray[1] = remain[0]
    if (curArray[1] > cmaxCur) {
        curArray[1] = cmaxCur
    }

    // case3: based on the result of case1, after allocation, one remaining current is less than 5A
    // and thus the average current will lead to a lower efficiency
    if (phasesArray[0].length) {
        curArray[2] = remain[Number(phasesArray[0][0])]
    }
    else {
        curArray[2] = 0
    }
    phasesArray[2] = phasesArray[0]
    for (let j = 1; j < phasesArray[0].length; j++) {
        if ( (curArray[2]) > remain[Number(phasesArray[0][j])]) { 
            curArray[2] = remain[Number(phasesArray[0][j])]
        }
    }
    if (curArray[2]-curArray[0]>=5) {
        curArray[2] = 0
    }
    else if (averageCur < curArray[2]*phasesArray[2].length){
        averageCur = curArray[2]*phasesArray[2].length
    }

    // case4: one of the remaining current is too high so that only this phase should be count on
    bigRemain = calBigRemain(remain[1],remain[2],remain[3])
    phasesArray[3] = bigRemain.Phase
    curArray[3] = bigRemain.Cur
    if (curArray[3] > cmaxCur) {
        curArray[3] = cmaxCur
    }
  


    // select the most effectiv current value and phases
    maxCur = curArray[0]
    Phases = phasesArray[0]
    for (let i = 1; i < curArray.length; i++) {
        if ((maxCur*Phases.length) < (curArray[i]*phasesArray[i].length) 
        && ((curArray[i]*phasesArray[i].length)<= averageCur)) {
            maxCur = curArray[i]
            Phases = phasesArray[i]
        }
    }
    if (Phases.indexOf('1')>=0) {
        remain[1]-=maxCur
    }
    if (Phases.indexOf('2')>=0) {
        remain[2]-=maxCur
    }
    if (Phases.indexOf('3')>=0) {
        remain[3]-=maxCur
    }

    totalRemain = calTotalRemain(remain[1],remain[2],remain[3])
    remain[0] = totalRemain.Phase
    remain[4] = totalRemain.CurSum
    autoNum--
    return {Phases, maxCur, remain, autoNum}
}



module.exports = {
    macReg,
    getList,
    currentUpdate,
    connectUpdate,
    calRemain,
    statusUpdate,
    sumManCur,
    autoWork,
    getInfo,
    infoUpdate
}