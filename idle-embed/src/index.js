import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Log from './Components/Log';
import reportWebVitals from './reportWebVitals';

import "98.css";

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  //<React.StrictMode>
  <div>
    <App />
    
    <Log />
  </div>
    
  //</React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

/*export{
  petName,
  getTalk,
  newTalk,
}*/