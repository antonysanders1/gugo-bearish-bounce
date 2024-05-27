import authTypes from "./authTypes";

const initialState = {
  currentUser: null,
  userData: {},
  userPosts: [],
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case authTypes.SET_CURRENT_USER:
      return {
        ...state,
        currentUser: action.payload,
      };

    case authTypes.CLEAR_CURRENT_USER:
      return {
        ...state,
        currentUser: null,
        userData: {},
      };

    case authTypes.SET_USER_DATA:
      return {
        ...state,
        userData: action.payload.userData,
      };

    default:
      return state;
  }
};

export default authReducer;
