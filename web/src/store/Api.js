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
    const authProvider = sessionStorage.getItem("authProvider");
    const url = authProvider === "email" ? user.email : "@" + JSON.parse(sessionStorage.getItem("additionalUserInfo")).username;
    console.log("url", url);
    return fetch(`/accounts/url/${url}`, { credentials: 'include'})
      .then(response => {
        return response.json().then((json) => {
          return  { ...user, yk: json };
        });
      }).catch(error => {
      return error;
    });
  }

}

export default Api;