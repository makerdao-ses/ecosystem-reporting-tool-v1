
export const storeLinkData = (data) => dispatch => {
    dispatch({
        type: 'ADD_LINK',
        data
    })
}

export const removeLinkData = (storageId) => dispatch => {
    dispatch({
        type: 'REMOVE_LINK',
        storageId: Number(storageId)
    })
}

export const getLinkData = (spreadSheetId) => dispatch => {
    dispatch({
        type: 'GET_LINK',
        spreadSheetId
    })
}

export const flagLinkDataInitialization = () => dispatch => {
    dispatch({
        type: 'FLAG_LINK_INITIALIZATION'
    })
}