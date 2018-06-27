const URL = require('url').URL;

const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (error) {
    console.log("error",error);
    return false;  
  }
}

function verifyURLs(urlsString) {
  var split = urlsString.split(",");
  for (var i = 0; i < split.length; i++) {
    if (!isValidUrl(split[i])) {
      console.log("invalid url",split[i])
      return false;
    }
  }
  return true;
}


module.exports = {
  verifyURLs: verifyURLs,
};