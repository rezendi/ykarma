import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form'
import { loadingReducer, communitiesReducer, communityReducer, accountsReducer, accountReducer, userReducer, rewardsReducer } from './data/reducer';

export const rootReducer = combineReducers({
  loading: loadingReducer,
  communities: communitiesReducer,
  community: communityReducer,
  accounts: accountsReducer,
  account: accountReducer,
  user: userReducer,
  form: formReducer,
  rewards: rewardsReducer,
});