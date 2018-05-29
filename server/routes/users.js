var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  //res.send('respond with a resource');

  // And insert something like this instead:
  res.json(
  [{
      id: 1,
      username: "admin"
    }, {
      id: 2,
      username: "community admin"
    }, {
      id: 3,
      username: "vendor"
    }, {
      id: 4,
      username: "user"
    }
  ]);
});

module.exports = router;
