import React, { useState, useEffect } from 'react';
import { Card, Button, Label, Input, Text, Grid, Box, Container, Badge, Link } from "theme-ui"
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { storeAuthObject } from '../../actions/googleAuth'
import { storeLinkData, removeLinkData, flagLinkDataInitialization } from '../../actions/tableData';
import processData from '../../processor/index';
import CuInfo from '../cuInfo';
import './table.css'
import { useSnackbar } from 'notistack';

/**
 * Set DEBUG_TABLE_DATA=true to get debug output in the console.
 */

const DEBUG_TABLE_DATA = false;

export default function Table() {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const initialized = useSelector((store) => store.tableData.initialized);
    const tableData = useSelector((store) => store.tableData.links);

    if (DEBUG_TABLE_DATA) console.log('Table initialization flagged:', initialized);
    if (DEBUG_TABLE_DATA) console.log('tableData:', tableData);

    useEffect(() => {
        const getTokens = async () => {
            const { state, authClient } = await electron.checkToken();
            return { state, authClient }
        }
        const { authClient } = getTokens()
        dispatch(storeAuthObject(authClient));

    }, [electron.checkToken])

    useEffect(() => {
        const prepareSheets = async () => {
            dispatch(flagLinkDataInitialization());
            if (DEBUG_TABLE_DATA) console.log("Initializing table data...");

            const gsheetLinks = await electron.getGsheetLinks();
            if (Array.isArray(gsheetLinks)) {
                if (DEBUG_TABLE_DATA) console.log(`Dispatching ${gsheetLinks.length} Gsheet links`, gsheetLinks);
                for (const record of gsheetLinks) {
                    await dispatchNewSheet(record.value.walletName, record.value.walletAddress, record.value.sheetUrl, record.id);
                }
            }
        }
        if (!initialized) {
            prepareSheets();
        }
    }, [initialized, electron.getGsheetLinks])

    const [inputSheetValue, setInputSheetValue] = useState('');
    const [validatedInput, setValidatedInput] = useState({ variant: null, valid: false, duplicate: false, linkError: false, walletFields: false });
    const [inputWalletAddress, setInputWalletAddress] = useState('');
    const [inputWalletName, setInputWalletName] = useState('Permanent Team');

    const handleWalletNameInput = (value) => {
        setInputWalletName(value);
    }
    const handleWalletAddressInput = (value) => {
        setInputWalletAddress(value);
        checkWalletInput(value);
    }


    const checkWalletInput = (value) => {
        let regex = new RegExp(/^0x[a-fA-F0-9]{40}$/);
        let result = regex.test(value);
        if (result) {
            setValidatedInput({ ...validatedInput, walletFields: true, variant: null })
        } else {
            setValidatedInput({ ...validatedInput, walletFields: false })
        }
    }

    const handleOpenWalletLink = (address) => {
        electron.openWalletLink(address)
    }


    const handleLinkInput = (value) => {
        const pattern = /\/spreadsheets\/d\/([^\/]+)\/edit[^#]*(?:#gid=([0-9]+))?/gm
        let result = pattern.exec(value);
        if (result == null) {
            setValidatedInput({ ...validatedInput, variant: 'inputError', valid: false })
        } else {
            if (result[0] !== undefined && result[1] !== undefined && result[2] !== undefined) {
                setValidatedInput({ ...validatedInput, variant: null, valid: true, duplicate: isDuplicateLink(result[1], result[2]) })
            } else {
                setValidatedInput({ ...validatedInput, variant: 'inputError', valid: false })
            }
        }
        setInputSheetValue(value)
    }

    const handleAddSheet = async (event) => {
        event.preventDefault()

        const inputParameters = {
            walletName: inputWalletName,
            walletAddress: inputWalletAddress.toLowerCase(),
            sheetUrl: inputSheetValue
        }

        const storageId = await electron.addGsheetLink(inputParameters);
        await dispatchNewSheet(inputParameters.walletName, inputParameters.walletAddress, inputParameters.sheetUrl, storageId);
    }

    const dispatchNewSheet = async (walletName, walletAddress, sheetUrl, storageId) => {
        try {
            const { result, error, rawData, spreadSheetTitle, sheetName, spreadsheetId, tabId } = await electron.getSheetInfo(sheetUrl);

            if (result === 'error') {
                setValidatedInput({ ...validatedInput, linkError: true, valid: false, variant: null })
                electron.resetGsheetLinks()
            } else {
                const { actualsByMonth, leveledMonthsByCategory, mdTextByMonth, sfSummary } = await processData(rawData, `${walletName} (ID:${storageId})`);
                dispatch(storeLinkData({ spreadSheetTitle, sheetName, spreadsheetId, tabId, actualsByMonth, leveledMonthsByCategory, mdTextByMonth, sfSummary, walletName, walletAddress, storageId }))
                setValidatedInput({ ...validatedInput, variant: null, })
                setInputWalletName('')
                setInputWalletAddress('')
                setInputSheetValue('')
            }
        } catch (error) {
            enqueueSnackbar(`Make sure to use spreadsheet tab with defined tags: ${error}`, { variant: 'error' })
        }

    }

    const handleTableRowDelete = async (e) => {
        const storageId = e.target.getAttribute('name');
        if (DEBUG_TABLE_DATA) console.log(`Removing ${storageId} from`, tableData);
        await electron.deleteGsheetLink(storageId);
        dispatch(removeLinkData(storageId))
    }

    const isDuplicateLink = (spreadsheetId, tabId) => {
        let response = tableData.filter(row => {
            return row.spreadsheetId === spreadsheetId && row.tabId === Number(tabId)
        })
        if (response.length == 0) {
            return false
        } else {
            return true
        }
    }

    const getShortFormAddress = (address) => {
        return address.substring(0, 6) + '...' + address.substring(address.length - 4);
    }

    return (
        <Container>
            <CuInfo />
            <Card sx={{ my: 2, mx: [1, "auto"], p: 0, pb: 3, maxWidth: "100%", }}>
                <Grid
                    columns={4}
                    sx={{
                        borderBottom: "1px solid",
                        borderColor: "muted",
                        px: 1,
                        py: 1
                    }}
                >
                    {["Wallet", "Google Sheet", "Tab", "Actions"].map((h, key) => (
                        <Text sx={{ fontWeight: "bold" }} key={key}>
                            {h}
                        </Text>
                    ))}
                </Grid>
                <Box
                    sx={{
                        maxHeight: "auto",
                        borderColor: "muted",
                        px: 1,
                        py: 1,
                        fontSize: "14px"

                    }}
                >
                    {tableData.map((row, key) => {
                        return (
                            <Grid
                                columns={4}
                                key={key}
                                sx={{
                                    borderBottom: "1px solid",
                                    borderColor: "muted",
                                    my: "2",
                                    py: "1"
                                }}
                            >
                                <Text>
                                    <Text sx={{ display: 'block', fontWeight: 'bold' }}>{row.walletName}</Text>
                                    <Link sx={{ cursor: 'pointer' }} onClick={() => handleOpenWalletLink(row.walletAddress)}>{getShortFormAddress(row.walletAddress)}</Link>
                                </Text>
                                <Text>{row.spreadSheetTitle}</Text>
                                <Text>{row.sheetName}</Text>
                                <Text sx={{ fontSize: "9px" }}>
                                    <Button variant="smallOutline" onClick={() => navigate(`/md/${row.spreadsheetId}/${row.tabId}`)}>To MD </Button>
                                    <Button variant="smallOutline" onClick={() => navigate(`/json/${row.spreadsheetId}/${row.tabId}`)}>To JSON </Button>
                                    <Button variant="smallOutline" onClick={() => navigate(`/api/${row.spreadsheetId}/${row.tabId}`)} >To Api</Button>
                                    <Button bg='red' variant='small' name={row.storageId} onClick={handleTableRowDelete}>Delete</Button>
                                </Text>
                            </Grid>
                        )
                    })}
                </Box>
            </Card>
            <Card sx={{ my: 4, p: 2, pb: 3, maxWidth: "100%" }}>
                <Box>
                    <Grid
                        columns={2}
                        sx={{
                            py: 1,
                            fontSize: "14px"
                        }}
                    >
                        <div>
                            <Label>
                                <span className='tooltip'>
                                    Enter Wallet Name
                                    <span className='tooltiptext'>If your CU has only one wallet please keep the name as permanent team. In case you are using more wallets, feel free to name accordingly.</span>
                                </span>
                            </Label>
                            <Input
                                sx={{ "::placeholder": { color: '#D3D3D3' } }}
                                // variant={validatedInput.variant}
                                placeholder='Permanent Team'
                                name='walletName'
                                type='text'
                                value={inputWalletName}
                                onChange={e => handleWalletNameInput(e.target.value)}
                            ></Input>
                        </div>
                        <div>
                            <Label>Enter Wallet Address</Label>
                            <Input
                                sx={{ "::placeholder": { color: '#D3D3D3' } }}
                                // variant={validatedInput.variant}
                                disabled={inputWalletName === ''}
                                placeholder='0xBE8E3e3618f7474F8cB1d074A26afFef007E98FB'
                                name='walletName'
                                type='text'
                                value={inputWalletAddress}
                                onChange={e => handleWalletAddressInput(e.target.value)}
                            ></Input>
                            {
                                !validatedInput.walletFields && inputWalletAddress !== '' ? (<Text sx={{ m: 0 }} variant="smallError">
                                    Paste the correct format - only wallet address
                                </Text>) : ''
                            }
                        </div>
                    </Grid>
                </Box>
                <Box>
                    <Label>Enter Google SpreadSheet Link</Label>
                    <Input
                        sx={{ "::placeholder": { color: '#D3D3D3' } }}
                        variant={validatedInput.variant}
                        disabled={!validatedInput.walletFields}
                        placeholder='https://docs.google.com/spreadsheets/d/1N4kcF0TiMmDlKE4K5TLT7jw48h1-nEgDelSIexT93EA/edit#gid=1845449681'
                        name='spreadsheetLink'
                        type='text'
                        value={inputSheetValue}
                        onChange={e => handleLinkInput(e.target.value)}
                    ></Input>
                    {
                        !validatedInput.valid && !validatedInput.linkError && inputSheetValue ? (<Text sx={{ m: 0 }} variant="smallError">
                            Link is not valid, make sure to copy full link
                        </Text>) : ''
                    }
                    {
                        validatedInput.linkError ? (
                            <div>
                                <Text sx={{ m: 0 }} variant="smallError">
                                    Can't access link, make sure the tool has access to your spreadsheet.
                                </Text>
                                <br />
                                <Text sx={{ m: 0 }} variant="smallError">
                                    Verify if your google auth credentials have the Google Sheet Read Scope enabled in:
                                </Text>
                                <br />
                                <Text sx={{ m: 0 }} variant="smallError">
                                    <b>"OAuth consent screen"</b> -{'>'} <b>"Scopes"</b>
                                </Text>
                            </div>
                        ) : ''
                    }

                </Box>
                <Box>
                    <Button
                        sx={{
                            mt: '10px'
                        }}
                        disabled={validatedInput.valid && !validatedInput.duplicate && validatedInput.walletFields ? false : true}
                        onClick={handleAddSheet}
                    >Add Sheet</Button>
                    {validatedInput.valid ?
                        (
                            validatedInput.duplicate ?
                                <Badge sx={{ mx: '2', bg: 'orange', color: 'black' }}>Duplicate Link</Badge>
                                :
                                <Badge sx={{ mx: '2' }}>Valid Link</Badge>
                        )
                        : ''}
                </Box>
            </Card>
        </Container>

    )
}