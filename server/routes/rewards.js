var express = require('express');
var router = express.Router();
var bodyParser = require("body-parser");
var eth = require('./eth');

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

var fromAccount = null;
eth.web3.eth.getAccounts().then((accounts) => {
  fromAccount = accounts[0];
});

const ADMIN_ID = 1;

/* GET individual reward */
router.get('/:id', function(req, res, next) {
  res.json({"success":false});
});

/* GET my rewards owned list */
router.get('/ownedBy/:accountId', function(req, res, next) {
  res.json({"success":false});
});

/* GET my rewards vended list */
router.get('/vendedBy/:accountId', function(req, res, next) {
  res.json({"success":false});
});

/* GET my rewards available list */
router.get('/availableTo/:accountId', function(req, res, next) {
  res.json({"success":false});
});

/* POST create a reward */
router.post('/create', function(req, res, next) {
  res.json({"success":false});
});

/* POST create a reward */
router.put('/update', function(req, res, next) {
  res.json({"success":false});
});

/* POST create a reward */
router.delete('/destroy/:id', function(req, res, next) {
  res.json({"success":false});
});


module.exports = router;
