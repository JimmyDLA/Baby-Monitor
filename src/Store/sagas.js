import { all, fork } from 'redux-saga/effects'

//import all SAGAS\
import { watchHome } from '../Sagas/Home.saga'
import { watchFreq } from '../Sagas/Freq.saga'

export function* rootSaga() {
  yield all([watchFreq(), watchHome()])
  // code after all-effect
}
