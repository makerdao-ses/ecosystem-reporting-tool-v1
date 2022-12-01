import React, { useEffect, useState } from 'react';
import { Container, Flex, Heading, Button, Divider } from "theme-ui"
import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
    const [isDev, setIsDev] = useState(false);
    const [isStaging, setIsStaging] = useState(false);

    useEffect(() => {
        async function setEnv() {
            const dev = await electron.getIsDev();
            setIsDev(dev);
            const staging = await electron.getIsStaging();
            setIsStaging(staging)
        }
        setEnv()
    }, []);

    const navigate = useNavigate();
    return (
        <Container>
            {isDev && isStaging === false ? <Heading>MakerDAO Budget Tool <span style={{ color: 'red' }}>Test</span> </Heading>
                :
                isDev === false && isStaging === false ? <Heading>MakerDAO Budget Tool</Heading>
                    :
                    isDev == false && isStaging == true &&<Heading>MakerDAO Budget Tool <span style={{ color: 'blue' }}>Staging</span> </Heading>
            }
            <Divider></Divider>
            <Flex variant="flex.header">
                <Flex as="nav">
                    <Button onClick={() => navigate('/')} sx={{ mx: 1 }}>Budget Sheets</Button>
                    <Button onClick={() => navigate('/settings')}>Settings</Button>
                </Flex>
            </Flex>
        </Container>
    )
}