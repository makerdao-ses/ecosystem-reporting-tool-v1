import React, { useState, useEffect } from 'react';
import { Card, Label, Container, Textarea, Select, Button, Spinner, Text } from "theme-ui"
import { useQuery, gql, useMutation } from "@apollo/client";
import { GET_CORE_UNIT, getCoreUnits } from '../api/graphql';
import { useDispatch, useSelector } from 'react-redux';
import { storeListIndex } from '../actions/user';

export default function CuInfo() {
    const dispatch = useDispatch();

    const userFromStore = useSelector(store => store.user);
    const [cus, setCus] = useState([]);
    const [adminRole, setAdminRole] = useState(false);


    useEffect(() => {
        const admin = setRole();
        setAdminRole(admin)
        const getCus = async () => {
            const result = await getCoreUnits();
            setCus(result.data.coreUnits);
            if (userFromStore.cuId === null || userFromStore.cuId === '' || userFromStore.cuListIndex === '') {
                dispatch(storeListIndex({
                    cuListIndex: 0,
                    cuId: result.data.coreUnits[0].id
                }));
            } else {
                const sortedCus = moveInArray(result.data.coreUnits, userFromStore.cuListIndex, 0);
                dispatch(storeListIndex({
                    cuListIndex: 0,
                    cuId: sortedCus[0].id
                }));
                setCus(sortedCus)
            }

        };
        if (admin === true) {
            getCus()
        }
    }, []);

    const setRole = () => {
        const [admin] = userFromStore.roles.map(role => {
            if (role.name === 'SuperAdmin') {
                return true
            } else {
                return false
            }
        })
        return admin;
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
    else if (data == undefined || data.coreUnit.length < 1 && userFromStore.cuId !== null) {
        return (
            <Card sx={{ my: 2, textAlign: 'center', maxWidth: "100%" }}>
                <Text sx={{ fontWeight: "bold", color: 'red' }}> NO CU FOUND</Text>
            </Card>
        )
    }
    else if (adminRole) {
        return (
            <Card sx={{ my: 2, textAlign: 'center', maxWidth: "100%" }}>
                <Label>Choose CoreUnit</Label>
                <Select onChange={e => handleSelect(e.target.value)}>
                    {
                        cus.map(cu => {
                            return <option key={cu.id}>{`${cu.name}`}</option>
                        })
                    }
                </Select>
            </Card>
        )
    }
    else {
        return (
            <Card sx={{ my: 2, textAlign: 'center', maxWidth: "100%" }}>
                <Text sx={{ fontWeight: "bold", }}>{data.coreUnit[0]?.name} Core Unit</Text>
            </Card>
        )
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