//for authentication

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    uname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    }
});

//this is going to add on to our schema a user name,a field for password,its going to make sure that those usernames are unique 
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);