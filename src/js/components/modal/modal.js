import React from 'react';
import './modal.css'
import { Button, Text } from 'theme-ui'

export default function Modal({ closeModal, currentVersion, newVersion, link }) {

    const handleDownloadButton = () => {
        electron.openGithubRelease(link);
    }

    return (
        <div className='modalBackground'>
            <div className='modalContainer'>
                <div className='titleCloseBtn'>
                    <button onClick={(event) => closeModal(event)}>x</button>
                </div>
                <div className='title'>
                    <h3>Budget Tool Update</h3>
                </div>
                <div>
                    <p>There's a new version, download and update.</p>
                    <Text>Current Version: {currentVersion}</Text>
                    <br />
                    <Text>New Version: {newVersion}</Text>
                </div>
                <div className='footer'>
                    <Button bg='red' onClick={(event) => closeModal(event)}>Cancel</Button>
                    <Button onClick={handleDownloadButton}>More Info</Button>
                </div>
            </div>
        </div>
    )
}