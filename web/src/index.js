import React from 'react';
import { render } from 'react-dom'
import './index.css';
import { BrowserRouter } from 'react-router-dom'
import { unregister } from './registerServiceWorker';
import App from './components/App';

// Redux Store
import { Provider } from 'react-redux'
import { configureStore } from './store'

const store = configureStore();

render((
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
), document.getElementById('root'));

unregister();
