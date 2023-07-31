import React, { useState, useEffect } from 'react';
import { Card, Label, Input, Button, Spinner } from "theme-ui";
import { useDispatch, useSelector } from 'react-redux';
import { storeUserInfo } from '../../actions/user';
import { gql, useMutation } from "@apollo/client";
import { useSnackbar } from 'notistack';
import { getTeam } from '../../api/graphql';


export default function LoginToApi() {
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {

    }, [])


    const [username, setusername] = useState('');
    const [password, setPassword] = useState('');
    const [stateError, setStateError] = useState('')

    const handleusername = (value) => {
        setusername(value)
    }

    const handlePassword = (value) => {
        setPassword(value)
    }



    const LOGIN_USER = gql`
        mutation userLogin($input: AuthInput!) {
            userLogin(input: $input) {
                user {
                    id
                    username,
                    roles {
                    id
                    name
                    permissions
                    }
                }
                authToken
            }
        }
        `;

    const [userLogin, { data, loading, error }] = useMutation(LOGIN_USER, {
        variables: {
            input: {
                username,
                password
            }
        },
        fetchPolicy: 'no-cache'
    });

    const handleLoginBtn = async () => {

        const facilitatorRole = 'CoreUnitFacilitator';
        const superAdminRole = 'SuperAdmin';
        const delegatesRole = 'DelegatesAdmin';
        const ecosystemActorRole = 'EcosystemActorAdmin';
        const alignedDelegatesRole = 'AlignedDelegatesAdmin';

        try {
            const result = await userLogin()
            let cuId = undefined;
            let manyCuIds = [];
            const roles = extractRoleInfo(result);
            roles.map(role => {
                if (role.name === facilitatorRole || role.name === delegatesRole || role.name === ecosystemActorRole || role.name === alignedDelegatesRole) {
                    cuId = role.cuId
                    manyCuIds.push(role.cuId);
                }
                if (role.name === superAdminRole) {
                    cuId = null
                }
            })
            if (manyCuIds.length > 1) {
                cuId = manyCuIds;
            }
            if (cuId !== undefined && roles.length > 0) {
                const { data } = await getTeam(cuId);
                dispatch(storeUserInfo({
                    id: result.data.userLogin.user.id,
                    cuId,
                    cuIds: cuId,
                    username: result.data.userLogin.user.username,
                    authToken: result.data.userLogin.authToken,
                    roles: roles,
                    ownerType: data.teams[0].type
                }));
                electron.saveApiCredentials({
                    id: result.data.userLogin.user.id,
                    cuId,
                    cuIds: cuId,
                    username: result.data.userLogin.user.username,
                    authToken: result.data.userLogin.authToken,
                    roles: roles,
                    ownerType: data.teams[0].type
                })
                setusername('')
                setPassword('')
            }

        } catch (error) {
            enqueueSnackbar(error.message, { variant: 'error' })
        }
    }

    const extractRoleInfo = (result) => {
        const rolesWithId = [];
        if (result.data.userLogin.user.roles != null) {
            const roles = result.data.userLogin.user.roles.map(role => {
                role.permissions.forEach(permission => {
                    rolesWithId.push({ name: role.name, cuId: null, permission })
                })
                return role.permissions;
            }).flat();
            roles.forEach((role, index) => {
                const regex = /[0-9]{1,}/;
                const rgxOutput = role.match(regex);
                if (rgxOutput !== null) {
                    rolesWithId[index].cuId = rgxOutput[0]
                }
            })
            return rolesWithId;
        }

    }


    return (
        <Card sx={{ display: 'flex', mt: '20px', mb: '20px', mx: "33%", alignItems: 'center', justifyContent: 'center', }}>
            <div>
                <Label>Authenticate with Ecosystem Performance Api</Label>
                <div>
                    <Label>Username</Label>
                    <Input
                        value={username}
                        onChange={e => handleusername(e.target.value)}
                    ></Input>
                </div>
                <div>
                    <Label>Password</Label>
                    <Input
                        value={password}
                        onChange={e => handlePassword(e.target.value)}
                        type='password'
                    ></Input>
                </div>
                {loading ? <Spinner variant="styles.spinner" title="loading"></Spinner> : <Button
                    sx={{ mt: "10px" }}
                    onClick={handleLoginBtn}
                >Log In</Button>}

            </div>
        </Card>
    )
}

