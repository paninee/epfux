var mongoose = require('mongoose');

var invitationSchema = new mongoose.Schema({
  funeralHome: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FuneralHome',
    required: true
  },
  email: {type: String, required: true, unique: true, trim: true},
  active: {type: Boolean, default: true},
  createdAt: {type: Date, default: Date.now}
});

var invitationModel = mongoose.model('Invitation', invitationSchema);

exports.model = invitationModel;
exports.schema = invitationSchema;
