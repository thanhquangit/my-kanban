import {ActionTypes} from '../actions/action-types';

const initialAppState = {
  page: 'home',
  pathLevels: [],
  data: {},
};

const routeReducer = (state = initialAppState, action) => {
  switch (action.type) {
    case ActionTypes.route.SET_ROUTE_DATA:
      return Object.assign({}, state, {
        ...state,
        page: action.payload.page,
        data: action.payload.data ? action.payload.data : {},
      });
    default:
      return state;
  }
};

export default routeReducer;
