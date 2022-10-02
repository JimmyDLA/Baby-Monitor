import AsyncStorage from '@react-native-async-storage/async-storage'
import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { persistReducer, persistStore } from 'redux-persist'
import createSagaMiddleware from 'redux-saga'
import { rootSaga } from './sagas'
import { api } from '@/Services/api'
import theme from './Theme'
import { home } from '../Reducers/home'
import { frequency } from '../Reducers/frequency'

const sagaMiddleware = createSagaMiddleware()

const reducers = combineReducers({
  theme,
  api: api.reducer,
  home,
  frequency,
})

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['theme'],
}

const reducer = persistReducer(persistConfig, reducers)

const createStore = () => {
  const newStore = configureStore({
    reducer,
    middleware: [sagaMiddleware],
  })
  sagaMiddleware.run(rootSaga)
  // console.log({ newStore })
  return newStore
}

const store = createStore()

const persistor = persistStore(store)

setupListeners(store.dispatch)

export { store, persistor }
