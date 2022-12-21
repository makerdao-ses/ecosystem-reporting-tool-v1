import React, { useEffect, useState } from 'react';
import { Container } from "theme-ui"
import Table from './table/table';
import { useDispatch, useSelector } from 'react-redux';
import { storeAuthObject } from '../actions/googleAuth';
import { storeUserInfo, resetUserInfo } from '../actions/user';
import NotAuthenticated from './notAuthenticated';
import jwtDecode from 'jwt-decode';

export default function BudgetSheet() {

    const dispatch = useDispatch();
    const userFromStore = useSelector(store => store.user);

    useEffect(() => {
        const verifyCredentials = async () => {
            const { state } = await electron.checkToken();
            const userInfo = await electron.getApiCredentials();
            if (state) {
                dispatch(storeAuthObject());
            }
            if (userInfo != null && userFromStore.id === '') {
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
        verifyCredentials()
    }, [])


    const gAuth = useSelector((googleAuth) => googleAuth.googleAuth.auth);

    return (
        <Container>
            {gAuth && userFromStore.id !== '' ? <Table /> : <NotAuthenticated />}
        </Container>
    )
}