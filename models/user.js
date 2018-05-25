var mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    hashedPassword: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('User', userSchema);