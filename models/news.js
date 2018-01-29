var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var newsSchema = new Schema({
  Text: String, 
  CreatedDate: Date,
  UpdatedDate: Date,
  PublishDate: Date,
  Contents: [{
      Text: String,
      CreatedDate: Date,
      PublishDate: Date,
      OrderNumber: Number
  }]
});

// the schema is useless so far
// we need to create a model using it
var News = mongoose.model('news', newsSchema);

// make this available to our users in our Node applications
module.exports = News;