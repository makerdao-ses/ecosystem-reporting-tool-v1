import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Card, Label, Container, Select } from "theme-ui"
import UploadToDB from './uploadToDB.js';

export default function ApiView() {
    const { spreadsheetId, tabId, currency } = useParams();
    const tableData = useSelector((tableData) => tableData.tableData.links);
    const filtered = tableData.filter(item => {
        if (item.spreadsheetId == spreadsheetId && item.tabId == tabId && item.currency === currency)
            return item
    })

    const [monthsArr, setMonthsArr] = useState(filtered[0]);
    const [jsonData, setJsonData] = useState('')

    useEffect(() => {
        getMonth(selectedMonth)

    }, [getMonth, jsonData])

    //Getting available actual months
    let keys = []
    let leveledMonthsByCategory;
    let walletName;
    let walletAddress;
    let actualsByMonth;
    if (monthsArr !== undefined) {
        let months = monthsArr.mdTextByMonth;
        walletName = monthsArr.walletName;
        walletAddress = monthsArr.walletAddress;
        actualsByMonth = monthsArr.actualsByMonth;
        leveledMonthsByCategory = monthsArr.leveledMonthsByCategory;
        for (const month of months) {
            let key = Object.keys(month)
            keys = [...keys, ...key]
        }
    }

    // Filtering months to latest current month so no future budget statements are pushed
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear()
    const index = keys.indexOf(currentYear + '-' + currentMonth);
    let filteredKeys
    if (index !== -1) {
        filteredKeys = keys.slice(0, index + 1)
    } else {
        filteredKeys = keys;
    }

    // console.log('leveledMonthsByCategory', leveledMonthsByCategory)

    const [selectedMonth, setSelectedMonth] = useState(filteredKeys[filteredKeys.length - 1]);

    const handleSelect = (value) => {
        setSelectedMonth(value)
        getMonth(value)

    }

    const getMonth = (selectedMonth) => {
        if (selectedMonth !== undefined) {
            let json = monthsArr.actualsByMonth[selectedMonth]
            setJsonData(json)
        }
    }


    return (
        <Container >
            <Card sx={{ mx: 'auto', mb: 4, my: 2 }}>
                <Label>Choose Month</Label>
                <Select onChange={e => handleSelect(e.target.value)} defaultValue={`${filteredKeys[filteredKeys.length - 1]}`}>
                    {filteredKeys.map(month => {
                        return <option key={month}>{`${month}`}</option>
                    })}
                </Select>
            </Card>
            <UploadToDB props={{ selectedMonth, keys, leveledMonthsByCategory, walletName, walletAddress, actualsByMonth, currency }} />
        </Container>
    )
}