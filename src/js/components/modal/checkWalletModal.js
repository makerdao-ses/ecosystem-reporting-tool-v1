import React from 'react';
import './modal.css'
import { Button, Text } from 'theme-ui'

export default function CheckWalletModal({ closeModal, continueNavigation, walletName, walletAddress }) {

    return (
        <div className='modalBackground'>
            <div className='modalContainer' style={{height: 350}}>
                <div className='titleCloseBtn'>
                    <button onClick={(event) => closeModal(event)}>x</button>
                </div>
                <div style={{textAlign: 'center'}}>
                    <h3>Attention</h3>
                </div>
                <div>
                    <p>Are you sure you want to push data to this wallet?
                        This wallet has not been selected before</p>
                    <p>Wallet Name: <span style={{ fontWeight: 'bold' }}>{walletName}</span></p>
                    <p>Wallet Address: <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{walletAddress}</span></p>
                </div>
                <div className='footer'>
                    <Button bg='red' onClick={(event) => closeModal(event)}>Cancel</Button>
                    <Button onClick={continueNavigation}>Continue</Button>
                </div>
            </div>
        </div>
    )
}