import React, { useEffect, useState } from 'react';
import Modal from './modal';
import { getBudgetToolVersion } from '../../api/graphql';

export default function AppVersionAlert() {
    const [openModal, setOpenModal] = useState(false);
    const [appVersion, setAppVersion] = useState('')
    const [latestVersion, setLatestVersion] = useState('');
    const [link, setLink] = useState('');

    useEffect(() => {
        const checkUpdate = async () =>{
            await needingUpdate()
        };
        checkUpdate()
        const interval = setInterval(async () => {
            await needingUpdate()
        }, 60000)
        return () => clearInterval(interval);
    }, []);

    const needingUpdate = async () => {
        const version = await electron.getAppVersion();
        const data = await getBudgetToolVersion();
        setLatestVersion(data.data.latestBudgetToolVersion[0].version)
        setAppVersion(version)
        setLink(data.data.latestBudgetToolVersion[0].link)
        if (isSameVersion(version, data.data.latestBudgetToolVersion[0].version)) {
            setOpenModal(true)
        }
    }

    const isSameVersion = (appVersion, latestVersion) => {
        const result = appVersion.localeCompare(latestVersion, undefined, { numeric: true, sensitivity: 'base' })
        if (result === -1) return true;
        return false;
    }

    const handleCloseModal = (event) => {
        event.preventDefault();
        setOpenModal()
    }

    return (
        <>
            {openModal && <Modal closeModal={handleCloseModal} currentVersion={appVersion} newVersion={latestVersion} link={link} />}
        </>
    )
}