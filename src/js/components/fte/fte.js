import React, { useState, useEffect } from 'react';
import { Card, Label, Input, Grid, Text, Button, Spinner, Box } from "theme-ui";
import { gql, useMutation } from "@apollo/client";
import { useSelector } from 'react-redux';
import { useSnackbar } from 'notistack';

export default function FTE({ month, budgetStatement, coreUnit }) {
    const userFromStore = useSelector(store => store.user)
    const [fte, setFte] = useState('')
    const [apiFte, setApiFte] = useState(null)
    const [readToUpload, setReadyToUpload] = useState(false);

    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        if (budgetStatement.budgetStatementFTEs !== undefined) {
            if (budgetStatement.budgetStatementFTEs.length > 0) {
                setFte(`${budgetStatement.budgetStatementFTEs[0].ftes}`)
                setApiFte(budgetStatement.budgetStatementFTEs[0])
            } else {
                setApiFte(null)
                setFte('')
            }
        }
    }, [budgetStatement, month])

    const handleChange = (value) => {
        setFte(value)
        if (parseFloat(value) > 1000 || parseFloat(value) < 0 || value == '') {
            setReadyToUpload(false)
        } else {
            setReadyToUpload(true)
        }
    }


    const uploadFte = async () => {
        try {
            if (apiFte !== null) {
                await updateFte()
                enqueueSnackbar(`Updated FTE number to ${fte}`, { variant: 'success' })
            } else {
                await addFte()
                enqueueSnackbar(`Added ${fte} FTEs`, { variant: 'success' })
            }

        } catch (error) {
            enqueueSnackbar(`${error}`, { variant: 'error' })
        }
    }

    const ADD_FTE = gql`
        mutation addFte($input: BudgetStatementFTEInput) {
            budgetStatementFTEAdd(input: $input) {
                id
                budgetStatementId
                month
                ftes
            }
        }
    `

    const UPDATE_FTE = gql`
        mutation updateFte($input: BudgetStatementFTEUpdateInput) {
            budgetStatementFTEUpdate(input: $input) {
                id
                budgetStatementId
                month
                ftes
            }
        }
    `

    const [addFte, { data, loading, error }] = useMutation(ADD_FTE, {
        variables: {
            input: {
                budgetStatementId: budgetStatement.id,
                month,
                ftes: parseFloat(fte),
                coreUnitId: parseFloat(userFromStore.cuId)
            }
        },
        fetchPolicy: 'no-cache',
        context: {
            headers: {
                authorization: `Bearer ${userFromStore.authToken}`
            }
        }
    });

    const [updateFte, { dataUpdate, loadingUpdate, errorUpdate }] = useMutation(UPDATE_FTE, {
        variables: {
            input: {
                id: apiFte?.id,
                budgetStatementId: budgetStatement.id,
                month,
                ftes: parseFloat(fte),
                coreUnitId: parseFloat(userFromStore.cuId)
            }
        },
        fetchPolicy: 'no-cache',
        context: {
            headers: {
                authorization: `Bearer ${userFromStore.authToken}`
            }
        }
    })


    return (
        <>
            <Card>
                <Box sx={{ textAlign: 'center', fontWeight: "bold" }}>
                    {coreUnit?.shortCode} Core Unit Expense Report {month.substring(0, month.length - 3)}
                    <br />
                </Box>
                <Label>Set FTE for {month.substring(0, month.length - 3)}</Label>
                <Grid
                    columns={2}
                >
                    <Input
                        value={fte}
                        onChange={(e) => handleChange(e.target.value)}
                        type={'number'}
                    />
                    {loading || loadingUpdate ?
                        <Spinner variant="styles.spinner" title="loading"></Spinner>
                        :
                        <Button
                            sx={{ width: '30%' }}
                            variant="smallOutline"
                            onClick={uploadFte}
                            disabled={!readToUpload}
                        >SET</Button>
                    }
                </Grid>
                {parseFloat(fte) > 1000 || parseFloat(fte) < 0 ? <Text variant='smallError'>Set number between 0 and 1000</Text> : ''}

            </Card>
        </>
    )
}