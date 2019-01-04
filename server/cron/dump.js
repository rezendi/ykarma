#! /usr/bin/env node

require('dotenv').config();

var eth = require('../routes/eth');

// dump all data from the YKarma contracts into a JSON file, so we can recreate it in new contracts
// this beats trying to write a custom ALTER TABLE equivalent each time the contracts change...

