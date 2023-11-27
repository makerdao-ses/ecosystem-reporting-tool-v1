import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm';
import { Card, Divider, Label, Container, Textarea, Select, Button } from "theme-ui"


export default function MDView() {
    const { spreadsheetId, tabId, currency } = useParams();
    const tableData = useSelector((tableData) => tableData.tableData.links);
    const filtered = tableData.filter(item => {
        if (item.spreadsheetId == spreadsheetId && item.tabId == tabId && item.currency === currency)
            return item
    });
    const [monthsArr, setMonthsArr] = useState(filtered[0]);
    const [md, setMd] = useState('');
    const [sfMd, setSfMd] = useState('');
    const [sesView, setSESView] = useState(true)

    useEffect(() => {
        getMonth(selectedMonth);
        getSFViewMonth(selectedMonth);

    }, [getMonth, getSFViewMonth, md, sfMd])

    let keys = []
    if (monthsArr !== undefined) {
        let months = monthsArr.mdTextByMonth;
        for (const month of months) {
            let key = Object.keys(month)
            keys = [...keys, ...key]
        }
    }



    const [selectedMonth, setSelectedMonth] = useState(keys[keys.length - 1]);

    const handleSelect = (value) => {
        setSelectedMonth(value);
        getMonth(value);
        getSFViewMonth(value);
    }


    const getMonth = (selectedMonth) => {
        if (selectedMonth !== undefined) {
            let mdFormat = ' '
            let md = monthsArr.mdTextByMonth.filter(month => {
                return Object.entries(month)[0][0] === selectedMonth
            })
            mdFormat = md[0][selectedMonth];
            setMd(mdFormat);
        }

    }

    const getSFViewMonth = (selectedMonth) => {
        if (selectedMonth !== undefined) {
            let md = monthsArr.sfSummary[selectedMonth];
            setSfMd(md);
        }
    }

    const handleSESView = () => {
        setSESView(true)
    }

    const handleSFView = () => {
        setSESView(false)
    }


    return (
        <Container >
            <Card sx={{ mx: 'auto', mb: 4, my: 2 }}>
                <Label>Choose Month</Label>
                <Select onChange={e => handleSelect(e.target.value)} defaultValue={`${keys[keys.length - 1]}`}>
                    {keys.map(month => {
                        return <option key={month}>{`${month}`}</option>
                    })}
                </Select>
            </Card>
            <Card>
                <Label>Choose View Type</Label>
                <Button onClick={handleSFView} variant="smallOutline" >SF View</Button>
                <Button onClick={handleSESView} variant="smallOutline" >SES View</Button>
            </Card>
            <Card sx={{ mx: 'auto', mb: 4, my: 2 }}>
                <Label>MarkDown View for {selectedMonth}</Label>
                <Divider />
                <div style={{ overflowX: 'auto', overflowY: 'auto', whiteSpace: 'nowrap' }}>
                    <ReactMarkdown children={sesView ? md : sfMd} remarkPlugins={[remarkGfm]} />
                </div>
            </Card>
            <Card sx={{ mx: 'auto' }}>
                <Label>MarkDown Raw Text for {selectedMonth}</Label>
                <Divider />
                <Textarea rows={16} defaultValue={sesView ? md : sfMd} />
            </Card>
        </Container>
    )
}