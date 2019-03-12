var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({ 'hello' : req.t('world') });
});

module.exports = router;
