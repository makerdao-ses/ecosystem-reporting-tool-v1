import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LoginToApi from './loginToApi';
import UserInfo from './userInfo';
import { storeUserInfo, resetUserInfo } from '../../actions/user';
import jwtDecode from 'jwt-decode';

export default function User() {
    const dispatch = useDispatch();
    const userFromStore = useSelector(store => store.user.auth)

    useEffect(() => {
        const verifyCredentials = async () => {
            const userInfo = await electron.getApiCredentials();
            if (userInfo != null) {
                const decodedExp = jwtDecode(userInfo.authToken)
                const currentTime = new Date().getTime() / 1000;
                if (decodedExp.exp > currentTime) {
                    dispatch(storeUserInfo(userInfo))
                } else {
                    dispatch(resetUserInfo())
                    electron.resetApiCredentials()
                }
            }
        };
        verifyCredentials();
    }, [])




    return (
        <>
            {userFromStore ? <UserInfo /> : <LoginToApi />}
        </>
    )
}