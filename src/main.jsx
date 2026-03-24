import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App/App'

import 'normalize.css';


import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App></App>
  </React.StrictMode>,
);


// const h1 = document.createElement('h1')
// h1.textContent = 'Hello'
// document.getElementById('root').append(h1)