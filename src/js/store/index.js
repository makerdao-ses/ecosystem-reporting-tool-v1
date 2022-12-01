import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import googleAuthReducer from '../reducers/googleAuth';
import tableDataReducer from '../reducers/tableDataReducer';
import userReducer from '../reducers/user';

export default function configureStore() {

    const middleWares = [
        thunkMiddleware
    ];

    const store = createStore(
        combineReducers({
            googleAuth: googleAuthReducer,
            tableData: tableDataReducer,
            user: userReducer
        }), applyMiddleware(...middleWares)
    )

    return store;

}