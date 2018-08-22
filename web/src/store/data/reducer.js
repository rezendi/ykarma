import initialState from '../../store/initialState';
import * as types from './types';

export function loadingReducer(state = initialState.loading, action) {
  switch (action.type) {
    case types.LOADING:
      return action.active === true;
    default:
      return state
  }
}
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

function getTwitterHandleFromUrls(urlsString) {
  const urls = urlsString.split("||");
  for (var i in urls) {
    if (urls[i].indexOf("https://twitter.com/") === 0) {
      return urls[i].replace("https://twitter.com/","");
    }
  }
  return '';
}

export function userReducer(state = initialState.user, action) {
  switch (action.type) {
    case types.USER:
      const fbase = action.user.fbase;
      const yk = action.user.yk;
      return {
        displayName:    fbase.displayName || '',
        email:          fbase.email || '',
        emailVerified:  fbase.emailVerified || false,
        uid:            fbase.uid || '',
        providerData:   fbase.providerData,
        isAdmin:        fbase.email === "jon@rezendi.com",
        ykid:           yk.id || 0,
        metadata:       yk.metadata || {},
        urls:           yk.urls || '',
        handle:         getTwitterHandleFromUrls(yk.urls || ''),
        givable:        yk.givable  || 0,
        given:          yk.given || {},
        received:       yk.received || {},
        community:      yk.community || {},
      }
    case types.TWITTER_ADDED:
      return { ...state, handle: action.handle }
    case types.NO_USER:
      return {};
    default:
      return state
  }
}

export function rewardsReducer(state = initialState.rewards, action) {
  switch (action.type) {
    case types.LOAD_AVAILABLE_REWARDS_SUCCESS:
      return { ...state, available: action.rewards };
    case types.LOAD_OWNED_REWARDS_SUCCESS:
      return { ...state, owned: action.rewards };
    case types.LOAD_VENDED_REWARDS_SUCCESS:
      return { ...state, vended: action.rewards };
    case types.LOAD_REWARD_SUCCESS:
      return { ...state, reward: action.reward };
    default:
      return state
  }
}
