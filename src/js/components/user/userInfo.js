import React, { useState } from 'react';
import { Card, Label, Button } from 'theme-ui';
import { ChangePass } from './changePassword';
import { useDispatch, useSelector } from 'react-redux';
import { resetUserInfo } from '../../actions/user';

export default function UserInfo() {
    const dispatch = useDispatch();

    const userFromStore = useSelector(store => store.user);
    const [changePass, setChangePass] = useState(false)

    const handleChangePasswordBtn = () => {
        setChangePass(!changePass)
    }

    const handleLogoutBtn = async () => {
        dispatch(resetUserInfo())
        electron.resetApiCredentials()
    }

    return (

        <>
            <Card sx={{ display: 'flex', mt: '20px', justifyContent: 'space-evenly' }}>
                <div>
                    <Label>User: {userFromStore.username}</Label>
                </div>
                <div sx={{ display: 'flex', flexDirection: 'column' }}>
                    <div>
                        <Button
                            variant='smallOutline'
                            onClick={handleChangePasswordBtn}
                        >Change Password</Button>

                    </div>
                    <div >
                        {
                            userFromStore.auth ? <Button
                                sx={{ mt: '10px' }}
                                variant='small'
                                bg='red'
                                onClick={handleLogoutBtn}
                            >
                                LogOut
                            </Button> : ""
                        }

                    </div>
                </div>

            </Card>
            {changePass ? <ChangePass /> : ''}
        </>

    )
}