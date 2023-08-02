const INITIAL_STATE = {
    id: '',
    cuId: '',
    cuIds: '',
    ownerType: '',
    username: '',
    authToken: '',
    auth: false,
    cuListIndex: '',
    roles: []
}

export default function userReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case 'USER_LOGIN_ON_SUCCESS':
            return {
                ...state,
                id: action.userData.id,
                cuId: action.userData.cuId,
                cuIds: action.userData.cuIds,
                username: action.userData.username,
                authToken: action.userData.authToken,
                auth: true,
                ownerType: action.userData.ownerType,
                roles: action.userData.roles ? Array.from(action.userData.roles) : [...state.roles]
            }
        case 'USER_RESET':
            return {
                ...state,
                id: '',
                cuId: '',
                cuIds: '',
                ownerType: '',
                username: '',
                authToken: '',
                auth: false,
                cuListIndex: '',
                roles: []
            }
        case 'CU_LIST_INDEX':
            return {
                ...state,
                cuListIndex: action.userData.cuListIndex ? action.userData.cuListIndex : state.cuListIndex,
                cuId: action.userData.cuId || action.userData.cuId == null ? action.userData.cuId : state.cuId,
                ownerType: action.userData.ownerType ? action.userData.ownerType : state.ownerType,
                roles: state.roles ? state.roles : action.userData.roles,
            }
        case 'USER_CHANGE_PASSWORD':
            return { ...state, authToken: '' }
        default: {
            return state
        }
    }
}

