import React, { useState } from 'react';
import { Card, Label, Input, Button, Spinner } from 'theme-ui';
import { gql, useMutation } from "@apollo/client";
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';



export function ChangePass() {

    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('');
    const userFromStore = useSelector(store => store.user)
    const { enqueueSnackbar } = useSnackbar();

    const CHANGE_PASSWORD = gql`
        mutation UserChangePassword($input: UpdatePassword!) {
            userChangePassword(input: $input) {
                id
                username
            }
        }
        `;

    const [changePassword, { data, loading, error }] = useMutation(CHANGE_PASSWORD, {
        variables: {
            input: {
                username: userFromStore.username,
                password: oldPassword,
                newPassword
            }
        },
        fetchPolicy: 'no-cache',
        context: {
            headers: {
                authorization: `Bearer ${userFromStore.authToken}`
            }
        }
    });

    const handleOldPassword = (value) => {
        setOldPassword(value)
    }

    const handleNewPassword = (value) => {
        setNewPassword(value)
    }

    const handlePasswordBtn = async () => {
        try {
            await changePassword()
            setOldPassword('')
            setNewPassword('')
            enqueueSnackbar('Password changed succesfully', { variant: 'success' })
        } catch (error) {
            enqueueSnackbar(error.message, { variant: 'error' })
        }
    }

    return (
        <>
            <Card sx={{ display: 'flex', mt: '20px', mx: "33%", alignItems: 'center', justifyContent: 'center', }}>
                <div>
                    <div>
                        <Label>Old Password</Label>
                        <Input
                            value={oldPassword}
                            onChange={e => handleOldPassword(e.target.value)}
                            type='password'
                        ></Input>
                    </div>
                    <div>
                        <Label>New Password</Label>
                        <Input
                            value={newPassword}
                            onChange={e => handleNewPassword(e.target.value)}
                            type='password'
                        ></Input>
                    </div>
                    {loading ? <Spinner variant="styles.spinner" title="loading"></Spinner> : <Button
                        sx={{ mt: "10px" }}
                        onClick={handlePasswordBtn}
                    >Change Password</Button>}
                </div>
            </Card>
        </>
    )
}