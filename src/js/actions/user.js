export const storeUserInfo = (userData) => dispatch => {
    dispatch({
        type: 'USER_LOGIN_ON_SUCCESS',
        userData
    })
}

export const resetUserInfo = () => dispatch => {
    dispatch({
        type: 'USER_RESET'
    })
}

export const storeListIndex = (userData) => dispatch => {
    dispatch({
        type: 'CU_LIST_INDEX',
        userData
    })
}