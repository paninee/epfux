module.exports = function (express, passport, io) {
    var router = express.Router();
    var InvitationModel = require('../invitation/invitation-model').model;
    var authentication = require('../../shared/authentication/authentication');
    require('../../shared/msg');
  
    router.get('/', async (req, res) => {
        try{
            let invitation = await InvitationModel.find({funeralHome: req.session.home._id})
            res.status(200).json({invitation: invitation});
        } catch(err){
            res.status(400).json({title: 'Error', msg: 'Error'});
        }
    });
  
    return router;
  };
  