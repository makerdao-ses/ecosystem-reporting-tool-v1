import { addBudgetStatements, addBudgetStatementWallets } from '../../api/graphql';
let statementMonths;
let budgetStatements = []
let spreadSheetMonths;
let coreUnit;
let walletAddress;
let walletName;
let token;
let ownerType;

/**
 *  Set DEBUG_UPLOAD = false to suppress debug output.
 */
const DEBUG_UPLOAD = false;

export const validateMonthsInApi = async (apiBudgetStatements, months, cu, inputWalletAddress, inputWalletName, inputLineItems, authToken, typeOfOwner) => {
    budgetStatements = [...apiBudgetStatements];
    spreadSheetMonths = months;
    coreUnit = cu;
    walletAddress = inputWalletAddress;
    walletName = inputWalletName
    token = authToken
    ownerType = typeOfOwner

    statementMonths = budgetStatements.map(statement => {
        return statement.month;
    })

    spreadSheetMonths = spreadSheetMonths.map(month => {
        return month.concat('-01');
    })
    if (DEBUG_UPLOAD) console.log('budgetStatements', budgetStatements)
    await updateApiToMissingMonths();
    const walletIds = await validateWallets();
    // this function changes the lineItems state. no need to return new array
    addWalletIdsToLineItems(inputLineItems, walletIds)
    return walletIds;
}

const addWalletIdsToLineItems = (lineItems, walletIds) => {
    // console.log('lineItems', lineItems)
    for (let lineItem of lineItems) {
        lineItem.month = lineItem.month.concat('-01')
        for (let walletId of walletIds) {
            if (lineItem.month == walletId.month) {
                lineItem.budgetStatementWalletId = walletId.walletId
            }
        }
    }
}


// verify if API includes months from spreadsheets, add missing months to arr for api later update
const getMissingMonths = () => {
    let missingMonths = []
    for (let month of spreadSheetMonths) {
        if (statementMonths.includes(month) === false) {
            missingMonths.push(month)
        }
    }


    return missingMonths;
}

const updateApiToMissingMonths = async () => {
    const months = getMissingMonths();
    // months.push("2021-01-01")
    // // months.push("2021-02-01")
    if (months.length == 0) {
        if (DEBUG_UPLOAD) console.log('no need to add new data')
    } else {
        if (DEBUG_UPLOAD) console.log('adding new budgetStatements for', months)
        await addBudgetStatementToApi(months)
    }
}

const addBudgetStatementToApi = async (months) => {
    try {
        const rows = [];
        for (let month of months) {
            const row = {
                ownerId: coreUnit ? coreUnit.id : null,
                ownerCode: coreUnit ? coreUnit.code : null,
                month: month,
                status: 'Draft',
                ownerType
            }
            rows.push(row)
        }
        const result = await addBudgetStatements(rows, token);
        const output = result.data.budgetStatementsBatchAdd
        for (let statement of output) {
            budgetStatements.push(statement)
        }

    } catch (error) {
        console.error(error)
    }
}

// TODO add check to registered wallet addresses in MIP application
const validateWallets = async () => {
    let walletIdsForDataAdd = [];
    let newBudgetStatementWallets = []
    for (let statement of budgetStatements) {

        let existingWallets = statement.budgetStatementWallet.filter(wallet => {
            return wallet.address.toLowerCase() === walletAddress.toLowerCase()
        })
        if (existingWallets.length > 0) {
            for (let wallet of existingWallets) {
                walletIdsForDataAdd.push({ walletId: wallet.id, budgetStatementId: statement.id, month: statement.month })
            }
        } else {
            let walletObj = {
                budgetStatementId: statement.id,
                name: walletName,
                address: walletAddress.toLowerCase(),
                currentBalance: 0,
                topupTransfer: 0,
                comments: '',
            }
            newBudgetStatementWallets.push(walletObj);
        }
    }

    if (DEBUG_UPLOAD) console.log('newBudgetStatementWallets', newBudgetStatementWallets);
    if (newBudgetStatementWallets.length > 0) {
        newBudgetStatementWallets.push({ cuId: coreUnit ? coreUnit.id : null })
        const result = await addBudgetStatementWallets(newBudgetStatementWallets, token);
        const newWallets = result.data.budgetStatementWalletBatchAdd;
        for (let wallet of newWallets) {
            let month = budgetStatements.find(walletObj => {
                return walletObj.id === wallet.budgetStatementId
            })
            walletIdsForDataAdd.push({ walletId: wallet.id, budgetStatementId: wallet.budgetStatementId, month: month.month })
        }

    }
    if (DEBUG_UPLOAD) console.log('walletIdsForDataAdd', walletIdsForDataAdd)
    return walletIdsForDataAdd;
}