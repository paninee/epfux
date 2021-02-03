var mongoose = require('mongoose');

var serviceCategorySchema = new mongoose.Schema({
  name: {type: String, required: true},
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date, default: Date.now}
});

serviceCategorySchema.pre('update', function (next) {
  var query = {
    $set: {
      updatedAt: Date.now()
    }
  };
  this.update({}, query);
  next();
});

serviceCategorySchema.pre('findOneAndUpdate', function(next) {
  var query = {
    $set: {
      updatedAt: Date.now()
    }
  };
  this.findOneAndUpdate({}, query);
  next();
});

var serviceCategoryModel = mongoose.model('ServiceCategory', serviceCategorySchema);

exports.model = serviceCategoryModel;
exports.schema = serviceCategorySchema;
