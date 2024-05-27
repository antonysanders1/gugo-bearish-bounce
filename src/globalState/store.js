import { legacy_createStore as createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import rootReducer from "./rootReducer";
import { thunk } from "redux-thunk";

const middlewares = [
  // logger,
  thunk,
];

const store = createStore(
  rootReducer
  //   composeWithDevTools(applyMiddleware(...middlewares))
);

export default store;
