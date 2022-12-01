
export const storeAuthObject = () => dispatch => {
    dispatch({
        type: 'GAUTH_ON_SUCCESS',
    })
}

export const resetAuthSettings = () => dispatch => {
    dispatch({
        type: 'GAUTH_RESET'
    })
}