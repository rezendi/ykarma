import initialState from '../../store/initialState';
import * as types from './types';

export function communitiesReducer(state = initialState.communities, action) {
  switch (action.type) {
    case types.LOAD_COMMUNITIES_SUCCESS:
      return action.communities || [];
    default:
      return state
  }
}

export function communityReducer(state = initialState.community, action) {
  switch (action.type) {
    case types.LOAD_COMMUNITY_SUCCESS:
      return action.community || { metadata: {}};
    default:
      return state
  }
}

export function accountsReducer(state = initialState.accounts, action) {
  switch (action.type) {
    case types.LOAD_ACCOUNTS_SUCCESS:
      return action.accounts || [];
    default:
      return state
  }
}

export function accountReducer(state = initialState.account, action) {
  switch (action.type) {
    case types.LOAD_ACCOUNT_SUCCESS:
      return action.account || [];
    default:
      return state
  }
}

export function editingReducer(state = initialState.editing, action) {
  switch (action.type) {
    case types.EDITING_TOGGLED:
      return !state;
    default:
      return state
  }
}

export function tokenReducer(state = initialState.tokenSet, action) {
  switch (action.type) {
    case types.TOKEN_SET:
      return !state;
    default:
      return state
  }
}

export function userReducer(state = initialState.user, action) {
  switch (action.type) {
    case types.USER:
      return {
        displayName: action.user.displayName,
        email: action.user.email,
        emailVerified: action.user.emailVerified,
        phoneNumber: action.user.phoneNumber,
        photoURL: action.user.photoURL,
        uid: action.user.uid,
        providerData: action.user.providerData,
        isAdmin: action.user.email === "jon@rezendi.com",
        ykid: action.user.yk ? parseInt(action.user.yk.id) : null,
        givable: action.user.yk ? action.user.yk.givable : 0,
        spendable: action.user.yk ? action.user.yk.spendable : 0,
      }
    case types.NO_USER:
      return {};
    default:
      return state
  }
}
