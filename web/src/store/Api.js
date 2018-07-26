class Api {  
  static loadCommunities() {
    return fetch('/api/communities', { credentials: 'include'})
      .then(response => {
        return response.json();
    }).catch(error => {
      console.log("error", error);
      return error;
    });
  }

  static loadCommunity(communityId) {
    return fetch(`/api/communities/${communityId}`, { credentials: 'include'})
      .then(response => {
        return response.json();
    }).catch(error => {
      return error;
    });
  }

  static loadAccountsFor(communityId) {
    return fetch(`/api/accounts/for/${communityId}`, { credentials: 'include'})
      .then(response => {
        return response.json();
    }).catch(error => {
      console.log("error", error);
      return error;
    });
  }

  static loadAccount(accountId) {
    return fetch(`/api/accounts/${accountId}`, { credentials: 'include'})
      .then(response => {
        return response.json();
    }).catch(error => {
      console.log("error", error);
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
    return fetch(`/api/accounts/url/${url}`, { credentials: 'include'})
      .then(response => {
        return response.json().then((json) => {
          const vals = { ...user, yk: json, handle: handle };
          // console.log("vals", vals);
          return vals;
        });
    }).catch(error => {
      console.log("error", error);
      return error;
    });
  }

  static addUrl(url) {
    return fetch('/api/accounts/addUrl', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
      body: JSON.stringify({ url: url })
    }).catch(error => {
      console.log("error", error);
      return error;
    });
  }

  static removeUrl(type) {
    return fetch('/api/accounts/removeUrl', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
      body: JSON.stringify({ type: type })
    }).catch(error => {
      console.log("error", error);
      return error;
    });
  }

  static loadAvailableRewards() {
    return fetch('/api/rewards/available', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
    }).catch(error => {
      console.log("error", error);
      return error;
    });
  }

  static loadMyRewards() {
    return fetch('/api/rewards/my', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
    }).catch(error => {
      console.log("error", error);
      return error;
    });
  }

  static loadReward(rewardId) {
    return fetch('/api/rewards/reward/'+rewardId, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
    }).catch(error => {
      console.log("error", error);
      return error;
    });
  }

  
}

export default Api;