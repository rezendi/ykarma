const URL = require('url').URL;

const URL_SEPARATOR = ' ';
const OLD_URL_SEPARATOR = '||';

const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';
const BYTES_ZERO = '0x0000000000000000000000000000000000000000000000000000000000000000';

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
function warn(a, b) {
  b ? console.warn(a,b) : console.warn(a);
}

function log(a, b) {
  if (process.env.NODE_ENV==="test" || (""+process.env.LOG_LEVEL).indexOf("LOG") >= 0) {
    b ? console.log(a,b) : console.log(a);
  }
}

function debug(a, b) {
  if (process.env.NODE_ENV==="test" || (""+process.env.LOG_LEVEL).indexOf("DEBUG") >= 0) {
    b ? console.log(a,b) : console.log(a);
  }
}

function getEmailFrom(urls) {
  if (urls && urls.indexOf("mailto:") >= 0) {
    const urlArray = urls.split(URL_SEPARATOR);
    for (var i in urlArray) {
      if (urlArray[i].startsWith("mailto:")) {
        return urlArray[i].replace("mailto:","");
      }
    }
  }
  return '';
}

// TODO actually implement this
function getSlackUrlForSameTeam(urls, comparisonUrls) {
  return getSlackUrlFrom(urls);
}

// TODO actually implement this
function getSlackUrlForTeam(urls, teamId) {
  return getSlackUrlFrom(urls);
}

function getSlackUrlFrom(urls) {
  if (urls && urls.indexOf("slack:") >= 0) {
    const urlArray = urls.split(URL_SEPARATOR);
    for (var i in urlArray) {
      if (urlArray[i].startsWith("slack:")) {
        return urlArray[i];
      }
    }
  }
  return '';
}

// TODO actually implement this
function getSlackUserIdForTeam(urls, teamId) {
  return getSlackUserIdFrom(urls);
}

function getSlackUserIdFrom(urls) {
  let url = getSlackUrlFrom(urls);
  if (url && url.indexOf("-") > 0) {
    return url.substring(url.indexOf("-")+1);
  }
  return url;
}

function getRewardInfoFrom(reward) {
  const metadata = reward.metadata ? reward.metadata : {'name':'n/a', 'description':'n/a'};
  return `${metadata.name} -- ${metadata.description ? metadata.description : ''} (id: ${reward.id}, cost: ${reward.cost})`;
}


module.exports = {
  verifyURLs: verifyURLs,
  log:        log,
  debug:      debug,
  warn:       warn,
  separator:  URL_SEPARATOR,
  oldSeparator: OLD_URL_SEPARATOR,
  ADDRESS_ZERO: ADDRESS_ZERO,
  BYTES_ZERO: BYTES_ZERO,
  getEmailFrom : getEmailFrom,
  getSlackUrlFrom : getSlackUrlFrom,
  getSlackUserIdFrom : getSlackUserIdFrom,
  getRewardInfoFrom: getRewardInfoFrom
};