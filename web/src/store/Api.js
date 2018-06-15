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
}

export default Api;