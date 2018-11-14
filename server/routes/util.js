const URL = require('url').URL;

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (error) {
    log("error", error);
    return false;  
  }
}

function verifyURLs(urlsString) {
  var split = urlsString.split(",");
  for (var i = 0; i < split.length; i++) {
    if (!isValidUrl(split[i])) {
      log("invalid url", split[i]);
      return false;
    }
  }
  return true;
}

// TODO: real logging
function warn(a, b, c=null) {
  b ? console.warn(a,b) : console.warn(a);
}

function log(a, b, c=null) {
  if (c) { // if (!c) for verbose logging
    b ? console.log(a,b) : console.log(a);
  }
}

function debug(a, b, c=null) {
  if (c) { // if (!c) for verbose debug logging
    b ? console.log(a,b) : console.log(a);
  }
}

module.exports = {
  verifyURLs: verifyURLs,
  log:        log,
  debug:      debug,
  warn:       warn, 
};