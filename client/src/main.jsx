import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './redux/store.js'
import ApolloWrapper from './apollo/ApolloWrapper.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <ApolloWrapper>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ApolloWrapper>
    </Provider>
  </StrictMode>,
)
