var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
  userid: String, 
  username: String,
  channelname: String,
  readednewsnumber: Number
});

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('activeusers', userSchema);

// make this available to our users in our Node applications
module.exports = User;