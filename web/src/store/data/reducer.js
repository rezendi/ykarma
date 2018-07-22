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
      return action.account || { metadata: {}};
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
        handle: action.user.handle,
        providerData: action.user.providerData,
        isAdmin: action.user.email === "jon@rezendi.com",
        ykid: action.user.yk ? parseInt(action.user.yk.id, 10) : null,
        metadata: action.user.yk ? action.user.yk.metadata : null,
        givable: action.user.yk ? action.user.yk.givable : 0,
        given: action.user.yk ? action.user.yk.given : {},
        spendable: action.user.yk ? action.user.yk.spendable : {},
      }
    case types.TWITTER_ADDED:
      return { ...state, handle: action.handle }
    case types.NO_USER:
      return {};
    default:
      return state
  }
}

export function rewardReducer(state = initialState.reward, action) {
  switch (action.type) {
    case types.LOAD_REWARDS_SUCCESS:
      return action.rewards || [];
    default:
      return state
  }
}
