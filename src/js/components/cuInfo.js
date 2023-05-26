import React, { useState, useEffect } from 'react';
import { Card, Label, Select, Spinner, Text } from "theme-ui"
import { useQuery } from "@apollo/client";
import { GET_CORE_UNIT, getCoreUnits, getCoreUnit } from '../api/graphql';
import { useDispatch, useSelector } from 'react-redux';
import { storeListIndex } from '../actions/user';
import { isArray } from '@apollo/client/cache/inmemory/helpers';

export default function CuInfo() {
    const dispatch = useDispatch();

    const userFromStore = useSelector(store => store.user);
    const [cus, setCus] = useState([]);
    const [adminRole, setAdminRole] = useState(false);

    // console.log(userFromStore)

    useEffect(() => {
        const admin = setRole();
        setAdminRole(admin)
        const getCus = async () => {
            let result = await getCoreUnits();
            result = result.data.coreUnits.map(cu => { cu, cu.name = `[CoreUnit] ${cu.name}` })
            console.log(result)
            setCus(result);
            if (userFromStore.cuId === null || userFromStore.cuId === '' || userFromStore.cuListIndex === '') {
                dispatch(storeListIndex({
                    cuListIndex: 0,
                    cuId: result[0].id
                }));
            } else {
                let sortedCus = moveInArray(result, userFromStore.cuListIndex, 0);
                dispatch(storeListIndex({
                    cuListIndex: 0,
                    cuId: sortedCus[0].id
                }));
                setCus(prevCus => [...prevCus, ...sortedCus])
            }
            addDelegatesAdminToCus();
            addEcoystemActorToCus();

        };
        const getCusForFacilitator = async () => {
            let result = await getCoreUnits();
            result = result.data.coreUnits.map(cu => ({ ...cu, name: `[CoreUnit] ${cu.name}` }))
            let sortedCus = moveInArray(result, userFromStore.cuListIndex, 0);
            if (isArray(userFromStore.cuIds)) {
                const filteredCus = [];
                userFromStore.cuIds.forEach(cuId => {
                    sortedCus.filter(cu => {
                        if (cu.id == cuId) {
                            filteredCus.push(cu)
                        }
                    })
                });
                sortedCus = filteredCus;
            }
            dispatch(storeListIndex({
                cuListIndex: 0,
                cuId: sortedCus[0].id
            }));
            setCus(prevCus => [...prevCus, ...sortedCus]);
            addDelegatesAdminToCus();
            addEcoystemActorToCus();
        };

        if (admin === 'admin') {
            getCus()
        } else if (admin !== 'admin' && isArray(userFromStore.cuIds)) {
            getCusForFacilitator()
        }

    }, []);

    const setRole = () => {
        const [admin] = userFromStore.roles.map(role => {
            if (role.name === 'SuperAdmin') {
                return 'admin'
            } else if (role.name === 'CoreUnitFacilitator') {
                return 'facilitator'
            } else if (role.name === 'DelegatesAdmin') {
                return 'delegate'
            } else {
                return false
            }
        })
        return admin;
    }

    const addDelegatesAdminToCus = () => {
        userFromStore.roles.forEach(role => {
            if (role.name === 'DelegatesAdmin' && role.permission.includes('Delegates/Update')) {
                let del = [{ id: null, name: '[Recognized Delegates]' }]
                setCus(prevCus => [...prevCus, ...del])
            }
        });
    }

    const addEcoystemActorToCus = () => {
        userFromStore.roles.forEach(async role => {
            if (role.name === 'EcosystemActorAdmin' && role.permission.includes('EcosystemActor/Update')) {
                const ecoCu = await getCoreUnit(role.cuId);
                let eco = [{ id: role.cuId, name: `[Ecosystem Actor] ${ecoCu.data.coreUnits[0].name}` }]
                setCus(prevCus => [...prevCus, ...eco])
            }
        });
    }

    const filter = {
        filter: {
            id: parseFloat(userFromStore.cuId)
        }
    }

    const { data, loading, error } = useQuery(GET_CORE_UNIT, {
        variables: filter
    });

    const handleSelect = (value) => {
        let index;
        const coreUnits = cus.filter((cu, i) => {
            if (cu.name === value) {
                dispatch(storeListIndex({
                    cuListIndex: i,
                    cuId: cu.id
                }));
                index = i;
                return cu.id
            }
        });
        const sortedCus = moveInArray(cus, index, 0);
        setCus(sortedCus)
    }

    if (loading) return <Spinner size={1} />
    if (error) {
        return (
            <Card sx={{ my: 2, textAlign: 'center', maxWidth: "100%" }}>
                <Text sx={{ fontWeight: "bold", color: 'red' }}> {`${error}`}</Text>
            </Card>
        )
    }
    else if (data === undefined || data.coreUnits.length < 1 && userFromStore.cuId !== null) {
        return (
            <Card sx={{ my: 2, textAlign: 'center', maxWidth: "100%" }}>
                <Text sx={{ fontWeight: "bold", color: 'red' }}> NO CU FOUND</Text>
            </Card>
        )
    }
    else if (adminRole == 'facilitator' || adminRole == 'delegate' || adminRole == 'admin') {
        if (cus.length > 0) {
            return (
                <Card sx={{ my: 2, textAlign: 'center', maxWidth: "100%" }}>
                    <Label>Choose Budget</Label>
                    <Select onChange={e => handleSelect(e.target.value)}>
                        {
                            cus.map(cu => {
                                return <option key={cu.id}>{`${cu.name}`}</option>
                            })
                        }
                    </Select>
                </Card>
            )
        } else if (cus.length === 0) {
            return (
                <Card sx={{ my: 2, textAlign: 'center', maxWidth: "100%" }}>
                    <Text sx={{ fontWeight: "bold", }}>{data.coreUnits[0]?.name} {userFromStore.cuId === null ? 'Recognized Delegates' : 'Core Unit'}</Text>
                </Card>
            )
        }
    }
}

const moveInArray = (cus, from, to) => {
    let arr = [...cus]
    // Make sure a valid array is provided
    if (Object.prototype.toString.call(arr) !== '[object Array]') {
        throw new Error('Please provide a valid array');
    }

    // Delete the item from it's current position
    let item = arr.splice(from, 1);

    // Make sure there's an item to move
    if (!item.length) {
        throw new Error('There is no item in the array at index ' + from);
    }

    // Move the item to its new position
    arr.splice(to, 0, item[0]);
    return arr;
}