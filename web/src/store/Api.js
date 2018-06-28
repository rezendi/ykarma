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
    return fetch(`/accounts/url/${user.email}`, { credentials: 'include'})
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