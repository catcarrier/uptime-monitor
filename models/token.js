var mongoose = require('mongoose');

const tokenSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    phone: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 10
    },
    tokenValue: {
        type: String,
        required: true,
        minlength: 20,
        maxlength: 20
    },
    expires: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('Token', tokenSchema);