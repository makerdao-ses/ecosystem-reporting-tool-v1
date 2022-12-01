import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';
import { ThemeProvider } from 'theme-ui';
import theme from '@makerdao/dai-ui-theme-maker';
import { Provider } from 'react-redux';
import configureStore from './store'
import { SnackbarProvider } from 'notistack';

const store = configureStore();

const root = createRoot(document.getElementById('app'));
root.render(
    <Provider store={store}>
        <SnackbarProvider
            autoHideDuration={4000}
            anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
            preventDuplicate={true}
        >
            <ThemeProvider theme={theme}>
                <App />
            </ThemeProvider>
        </SnackbarProvider>
    </Provider>
);
