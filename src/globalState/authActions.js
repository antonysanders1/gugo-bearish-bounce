import authTypes from "./authTypes";

export const setCurrentUser = (user) => {
  return {
    type: authTypes.SET_CURRENT_USER,
    payload: user,
  };
};

export const clearCurrentUser = () => {
  return {
    type: authTypes.CLEAR_CURRENT_USER,
  };
};

export const setUserData = (userData) => {
  return {
    type: authTypes.SET_USER_DATA,
    payload: {
      userData,
    },
  };
};

export default authTypes;
