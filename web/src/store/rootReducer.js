import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form'
import { messagesReducer, loadingReducer, communitiesReducer, communityReducer, accountsReducer, accountReducer, userReducer, myGiftsReducer, myRewardsReducer, rewardsReducer, rewardReducer } from './data/reducer';

export const rootReducer = combineReducers({
  loading: loadingReducer,
  communities: communitiesReducer,
  community: communityReducer,
  accounts: accountsReducer,
  account: accountReducer,
  user: userReducer,
  form: formReducer,
  myRewards: myRewardsReducer,
  rewards: rewardsReducer,
  reward: rewardReducer,
  myGifts: myGiftsReducer,
  messages: messagesReducer,
});