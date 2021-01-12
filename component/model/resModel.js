class baseModel {
    constructor(meta, data){
        if (typeof data === 'string'){
            this.meta.msg = data
            data = null
            meta = null
        }
        if (data) {
            this.data = data
        }
        if(meta) {
            this.meta = meta
        }
    }
}

class SuccessModel extends baseModel {
    constructor(meta, data) {
        super(meta, data)
        this.errno = 0
    }
}

class ErrorModel extends baseModel {
    constructor(meta, data) {
        super(meta, data)
        this.errno = -1
    }
}

module.exports = {
    SuccessModel,
    ErrorModel
}