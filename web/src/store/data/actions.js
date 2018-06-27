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

export function toggleEditing() {
  return function(dispatch) {
    return dispatch(editingToggled());
  };
}

export function editingToggled() {
  return { type: types.EDITING_TOGGLED, };
}

export function fetchUser() {
  return function(dispatch) {
    if (auth.getUser()) {
      return dispatch(fetchYkUser(auth.getUser()));
    } else {
      firebase.auth.onAuthStateChanged(user => {
        return dispatch(fetchYkUser(user));
      });
    }
  }
}

export function fetchYkUser(user) {
  if (user === null) {
    return userFetched(user);
  }
  return function(dispatch, getState) {
    return Api.loadAccountForUser(user).then(loaded => {
      dispatch(userFetched(loaded));
      auth.getUser().getIdToken(/* forceRefresh */ true).then(function(idToken) {
        fetch('/accounts/token/set', {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
          body: JSON.stringify({ ykid: loaded.yk.id, token: idToken })
        });
      }).catch(error => {
        throw(error);
      })
    }).catch(error => {
      throw(error);
    });
  }
}

export function userFetched(user) {
  return { type: (user === null ? types.NO_USER : types.USER), user };
}

