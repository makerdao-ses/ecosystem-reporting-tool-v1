import React, { useEffect, useState } from 'react';
import Settings from './components/settings'
import Navbar from './components/navbar';
import BudgetSheet from './components/budgetSheet';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import JSONView from './components/exportJSONview';
import MDView from './components/exportMDview';
import ApiView from './components/exportApiView';
import {
    ApolloClient, InMemoryCache, ApolloProvider
} from "@apollo/client";
import AppVersionAlert from './components/modal/appVersionAlert';

export default function App() {
    const [isDev, setIsDev] = useState(false);
    const [isStaging, setIsStaging] = useState(false);

    useEffect(() => {
        async function setDev() {
            const dev = await electron.getIsDev();
            setIsDev(dev);
            const staging = await electron.getIsStaging();
            setIsStaging(staging)
        }
        setDev()
    }, []);

    const client = new ApolloClient({
        uri: isDev && isStaging === false ? 'https://publish-dev-vpighsmr70zxa92r9w.herokuapp.com/graphql'
            :
            isDev === false && isStaging === false ?
                'https://ecosystem-dashboard.herokuapp.com/graphql'
                :
                isDev === false && isStaging === true && 'https://staging-ecosystem-dashboard.herokuapp.com/graphql'
        ,
        // uri: 'http://localhost:4000/graphql',
        cache: new InMemoryCache()
    });

    return (
        <>
            <ApolloProvider client={client}>
                <AppVersionAlert />
                <Router>
                    <Navbar />
                    <Routes>
                        <Route path='/' element={<BudgetSheet />} />
                        <Route path='/settings' element={<Settings />} />
                        <Route path='/json/:spreadsheetId/:tabId/:currency/' element={<JSONView />} />
                        <Route path='/md/:spreadsheetId/:tabId/:currency/' element={<MDView />} />
                        <Route path='/api/:spreadsheetId/:tabId/:currency/' element={<ApiView />} />
                    </Routes>
                </Router>
            </ApolloProvider>
        </>

    )
};