import {
  FILTER_DATA,
  CLEAR_FILTER,
  CLEAR_SESSION
} from './sessions.type';

interface IFilter {
  startDate?: string;
  endDate?: string;
  isValid?: string;
  isApproved?: string;
  columns?: string;
  directions?: string;
  key?: string;
}

const initialState = {
  filter: {
    startDate: "",
    endDate: "",
    isValid: "",
    isApproved: "",
    columns: "",
    directions: "",
    key: ""
  } as IFilter
};

interface IAction {
  type: string;
  payload: any;
}

function appReducer(state = initialState, action: IAction) {
  switch (action.type) {
    case FILTER_DATA:
      return {
        ...state,
        filter: {...action.payload.filter}
      };
    case CLEAR_FILTER:
      return {
        ...state,
        filter: initialState.filter
      };
    case CLEAR_SESSION:
      return initialState;
    default:
      return state;
  }
}

export const store = {
  state: initialState,
  reducer: appReducer
};
