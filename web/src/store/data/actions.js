import * as types from './types';
import Api from '../Api';
import { auth, firebase } from '../../firebase';


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


export function fetchUser() {
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

