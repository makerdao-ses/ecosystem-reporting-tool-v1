import React, { useState, useEffect } from 'react';
import { Container, Button, Card, Label, Grid, Text, Link, Input, Flex } from 'theme-ui';
import { useDispatch } from 'react-redux';
import { storeAuthObject, resetAuthSettings } from '../actions/googleAuth';
import User from './user/user'


export default function Settings() {

	const dispatch = useDispatch();


	const [credentials, setCredentials] = useState(false);
	const [token, setToken] = useState(false)

	useEffect(() => {
		async function verifyCredentials() {
			const crd = await electron.checkCredentials();
			setCredentials(crd);
			const { state } = await electron.checkToken();
			setToken(state)
			return state;
		};
		const state = verifyCredentials();
		if (state) {
			dispatch(storeAuthObject());
		}
	}, [electron.checkCredentials, token, credentials])

	const handleGoogleCredButton = async (event) => {
		event.preventDefault();
		const credStatus = await electron.saveOAuthCredentials();
		if (credStatus) {
			setCredentials(credStatus);
		}
	}

	const handleGoogleTokenAuth = async (event) => {
		event.preventDefault();
		const authStatus = await electron.authenticate();
		if (authStatus) {
			const { state, authClient } = await electron.checkToken();
			setToken(state);
			if (state) {
				dispatch(storeAuthObject());
			}
		}
	}

	const handleResetCredentials = () => {
		const resetStatus = electron.resetCredentials();
		if (resetStatus) {
			setCredentials(false);
			setToken(false);
			dispatch(resetAuthSettings())
		}
	}

	const handleOpenLink = () => {
		electron.openLink()
	}

	return (
		<Container>
			<h1>Settings View</h1>
			<Card>
				<Grid
					columns={3}
					sx={{

					}}
				>
					<div>
						<Label>{credentials ? 'Credentials are set' : <Text>Set Credentials <Link sx={{ cursor: 'pointer' }} onClick={handleOpenLink} >learn more</Link></Text>}</Label>
						<Button
							onClick={handleGoogleCredButton}
							disabled={credentials}
						>
							Load Google Credentials
						</Button>
					</div>
					<div>
						<Label>{token ? 'Google Account Authenticated' : 'Authenticate Google Account'}</Label>
						<Button
							onClick={handleGoogleTokenAuth}
							disabled={!credentials || token}
						>
							Log In
						</Button>
					</div>
					<div>
						<Label>Reset Settings</Label>
						<Button onClick={handleResetCredentials}>Reset</Button>
					</div>
				</Grid>
			</Card>
			<User />
		</Container>
	)
}

