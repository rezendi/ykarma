class Api {  
  static loadCommunities() {
    return fetch('/communities', { credentials: 'include'})
      .then(response => {
        return response.json();
      }).catch(error => {
      return error;
    });
  }

  static loadCommunity(communityId) {
    return fetch(`/communities/${communityId}`, { credentials: 'include'})
      .then(response => {
        return response.json();
      }).catch(error => {
      return error;
    });
  }

  static loadAccountsFor(communityId) {
    return fetch(`/accounts/for/${communityId}`, { credentials: 'include'})
      .then(response => {
        return response.json();
      }).catch(error => {
      return error;
    });
  }

  static loadAccount(accountId) {
    return fetch(`/accounts/${accountId}`, { credentials: 'include'})
      .then(response => {
        return response.json();
      }).catch(error => {
      return error;
    });
  }

  static loadAccountForUser(user) {
    const authProvider = localStorage.getItem("authProvider");
    const additionalInfo = JSON.parse(localStorage.getItem("additionalUserInfo") || "{}")
    var handle = null;
    var url = user.email;
    if (authProvider === "twitter") {
      handle = "@" + additionalInfo.username;
      url = handle;
    }
    // console.log("url", url);
    return fetch(`/accounts/url/${url}`, { credentials: 'include'})
      .then(response => {
        return response.json().then((json) => {
          const vals = { ...user, yk: json, handle: handle };
          // console.log("vals", vals);
          return vals;
        });
      }).catch(error => {
      return error;
    });
  }

  static addTwitterHandle(handle) {
    return fetch('/accounts/addUrl', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
      body: JSON.stringify({ url: handle })
    }).catch(error => {
      return error;
    });
  }

  static removeTwitterHandle() {
    return fetch('/accounts/removeUrl', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
      body: JSON.stringify({ type: "twitter" })
    }).catch(error => {
      return error;
    });
  }

  
}

export default Api;