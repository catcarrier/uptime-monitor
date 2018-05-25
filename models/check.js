var mongoose = require('mongoose');

const checkSchema = mongoose.schema({
	_id: mongoose.Schema.Types.ObjectId,
	protocol: {
        type: String,
        required: [true, 'protocol is required'],
		enum: ['http', 'https']
	},
	url: {
		type: String, 
		required: [true, 'url is required']
	},
	method: {
        type: String,
        enum: ['GET','PUT','POST','DELETE','OPTIONS','HEAD','TRACE','CONNECT'],
        required: [true, 'method is required']
    },
    successCodes: {
        type: Array,
        required: [true, 'One or more success codes is required']
    },
    timeoutSeconds : {
        type: Number,
        required: [true, 'Timeout seconds is required']
    }

});

module.exports = mongoose.model('Check', checkSchema);