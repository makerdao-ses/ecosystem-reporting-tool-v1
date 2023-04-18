import React from 'react';
import './modal.css'
import { Button } from 'theme-ui'

export default function CheckWalletModal({ closeModal, continueNavigation }) {

    return (
        <div className='modalBackground'>
            <div className='modalContainer'>
                <div className='titleCloseBtn'>
                    <button onClick={(event) => closeModal(event)}>x</button>
                </div>
                <div className='title'>
                    <h3>Attention</h3>
                </div>
                <div>
                    <p>Are you sure you want to push data to this wallet?
                        This wallet has not been selected before</p>
                </div>
                <div className='footer'>
                    <Button bg='red' onClick={(event) => closeModal(event)}>Cancel</Button>
                    <Button onClick={continueNavigation}>Continue</Button>
                </div>
            </div>
        </div>
    )
}