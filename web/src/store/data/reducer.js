import initialState from '../../store/initialState';
import * as types from './types';

export default function communitiesReducer(state = initialState.communities, action) {
  console.log("action communities", JSON.stringify(action.communities));
  switch (action.type) {
    case types.LOAD_COMMUNITIES_SUCCESS:
      return action.communities;
    default:
      return state
  }
}