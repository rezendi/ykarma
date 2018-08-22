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
function log(a,b,c) {
  if (c!==0) { // take this out for verbose logging
    console.log(a,b);
  }
}

module.exports = {
  verifyURLs: verifyURLs,
  log:        log,
};