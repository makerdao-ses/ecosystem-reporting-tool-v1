import React, { useState, useEffect, forceUpdate } from 'react';
import { Card, Label, Badge, Link, Grid, Button, Spinner } from "theme-ui"
import { useQuery, gql, useMutation } from "@apollo/client";
import { getCoreUnit, getBudgetSatementInfo, deleteBudgetLineItems, getUsers } from '../api/graphql';
import { validateMonthsInApi } from './utils/validateMonths';
import { validateLineItems, getCanonicalCategory } from './utils/validateLineItems'
import { useSelector } from 'react-redux';
import FTE from './fte/fte';
import CommentTable from './comment/commentTable';
import { useSnackbar } from 'notistack';
import BudgetStatementComment from './bsComment/bsComment';

/**
 *  Set DEBUG_UPLOAD = false to suppress debug output.
 */
const DEBUG_UPLOAD = false;

export default function UploadToDB(props) {

    const userFromStore = useSelector(store => store.user)
    const { walletName, walletAddress, actualsByMonth, selectedMonth, leveledMonthsByCategory } = props.props;
    const [uploadStatus, setUploadStatus] = useState({ updatingDb: false, noChange: false, overriding: false, uploading: false })
    const [currentBudget, setcurrentBudget] = useState('')

    const [lineItems, setLineItems] = useState([])
    const [coreUnit, setCoreUnit] = useState();
    const [walletIds, setWalletIds] = useState()
    const [walletId, setWalletId] = useState();
    const [users, setUsers] = useState([]);

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    useEffect(() => {
        fetchUsers()
        parseDataForApi()
        fetchCoreUnit()
        handleMonthChange()
    }, [fetchCoreUnit, parseDataForApi, lineItems, selectedMonth, walletId]);

    const fetchUsers = async () => {
        const result = await getUsers();
        setUsers(result.data.users)
    }

    const ADD_BUDGET_LINE_ITEMS = gql`
        mutation budgetLineItemsBatchAdd($input: [LineItemsBatchAddInput]) {
            budgetLineItemsBatchAdd(input: $input) {
                    id                    
                }
            }
            `
        ;

    const [budgetLineItemsBatchAdd, { data, loading, error }] = useMutation(ADD_BUDGET_LINE_ITEMS, {
        fetchPolicy: 'no-cache',
        context: {
            headers: {
                authorization: `Bearer ${userFromStore.authToken}`
            }
        }
    });

    const getOwnerType = () => {
        let ownerType = 'CoreUnit'
        userFromStore.roles.forEach(role => {
            if (role.cuId == userFromStore.cuId && role.name === 'DelegatesAdmin') {
                ownerType = 'Delegates'
            }
        });
        return ownerType;
    }

    const fetchCoreUnit = async () => {
        const rawCoreUnit = await getCoreUnit(userFromStore.cuId)
        const rawBudgetStatements = await getBudgetSatementInfo(rawCoreUnit.data.coreUnits[0].id, getOwnerType())
        const budgetStatements = rawBudgetStatements.data.budgetStatements;
        const [selectedBudget] = budgetStatements.filter(b => {
            return b.month === selectedMonth.concat('-01')
        })
        setcurrentBudget(selectedBudget)
        const idsWallets = await validateMonthsInApi(budgetStatements, getAllMonths(), rawCoreUnit.data.coreUnits[0], walletAddress, walletName, lineItems, userFromStore.authToken, getOwnerType());
        setWalletIds(idsWallets);
        const wallet = idsWallets.find((wallet) => {
            if (wallet.month === `${selectedMonth}-01`) {
                return wallet.walletId
            }
        })
        setWalletId(wallet.walletId)
        setCoreUnit(rawCoreUnit.data.coreUnits[0])
    }

    function getAllMonths() {
        if (leveledMonthsByCategory !== undefined) {
            let months = {};

            for (let category in leveledMonthsByCategory) {
                for (let group in leveledMonthsByCategory[category]) {
                    for (let month in leveledMonthsByCategory[category][group]) {
                        months[month] = true;
                    }
                }
            }
            return Object.keys(months)
        }
    }

    const parseDataForApi = () => {
        lineItems.splice(0, lineItems.length)
        const months = getAllMonths();

        if (months !== undefined) {
            for (let category in leveledMonthsByCategory) {
                let canonicalObj = getCanonicalCategory(category);
                for (let group in leveledMonthsByCategory[category]) {
                    for (let month of months) {
                        const row = createRowObject(month, category, canonicalObj, group, leveledMonthsByCategory);
                        if (!isEmptyRow(row)) {
                            lineItems.push(row);
                        }
                    }
                }
            }
        }

        if (DEBUG_UPLOAD) console.log('[DEBUG_UPLOAD] lineItems', lineItems);
    }

    const isEmptyRow = (row) => {
        return (row.actual == 0) && (row.forecast == 0) && (row.payment == 0) && (row.budgetCap == 0);
    }

    const createRowObject = (month, category, canonicalObj, group, lookup) => {
        const rowObject = {
            budgetStatementWalletId: null,
            month: "",
            position: 0,
            group: '',
            budgetCategory: '',
            forecast: 0,
            actual: 0,
            comments: '',
            canonicalBudgetCategory: '',
            headcountExpense: '',
            budgetCap: 0,
            payment: 0
        };
        rowObject.month = month;
        rowObject.position = canonicalObj ? canonicalObj.position : 0;
        rowObject.group = group === 'undefined' ? '' : group;
        rowObject.budgetCategory = category;
        rowObject.forecast = roundNumber(lookup[category][group][month].forecast);
        rowObject.actual = roundNumber(lookup[category][group][month].actual);
        rowObject.comments = '';
        rowObject.canonicalBudgetCategory = canonicalObj ? canonicalObj.canonicalCategory : null;
        rowObject.headcountExpense = canonicalObj ? canonicalObj.headCountExpense : null;
        rowObject.budgetCap = roundNumber(lookup[category][group][month].budget);
        rowObject.payment = roundNumber(lookup[category][group][month].paid);
        return rowObject;
    }

    const getNextThreeMonths = (selectedMonth) => {
        if (selectedMonth !== undefined) {
            const date = selectedMonth;
            let monthsToUpload = [];
            monthsToUpload.push(date);

            const toNumber = date.split('-');
            let year = Number(toNumber[0])
            let month = Number(toNumber[1])
            let yearString = String(year);

            for (let i = 1; i <= 3; i++) {
                let newMonth = month + i;
                let leading0 = newMonth < 10 ? '0' : '';
                let monthString = leading0 + String(newMonth)

                if (newMonth > 12) {
                    yearString = String(year + 1)
                }
                if (newMonth === 13) {
                    monthString = '01'
                }
                if (newMonth === 14) {
                    monthString = '02'
                }
                if (newMonth === 15) {
                    monthString = '03'
                }
                let result = yearString.concat('-').concat(monthString)
                monthsToUpload.push(result)
            }
            return monthsToUpload;
        }
    }

    const filterFromLineItems = (selectedMonth) => {
        // fetching walletIf of selected month so it can be applied to all lineItems 
        // under selectedMonth
        const walletId = walletIds.filter(wallet => {
            return wallet.month === selectedMonth.concat('-01')
        })
        if (DEBUG_UPLOAD) console.log('[DEBUG_UPLOAD] walletId', walletId)
        const months = getNextThreeMonths(selectedMonth);
        if (months !== undefined) {
            let filtered = [];
            for (let i = 0; i < months.length; i++) {
                let selectedLineItems = lineItems.filter(item => {
                    if (item.month === months[i].concat('-01')) {
                        item.budgetStatementWalletId = walletId[0].walletId
                        return item;
                    }
                })
                filtered.push(...selectedLineItems);
                selectedLineItems = null
            }
            let cleanedActualsInNextThreeMonths = cleanActualsInNextThreeMonths(months, filtered)
            if (DEBUG_UPLOAD) console.log('[DEBUG_UPLOAD] filtered months to upload', filtered)
            return cleanedActualsInNextThreeMonths;
        }

    }

    const cleanActualsInNextThreeMonths = (months, lineItems) => {
        let cleanLineItems;
        let count = 0;
        for (let i = 1; i < months.length; i++) {
            cleanLineItems = lineItems.map(item => {
                if (item.month == months[i].concat('-01')) {
                    if (item.actual > 0) {
                        count++;
                    }
                    item.actual = 0;
                }
                return item;
            })
        }
        if (count > 0) {
            enqueueSnackbar(`Attention: ${count} actuals for future months have been reported as 0. (This warning is to be expected if you're uploading old expense reports.)`,
                { variant: 'alert', autoHideDuration: 8000 });
        }
        return cleanLineItems;
    }

    const handleMonthChange = async () => {

        if (DEBUG_UPLOAD) console.log('[DEBUG_UPLOAD] month has changed', selectedMonth)
        setUploadStatus({ ...uploadStatus, updatingDb: false, noChange: false, overriding: false, uploading: false })

    }

    const handleUpload = async () => {
        const id = walletId
        setWalletId('')
        try {
            setUploadStatus({ ...uploadStatus, updatingDb: true })

            let data = filterFromLineItems(selectedMonth)
            const { lineItemsToDelete, lineItemsToUpload } = await validateLineItems(data);
            if (DEBUG_UPLOAD) console.log('[DEBUG_UPLOAD] data to delete', lineItemsToDelete)
            if (DEBUG_UPLOAD) console.log('[DEBUG_UPLOAD] data to upload:', lineItemsToUpload)

            if (lineItemsToDelete.length > 0 && lineItemsToUpload.length > 0) {
                lineItemsToDelete.push({ cuId: userFromStore.cuId, ownerType: getOwnerType() })
                lineItemsToUpload.push({ cuId: userFromStore.cuId, ownerType: getOwnerType() })
                if (DEBUG_UPLOAD) console.log('[DEBUG_UPLOAD] deleting and updating lineItems')
                await deleteBudgetLineItems(lineItemsToDelete, userFromStore.authToken)
                await budgetLineItemsBatchAdd({ variables: { input: lineItemsToUpload } });
                setUploadStatus({ ...uploadStatus, updatingDb: false, overriding: true })
                enqueueSnackbar(`Updated expense report`, { variant: 'success' })
            }
            if (lineItemsToDelete.length === 0 && lineItemsToUpload.length > 0) {
                lineItemsToUpload.push({ cuId: userFromStore.cuId, ownerType: getOwnerType() })
                if (DEBUG_UPLOAD) console.log('[DEBUG_UPLOAD] adding new lineItems')
                await budgetLineItemsBatchAdd({ variables: { input: lineItemsToUpload } });
                setUploadStatus({ ...uploadStatus, updatingDb: false, uploading: true });
                enqueueSnackbar(`Added a new expense report`, { variant: 'success' })
            }
        } catch (error) {
            setUploadStatus({ ...uploadStatus, updatingDb: false })
            enqueueSnackbar(`${error}`, { variant: 'error' })
        }
        setWalletId(id)
    }



    const roundNumber = (number) => {
        return Number(Math.round(parseFloat(number + 'e' + 2)) + 'e-' + 2)
    }


    const handleViewExpense = () => {
        electron.openDashboardLink(coreUnit.shortCode)
    }

    return (
        <>
            <FTE month={`${selectedMonth}-01`} budgetStatement={currentBudget} coreUnit={coreUnit} />
            <BudgetStatementComment budgetStatementId={currentBudget ? currentBudget.id : undefined} users={users} />
            <Grid
                columns={2}
            >
                <Card sx={{ mt: '10px' }}>
                    <Label onChange={handleMonthChange}>Upload {selectedMonth} actuals and forecasts to ecosystem dashboard API</Label>
                    {uploadStatus.updatingDb ? <Spinner variant="styles.spinner" title="loading"></Spinner> :
                        <Button onClick={handleUpload} variant="smallOutline" >Upload</Button>}
                    {uploadStatus.noChange ? <Badge sx={{ mx: '2' }}>Data is up to date</Badge> : ''}
                    {uploadStatus.overriding ? <Badge sx={{ mx: '2', bg: 'yellow', color: 'black' }}>Updated</Badge> : ''}
                    {uploadStatus.uploading ? <Badge sx={{ mx: '2', bg: 'yellow', color: 'black' }}>Uploaded</Badge> : ''}
                </Card>
                <Card sx={{ mt: '10px' }}>
                    <Label>
                        <Link sx={{ cursor: 'pointer' }} onClick={handleViewExpense}>View your reported data on the dashboard {arrow}</Link>
                    </Label>
                </Card>
            </Grid>
            <CommentTable walletId={walletId} month={`${selectedMonth}-01`} ownerType={getOwnerType()} />
        </>
    )
}

const arrow = <svg width="10" height="10" viewBox="0 0 6 6" fill="none" xmlns="http://www.w3.org/2000/svg" ><path d="M0.731619 5.87448C0.564249 6.04184 0.292894 6.04184 0.125524 5.87448C-0.0418414 5.70712 -0.0418414 5.43575 0.125524 5.26839L4.53677 0.857144H1.71429C1.47759 0.857144 1.28571 0.665268 1.28571 0.428572C1.28571 0.191876 1.47759 0 1.71429 0H5.57113C5.57156 0 5.57229 0 5.57271 0C5.63036 0.000171429 5.6853 0.0117215 5.73549 0.0325201C5.78567 0.0532801 5.83269 0.0839787 5.87357 0.12462C5.87417 0.125225 5.87477 0.125829 5.87537 0.126437C5.95813 0.209675 5.99966 0.318433 6 0.427286C6 0.427715 6 0.428144 6 0.428572V4.28572C6 4.52242 5.80813 4.71429 5.57143 4.71429C5.33473 4.71429 5.14286 4.52242 5.14286 4.28572V1.46324L0.731619 5.87448Z" fill="#447AFB"></path></svg>