import { combineReducers } from "redux";
import { reducer as formReducer } from "redux-form";
import drawer from "./drawer";
import list from "./list";


export default combineReducers({
  form: formReducer,
  drawer,
  list
});
