import { createRoot } from 'react-dom/client';
import React from 'react';
//import ReactBoilerplate from './ReactBoilerplate';
//import DASHApp from '@app/DASHApp';
import { AppWrapper } from 'dash-admin';

/* Dependency Styles */
import 'react-toastify/dist/ReactToastify.css';
/* Fonts */
import './assets/fonts/Montserrat-Black.ttf';
import './assets/fonts/Montserrat-Bold.ttf';
import './assets/fonts/Montserrat-Medium.ttf';
import './assets/fonts/Montserrat-Regular.ttf';
import './assets/fonts/Montserrat-SemiBold.ttf';

/* App styles */
//import './dash-variables.less';
// Not required to import, handled by vite
// additional styles:

import "dash-styles/dash.less";
import './styles.less';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement as HTMLElement);

const AppComponent = React.lazy(() => {
    return new Promise((resolve) => setTimeout(resolve, 1 * 1000)).then(
        // @ts-ignore
        () => import('@app/DASHApp'), 
    );
});

root.render(<React.StrictMode>
        <AppWrapper>
            <AppComponent />
        </AppWrapper>
        { /* Use DashMinimal component to see a minimal dashboard implementation with default components */ }
        { /* Use DashApp component to see the full customized application */ }
  </React.StrictMode>)