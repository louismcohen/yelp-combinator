import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Map from './Map';
import {Helmet} from "react-helmet";

import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import { CaptureConsole as CaptureConsoleIntegration } from '@sentry/integrations';

// import reportWebVitals from './reportWebVitals';
// import ReactGA from 'react-ga4';

// const MEASUREMENT_ID = 'G-4674ER0DHD';
// ReactGA.initialize(MEASUREMENT_ID);
// ReactGA.send('pageview');

Sentry.init({
    dsn: "https://b8b530bf641b4634a487354b1b824fb4@o1208538.ingest.sentry.io/6341791",
    integrations: [
        new BrowserTracing(),
        new Sentry.Replay(),
        new CaptureConsoleIntegration()
    ],
  
    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 1.0,
    replaysOnErrorSampleRate: 1.0
  });

ReactDOM.render( 
    <React.StrictMode>
        <Map />
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();