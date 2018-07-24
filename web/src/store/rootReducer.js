import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form'
import { communitiesReducer, communityReducer, accountsReducer, accountReducer, userReducer, myRewardsReducer, rewardsReducer, rewardReducer } from './data/reducer';

export const rootReducer = combineReducers({
  communities: communitiesReducer,
  community: communityReducer,
  accounts: accountsReducer,
  account: accountReducer,
  user: userReducer,
  form: formReducer,
  myRewards: myRewardsReducer,
  rewards: rewardsReducer,
  reward: rewardReducer,
});