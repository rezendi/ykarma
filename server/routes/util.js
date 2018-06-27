const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;  
  }
}

function verifyURLs(urls) {
  for (var url in urls.split(",")) {
    if (!isValidUrl(url)) {
      return false;
    }
  }
  return true;
}


module.exports = {
    isValidUrl: isValidUrl,
};