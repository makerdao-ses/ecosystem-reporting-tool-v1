const INITIAL_STATE = {
    initialized: false,
    links: []
}

export default function googleAuthReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case 'ADD_LINK':
            return {...state, links: [...state.links, action.data]};

        case 'REMOVE_LINK':
            console.log("Removing link", action)
            return {
                ...state, 
                links: state.links.filter(item => item.storageId !== action.storageId )
            };

        case 'GET_LINK':
            return { 
                ...state,
                links: state.links.filter(item => item.spreadSheetId == action.spreadSheetId)
            };

        case 'FLAG_LINK_INITIALIZATION':
            return {
                ...state,
                initialized: true
            };

        default: {
            return state;
        };
    }
}