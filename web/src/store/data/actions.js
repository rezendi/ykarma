import * as types from './types';
import Api from '../Api';
import { auth, firebase } from '../../firebase';


// Communities

export function loadCommunities() {
  return function(dispatch) {
    return Api.loadCommunities().then(communities => {
      dispatch(loadCommunitiesSuccess(communities));
    }).catch(error => {
      throw(error);
    });
  };
}

export function loadCommunitiesSuccess(communities) {
  return { type: types.LOAD_COMMUNITIES_SUCCESS, communities};
}


export function loadCommunity(communityId) {
  return function(dispatch) {
    return Api.loadCommunity(communityId).then(community => {
      dispatch(loadCommunitySuccess(community));
    }).catch(error => {
      throw(error);
    });
  };
}

export function loadCommunitySuccess(community) {
  return { type: types.LOAD_COMMUNITY_SUCCESS, community};
}


// Accounts

export function loadAccountsFor(communityId) {
  return function(dispatch) {
    return Api.loadAccountsFor(communityId).then(accounts => {
      dispatch(loadAccountsSuccess(accounts));
    }).catch(error => {
      throw(error);
    });
  };
}

export function loadAccountsSuccess(accounts) {
  return { type: types.LOAD_ACCOUNTS_SUCCESS, accounts};
}


export function loadAccount(accountId) {
  return function(dispatch) {
    return Api.loadAccount(accountId).then(account => {
      dispatch(loadAccountSuccess(account));
    }).catch(error => {
      throw(error);
    });
  };
}

export function loadAccountSuccess(account) {
  return { type: types.LOAD_ACCOUNT_SUCCESS, account};
}


// User

function getWebTestUser() {
  return {
    displayName: "Test User",
    email: "test@rezendi.com",
    emailVerified: true,
    uid: "test",
    handle: "testuser",
    providerData: "password",
    yk: {
      id: 99,
      metadata: { name: "Tester User" },
      givable: 100,
      given: [{"sender":99,"receiver":2,"amount":40,"available":10,"message":"OK howdy","tags":"cool"}],
      received: [{"sender":1,"receiver":99,"amount":40,"available":40,"message":"Just a message","tags":"cool"},{"sender":1,"receiver":99,"amount":20,"available":20,"message":"Another message","tags":"cool"}],
    }
  }  
}

export function fetchUser() {
  if (true) {
    return userFetched(getWebTestUser());
  }
  if (auth.currentUser) {
    return fetchYkUser(auth.currentUser);
  }
  return function(dispatch) {
    firebase.auth.onAuthStateChanged(user => {
      return dispatch(fetchYkUser(user));
    });
  }
}

export function fetchYkUser(user) {
  if (true) {
    return userFetched(getWebTestUser());
  }
  if (user === null) {
    return userFetched(user);
  }
  return function(dispatch, getState) {
    var forceRefresh = sessionStorage.getItem("currentToken") == null;
    if ( (new Date()).getTime() - (sessionStorage.getItem("currentTokenSet") || 0) > 60000) {
      forceRefresh = true;
    }
    // console.log("getting id token", forceRefresh);
    return user.getIdToken(forceRefresh).then((idToken) => {
      if (!forceRefresh) {
        Api.loadAccountForUser(user).then(loaded => {
          dispatch(userFetched(loaded));
        }).catch(error => {
          throw(error);
        });
      } else {
        sessionStorage.setItem("currentToken", idToken);
        sessionStorage.setItem("currentTokenSet", (new Date()).getTime());
        auth.setToken(idToken).then((result) => {
          if (!result.ok) { return {}; }
          result.json().then((json) => {
            Api.loadAccountForUser(user).then(loaded => {
              dispatch(userFetched(loaded));
            }).catch(error => {
              throw(error);
            });
          }).catch(error => {
            throw(error);
          });
        }).catch(error => {
          throw(error);
        });
      }        
    }).catch(error => {
      throw(error);
    });
  }
}

export function userFetched(user) {
  return { type: (user === null ? types.NO_USER : types.USER), user };
}

export function loadAvailableRewards() {
  return function(dispatch) {
    return firebase.auth.onAuthStateChanged(user => {
      return Api.loadAvailableRewards().then(result => {
        return result.json().then(json => {
          dispatch(loadRewardsSuccess(json.rewards));
        });
      }).catch(error => {
        throw(error);
      });
    });
  };
}

export function loadRewardsSuccess(rewards) {
  return { type: types.LOAD_REWARDS_SUCCESS, rewards};
}

export function loadMyRewards() {
  return function(dispatch) {
    return Api.loadMyRewards().then(result => {
      return result.json().then(json => {
        dispatch(loadMyRewardsSuccess(json.rewards));
      });
    }).catch(error => {
      throw(error);
    });
  };
}

export function loadMyRewardsSuccess(rewards) {
  return { type: types.LOAD_MY_REWARDS_SUCCESS, rewards};
}

export function loadReward(rewardId) {
  return function(dispatch) {
    return Api.loadReward(rewardId).then(result => {
      return result.json().then(json => {
        dispatch(loadRewardSuccess(json.reward));
      });
    }).catch(error => {
      throw(error);
    });
  };
}

export function loadRewardSuccess(reward) {
  return { type: types.LOAD_REWARD_SUCCESS, reward};
}

export function loadMyGifts(recipientIds) {
  return function(dispatch) {
    return Api.loadMyGifts(recipientIds).then(result => {
      return result.json().then(json => {
        dispatch(loadMyGiftsSuccess(json.gifts));
      });
    }).catch(error => {
      throw(error);
    });
  };
}

export function loadMyGiftsSuccess(gifts) {
  return { type: types.LOAD_MY_GIFTS_SUCCESS, gifts};
}

export function setLoading(active) {
  return function(dispatch) {
    dispatch(loadingSet(active));
  };
}

export function loadingSet(active) {
  return { type: types.LOADING, active};
}
