import { combineReducers } from 'redux';
import { communitiesReducer, communityReducer, accountsReducer, editingReducer } from './data/reducer';

export const rootReducer = combineReducers({
  communities: communitiesReducer,
  community: communityReducer,
  accounts: accountsReducer,
  editing: editingReducer
});