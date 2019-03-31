class Api {
  
  /* Redux actions */
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
    return fetch(`/api/accounts/account/${accountId}`, { credentials: 'include'})
      .then(response => {
        return response.json();
    }).catch(error => {
      console.log("error", error);
      return error;
    });
  }

  static loadMyYKAccount() {
    return fetch('/api/accounts/me', { credentials: 'include'})
    .then(response => {
      return response.json().then((json) => {
        console.log("me json", json);
        return json;
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

  static loadOwnedRewards() {
    return fetch('/api/rewards/my', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
    }).catch(error => {
      console.log("error", error);
      return error;
    });
  }

  static loadVendedRewards() {
    return fetch('/api/rewards/vended', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
    }).catch(error => {
      console.log("error", error);
      return error;
    });
  }

  static loadRewardsVendedBy(vendorId) {
    return fetch('/api/rewards/vendedBy/'+vendorId, {
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

  static loadAllTranches() {
    return fetch('/api/accounts/full', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
    }).catch(error => {
      console.log("error", error);
      return error;
    });
  }

  static fetchMessages(messageIds) {
    return fetch('/api/accounts/translateMessageIds', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
      body: JSON.stringify({ messageIds: messageIds })
    }).catch(error => {
      console.log("error", error);
      return error;
    });
  }

  /* Internal to components */
  static giveKarma(ykid, values) {
    return fetch('/api/accounts/give', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
      body: JSON.stringify({
        id:         ykid,
        recipient:  values.recipient,
        amount:     values.coins,
        message:    values.message,
      })
    });
  }
  
  static updateAccount(id, values) {
    return fetch('/api/accounts/update', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
      body: JSON.stringify({
        account: {
          id: id,
          metadata: {
            name: values.name,
            emailPrefs: values.prefs,
          }
        }
      })
    });
  }
  
  static upsertCommunity(values) {
    return fetch(values.id===0 ? '/api/communities/create' : '/api/communities/update', {
      method: values.id===0 ? 'POST' : 'PUT',
      credentials: 'include',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
      body: JSON.stringify({
        community: {
          id: values.id,
          domain: values.domain,
          strict: values.strict,
          metadata: {
            name: values.name,
            description: values.description
          }
        }
      })
    });
  }

  static upsertReward(values) {
    var body = JSON.stringify({
      reward: {
        id: values.id,
        cost: parseInt(values.cost, 10),
        quantity: parseInt(values.quantity, 10 ),
        tag: values.tag,
        metadata: {
          name: values.name,
          description: values.description,
        },
      }
    });
    return fetch(values.id===0 ? '/api/rewards/create' : '/api/rewards/update', {
      method: values.id===0 ? 'POST' : 'PUT',
      credentials: 'include',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
      body: body,
    })
  };
  
  static purchaseReward(rewardId) {
    var body = JSON.stringify({rewardId: rewardId});
    return fetch('/api/rewards/purchase', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
      body: body,
    });
  }

  static replenish() {
    return fetch('/api/accounts/replenish', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
    });
  }
}

export default Api;