module.exports = function (express, passport, io) {
  var router = express.Router();
  var BookingModel = require('./booking-model').model;
  var FuneralHomeModel = require('../funeral-home/funeral-home-model').model;
  var authentication = require('../../shared/authentication/authentication');
  var util = require('../../shared/util');
  var async = require('async');
  var _ = require('lodash');
  const { Parser } = require('json2csv');
  var stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  var sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  var moment = require('moment');
  require('../../shared/msg');

  let calculateBooking = (home, services, discountAmount, discountPercentage) => {
    let subTotal = _.sumBy(services, 'price');
    home.taxPercentage = home.taxPercentage ? home.taxPercentage : 0;
    if(discountAmount) {
      subTotal -= discountAmount;
    }
    if(discountPercentage) {
      subTotal -= (subTotal * discountPercentage / 100);
    }
    let tax = subTotal * home.taxPercentage / 100;
    return {
      subTotal: _.round(subTotal, 2),
      tax: _.round(tax, 2),
      total: _.round(subTotal + tax, 2)
    }
  };


  router.get('/metadata', authentication.isSignedIn, function (req, res) {

    let invoiceStatus = BookingModel.schema.paths.invoiceStatus.enumValues;
    let deceasedGender = BookingModel.schema.paths.deceasedGender.enumValues;
    let deceasedMaritalStatus = BookingModel.schema.paths.deceasedMaritalStatus.enumValues;
    let familyMembers = BookingModel.schema.relationshipDeceased;
    let eventsType = BookingModel.schema.eventsType;

    res.json({
      invoiceStatus: invoiceStatus.filter((item) => item.length !== 0),
      deceasedGender: deceasedGender.filter((item) => item.length !== 0),
      deceasedMaritalStatus: deceasedMaritalStatus.filter((item) => item.length !== 0),
      familyMembers: familyMembers.filter((item) => item.length !== 0),
      eventsType: eventsType.filter((item) => item.length !== 0)
    });

  });

  router.get('/', authentication.isSignedIn, function (req, res) {
    var isFiltered = false;
    var query = {
      home: req.session.home._id
    };
    var options = {
      sort: '-contractNo'
    };
    if (req.query.q) {
      isFiltered = true;
      query.$or = [{
        contractNo: new RegExp('.*' + req.query.q + '.*', 'i')
      }, {
        clientName: new RegExp('.*' + req.query.q + '.*', 'i')
      }, {
        deceasedName: new RegExp('.*' + req.query.q + '.*', 'i')
      }];
    }
    if (req.query.skip) {
      options.skip = parseInt(req.query.skip);
    }
    if (req.query.limit) {
      options.limit = parseInt(req.query.limit);
    }
    if (req.query.from && req.query.to) {
      isFiltered = true;
      let from = moment(req.query.from).toDate();
      let to = moment(req.query.to).toDate();
      query.serviceStart = {
        $gte: from,
        $lte: to
      };
    }
    BookingModel.find(query, null, options).populate('services.vendor employeeAssignments.employee createdBy')
      .exec((err, bookings) => {
        if (err) {
          util.sendDbError('Booking', 'find', err, res);
        } else {
          if(isFiltered){
            res.status(200).json({bookings: bookings, total: bookings.length});
          } else {
            BookingModel.count(query, (err, count) => {
              if (err) {
                util.sendDbError('Booking', 'count', err, res);
              } else {
                res.status(200).json({bookings: bookings, total: count});
              }
            });
          }
        }
      });
  });

  router.get('/export/csv', authentication.isSignedIn, (req, res) =>{

    let query = {
      home: req.session.home._id
    };

    BookingModel.find(query).populate('services.vendor employeeAssignments.employee')
      .exec((err, bookings) => {
        if (err) {
          util.sendDbError('Booking', 'find', err, res);
        } else {
          const fields = [
            {
              label: "Contract No",
              value: "contractNumber"
            },
            {
              label: "Contact Name",
              value: "client_Name"
            },
            {
              label: "Contact email",
              value: "client_Email"
            },
            {
              label: "Contact phone number",
              value: "client_PhoneNo"
            },
            {
              label: "Client relationship to deceased",
              value: "client_RelationshipDeceased"
            },
            {
              label: "Service start date",
              value: "service_Start"
            },
            {
              label: "Service end date",
              value: "service_End"
            },
            {
              label: "Deceased name",
              value: "deceased_Name"
            },
            {
              label: "Date of death",
              value: "date_OfDeath"
            },
            {
              label: "Service location",
              value: "service_Location"
            },
            {
              label: "Obituary",
              value: "eulogy_text"
            },
            {
              label: "Discount amount",
              value: "discount_Amount"
            },
            {
              label: "Discount percentage",
              value: "discount_Percentage"
            },
            {
              label: "Discount reason",
              value: "discount_Reason"
            },
            {
              label: "Sub total",
              value: "sub_Total"
            },
            {
              label: "Total",
              value: "total_text"
            },
            {
              label: "Invoice status",
              value: "invoice_Status"
            },
            {
              label: "Payment confirmation",
              value: "payment_Confirmation"
            },
            {
              label: "Employee assignment",
              value: "employee_data"
            },
            {
              label: "Service name",
              value: "services.name"
            },
            {
              label: "Service price",
              value: "services.price"
            },
            {
              label: "Vendor",
              value: "services.vendor.name"
            }
          ];

          let newBooking = bookings
          .map((item) => {
            item.contractNumber = item.contractNo;
            item.client_Name = item.clientName;
            item.client_Email = item.clientEmail;
            item.client_PhoneNo = item.clientPhoneNo;
            item.client_RelationshipDeceased = item.clientRelationshipDeceased;
            item.service_End =  parseDate(item.serviceEnd);
            item.date_OfDeath = parseDate(item.dateOfDeath);
            item.service_Start = parseDate(item.serviceStart);
            item.deceased_Name = item.deceasedName;
            item.service_Location = item.serviceLocation;
            item.eulogy_text = item.eulogy;
            item.discount_Amount = item.discountAmount;
            item.discount_Percentage = item.discountPercentage;
            item.discount_Reason = item.discountReason;
            item.sub_Total = item.subTotal;
            item.total_text = item.total;
            item.invoice_Status = item.invoiceStatus;
            item.payment_Confirmation = item.paymentConfirmation;
            item.employee_data = parseEmployee(item.employeeAssignments);
            return item;
          });

          const json2csvParser = new Parser({ fields, unwind: ['services'], unwindBlank: true });
          const csv = json2csvParser.parse(newBooking);
          res.attachment('bookings.csv');
          res.status(200).send(csv);
        }
      });

  });

  router.post('/', authentication.isSignedIn, function (req, res) {
    req.session.home.contractNoCount++;
    var bookingObj = new BookingModel(req.body.booking);
    bookingObj.home = req.session.home._id;
    bookingObj.contractNo = _.padStart(req.session.home.contractNoCount, 4, '0');
    _.each(bookingObj.notes, note => { // Assigning notes
      note.createdBy = req.user.id;
    });
    // Calculate invoice
    let invoiceAmount = calculateBooking(req.session.home, bookingObj.services, bookingObj.discountAmount || undefined, bookingObj.discountPercentage || undefined);
    bookingObj.subTotal = invoiceAmount.subTotal;
    bookingObj.tax = invoiceAmount.tax;
    bookingObj.total = invoiceAmount.total;
    bookingObj.createdBy = req.user.id;
    bookingObj.save(function (err) { // Save booking to Mongo
      if (err) {
        util.sendDbError('Booking', 'save', err, res);
      } else {
        FuneralHomeModel.findByIdAndUpdate(req.session.home._id, {
          contractNoCount: req.session.home.contractNoCount
        }).exec();
        res.status(200).json({booking: bookingObj});
      }
    });
  });

  router.post('/calculate', authentication.isSignedIn, function (req, res) {
    let invoiceAmount = calculateBooking(req.session.home, req.body.services, req.body.discountAmount || undefined, req.body.discountPercentage || undefined);
    res.status(200).json(invoiceAmount);
  });

  router.post('/pay', authentication.isSignedIn, async (req,res) => {
    if(req.body.token && req.body.services && req.session.home.payout) {
      try {
        let charge = await chargeStripe(req);
        if (req.body.booking_id){
          let booking = await BookingModel.findById(req.body.booking_id);
          booking.paidAmount = booking.paidAmount + req.body.paidAmount;
          booking.invoiceStatus = req.body.invoiceStatus;
          booking.payment = {
            sourceId: charge.id,
            last4: charge.source.last4,
            type: charge.source.brand
          };
          let newBooking = await booking.save();
          return res.status(200).json({paymentConfirmation: charge.id,booking:newBooking});
        } else {
          return res.status(200).json({paymentConfirmation: charge.id, payment: charge.source});
        }
      } catch(err){
        let statusCode = err.raw ? err.raw.statusCode : 400;
        let msg = err.raw ? err.raw.code : err.message;
        return res.status(statusCode).json({title: 'Payment failed', msg: msg});
      }
    } else {
      res.status(ERRORS.MissingRequiredData.code).json({
        code: 400,
        name: 'MISSING_DATA',
        title: 'Payout is not set',
        msg: 'Please set a payout method in the Settings page before charging for an invoice.'
      });
    }
  });

  router.post('/email', authentication.isSignedIn, function(req,res) {
    let data = req.body.data ? req.body.data : null;
    let templateId = req.body.identifier === 'invoice' ? process.env.INVOICE_TEMPLATE : process.env.OBLITUARY_TEMPLATE;
    let subject = req.body.identifier === 'invoice' ? 'Epilog Invoice' : 'Obituary';
    if (!data) {
      res.status(ERRORS.MissingRequiredData.code).json(ERRORS.MissingRequiredData);
    } else {
      try{
        const msg = {
          to: data.clientEmail,
          from: 'no-reply@epilog.me',
          templateId: templateId,
          dynamic_template_data: {
            subject: subject,
            data : data
          },
        };
        sgMail.send(msg);
        res.status(200).json({sent : true});
      } catch(err){
        console.log(err,"=====")
      }
    }
  });

  router.put('/', authentication.isSignedIn, function (req, res) {
    var booking = req.body.booking;
    BookingModel.findByIdAndUpdate(booking._id, booking, {new: true}, (err, booking) => {
      if (err) {
        util.sendDbError('Booking', 'findByIdAndUpdate', err, res);
      } else {
        res.status(200).json({booking: booking});
      }
    });
  });

  router.delete('/:bookingId', authentication.isHomeStaff, function (req, res) {
    var bookingId = req.params.bookingId;

    BookingModel.deleteOne({_id: bookingId}, (err) => {
      if (err) {
        util.sendDbError('booking', 'deleteOne', err, res);
      } else {
        res.status(200).json({});
      }
    });
  });

  let parseDate = (date) => {
    if (date){
      date = typeof date === Object ? date.toString() : new Date (date);
      let dd = date.toISOString();
      let newDate = moment(dd).format('LL');
      return newDate;
    }
  };

  let parseEmployee = (data) => {
    if (data){
      let strServices = "";
      for (let key in data){
        strServices = strServices.concat(`Employee: ${data[key].employee.email}, Assignment: ${data[key].assignment}, `);
      }
      return strServices;
      }
  };

  let chargeStripe = (req) => {
    return new Promise((resolve,reject) => {
      stripe.charges.create({
        amount: _.round(req.body.paidAmount * 100),
        currency: req.session.home.currency,
        source: req.body.token
      },{
        stripe_account: req.session.home.payout.account
      },(err,charge) => {
        if (err){
          reject(err);
        } else {
          resolve(charge);
        }
      });
    });
  };

  return router;
};
