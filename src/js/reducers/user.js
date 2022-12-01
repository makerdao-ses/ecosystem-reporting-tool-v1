const INITIAL_STATE = {
    id: '',
    cuId: '',
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
                username: action.userData.username,
                authToken: action.userData.authToken,
                auth: true,
                roles: action.userData.roles ? Array.from(action.userData.roles) : [...state.roles]
            }
        case 'USER_RESET':
            return {
                ...state,
                id: '',
                cuId: '',
                username: '',
                authToken: '',
                auth: false,
                cuListIndex: '',
                roles: []
            }
        case 'CU_LIST_INDEX':
            return {
                ...state,
                cuListIndex: action.userData.cuListIndex,
                cuId: action.userData.cuId,
                roles: state.roles
            }
        case 'USER_CHANGE_PASSWORD':
            return { ...state, authToken: '' }
        default: {
            return state
        }
    }
}