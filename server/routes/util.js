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
    let urlArray = urls.split(URL_SEPARATOR);
    for (var i in urlArray) {
      if (urlArray[i].startsWith("mailto:")) {
        return urlArray[i].replace("mailto:","");
      }
    }
  }
  return '';
}

function getSlackUrlForSameTeam(urls, comparisonUrls) {
  if (!urls || urls.indexOf("slack:") < 0) {
    return '';
  }
  if (!comparisonUrls || comparisonUrls.indexOf("slack:") < 0) {
    return getSlackUrlFrom(urls);
  }
  let urls1 = urls.split(URL_SEPARATOR);
  let urls2 = comparisonUrls.split(URL_SEPARATOR);
  for (var i in urlArray) {
    if (urls1[i].startsWith("slack:") && urls2.includes(urls1[i])) {
      return urls1[i];
    }
  }
  return '';
}

function getSlackUrlForTeam(urls, teamId) {
  if (urls && urls.indexOf("slack:") >= 0) {
    let urlArray = urls.split(URL_SEPARATOR);
    for (var i in urlArray) {
      if (urlArray[i].startsWith(`slack:${teamId}`)) {
        return urlArray[i];
      }
    }
  }
  return '';
}

function getSlackUserIdForTeam(urls, teamId) {
  let url = getSlackUrlForTeam(urls, teamId);
  if (!url) {
    return '';
  }
  return url.substring(url.indexOf("-")+1);
}

function getRewardInfoFrom(reward) {
  let metadata = reward.metadata ? reward.metadata : {'name':'n/a', 'description':'n/a'};
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
  getSlackUrlForTeam : getSlackUrlForTeam,
  getSlackUrlForSameTeam : getSlackUrlForSameTeam,
  getSlackUserIdForTeam : getSlackUserIdForTeam,
  getRewardInfoFrom: getRewardInfoFrom
};