class Api {  
  static loadCommunities() {
    return fetch('/communities')
      .then(response => {
        return response.json();
      }).catch(error => {
      return error;
    });
  }

  static loadCommunity(communityId) {
    return fetch(`/communities/${communityId}`)
      .then(response => {
        return response.json();
      }).catch(error => {
      return error;
    });
  }

  static loadAccountsFor(communityId) {
    return fetch(`/accounts/for/${communityId}`)
      .then(response => {
        return response.json();
      }).catch(error => {
      return error;
    });
  }

  static loadAccount(accountId) {
    return fetch(`/accounts/${accountId}`)
      .then(response => {
        return response.json();
      }).catch(error => {
      return error;
    });
  }

  static loadAccountForUser(user) {
    return fetch(`/accounts/url/${user.email}`)
      .then(response => {
        return response.json().then((json) => {
          return  { ...user, yk: json };
        });
      }).catch(error => {
      return error;
    });
  }

  static setToken(user) {
    // TODO ensure this is HTTPS
    return user.getIdToken(/* forceRefresh */ true).then(function(idToken) {
      fetch('/accounts/token/set', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
        body: JSON.stringify({ ykid: user.ykid, token: idToken })
      });
    }).catch(error => {
      return error;
    });
  }

}

export default Api;