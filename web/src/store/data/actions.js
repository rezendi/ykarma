import * as types from './types';
import Api from '../Api';
import util from '../../utils/util';
import { auth, fbase } from '../../fbase';


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
    if (communityId) {
      return Api.loadCommunity(communityId).then(community => {
        dispatch(loadCommunitySuccess(community));
      }).catch(error => {
        throw(error);
      });
    }
  };
}

export function loadCommunitySuccess(community) {
  return { type: types.LOAD_COMMUNITY_SUCCESS, community};
}


// Accounts

export function loadAccountsFor(communityId) {
  return function(dispatch) {
    if (communityId) {
      return Api.loadAccountsFor(communityId).then(accounts => {
        dispatch(loadAccountsSuccess(accounts));
      }).catch(error => {
        throw(error);
      });
    }
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

export function fetchUser() {
  if (util.testMode()) {
    return userFetched(util.getWebTestUser());
  }
  if (auth.currentUser()) {
    return fetchYkUser(auth.currentUser());
  }
  return function(dispatch) {
    fbase.auth.onAuthStateChanged(user => {
      return dispatch(fetchYkUser(user));
    });
  }
}

export function fetchYkUser(user) {
  if (util.testMode()) {
    return userFetched(util.getWebTestUser());
  }
  if (user === null) {
    return userFetched({fbase:{}, yk:{}});
  }
  return function(dispatch, getState) {
    var forceRefresh = sessionStorage.getItem("currentToken") === null;
    if ( (new Date()).getTime() - (sessionStorage.getItem("currentTokenSet") || 0) > 60000) {
      forceRefresh = true;
    }

    // console.log("getting id token", forceRefresh);
    return user.getIdToken(forceRefresh).then((idToken) => {
      if (!forceRefresh) {
        Api.loadMyYKAccount().then(loaded => {
          dispatch(userFetched({ fbase:user, yk:loaded}));
        }).catch(error => {
          throw(error);
        });
      } else {
        //reset the token first
        sessionStorage.setItem("currentToken", idToken);
        sessionStorage.setItem("currentTokenSet", (new Date()).getTime());
        auth.setToken(idToken).then((result) => {
          if (!result.ok) { return {}; }
          result.json().then((json) => {
            Api.loadMyYKAccount().then(loaded => {
              dispatch(userFetched({ fbase:user, yk:loaded}));
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
    return fbase.auth.onAuthStateChanged(user => {
      return Api.loadAvailableRewards().then(result => {
          if (!result.ok) {
            return loadAvailableRewardsSuccess([]);
          }
        return result.json().then(json => {
          dispatch(loadAvailableRewardsSuccess(json.rewards));
        });
      }).catch(error => {
        throw(error);
      });
    });
  };
}

export function loadAvailableRewardsSuccess(rewards) {
  return { type: types.LOAD_AVAILABLE_REWARDS_SUCCESS, rewards};
}

export function loadOwnedRewards() {
  return function(dispatch) {
    return fbase.auth.onAuthStateChanged(user => {
      return Api.loadOwnedRewards().then(result => {
        if (!result.ok) {
          return loadOwnedRewardsSuccess([]);
        }
        return result.json().then(json => {
          dispatch(loadOwnedRewardsSuccess(json.rewards));
        });
      }).catch(error => {
        throw(error);
      });
    });
  };
}

export function loadOwnedRewardsSuccess(rewards) {
  return { type: types.LOAD_OWNED_REWARDS_SUCCESS, rewards};
}

export function loadVendedRewards() {
  return function(dispatch) {
    return fbase.auth.onAuthStateChanged(user => {
      return Api.loadVendedRewards().then(result => {
        if (!result.ok) {
          return loadVendedRewardsSuccess([]);
        }
        return result.json().then(json => {
          dispatch(loadVendedRewardsSuccess(json.rewards));
        });
      }).catch(error => {
        throw(error);
      });
    });
  };
}

export function loadVendedRewardsSuccess(rewards) {
  return { type: types.LOAD_VENDED_REWARDS_SUCCESS, rewards};
}

export function loadRewardsVendedBy(vendorId) {
  return function(dispatch) {
    return fbase.auth.onAuthStateChanged(user => {
      return Api.loadRewardsVendedBy(vendorId).then(result => {
        if (!result.ok) {
          return loadRewardsVendedBySuccess([]);
        }
        return result.json().then(json => {
          dispatch(loadRewardsVendedBySuccess(json.rewards));
        });
      }).catch(error => {
        throw(error);
      });
    });
  };
}

export function loadRewardsVendedBySuccess(rewards) {
  return { type: types.LOAD_REWARDS_VENDED_BY_SUCCESS, rewards};
}

export function loadReward(rewardId) {
  return function(dispatch) {
    return Api.loadReward(rewardId).then(result => {
      return result.json().then(json => {
        dispatch(loadRewardSuccess(json.reward));
      });
    }).catch(error => {
      console.log("error", error);
      throw(error);
    });
  };
}

export function loadRewardSuccess(reward) {
  return { type: types.LOAD_REWARD_SUCCESS, reward};
}

export function setLoading(active) {
  return function(dispatch) {
    dispatch(loadingSet(active));
  };
}

export function loadingSet(active) {
  return { type: types.LOADING, active};
}

export function loadAllTranches() {
  return function(dispatch) {
    return Api.loadAllTranches().then(result => {
      return result.json().then(json => {
        dispatch(loadAllTranchesSuccess(json));
      });
    }).catch(error => {
      console.log("error", error);
      throw(error);
    });
  };
}

export function loadAllTranchesSuccess(account) {
  return { type: types.LOAD_ALL_TRANCHES_SUCCESS, account};
}

