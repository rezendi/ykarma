import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form'
import { communitiesReducer, communityReducer, accountsReducer, accountReducer, editingReducer, userReducer, tokenReducer } from './data/reducer';

export const rootReducer = combineReducers({
  communities: communitiesReducer,
  community: communityReducer,
  accounts: accountsReducer,
  account: accountReducer,
  tokenSet: tokenReducer,
  editing: editingReducer,
  user: userReducer,
  form: formReducer
});