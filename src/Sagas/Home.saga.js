import { takeEvery } from 'redux-saga/effects'
import { SET_GAME } from '../Reducers/home'
import { navigate } from '../Navigators/utils'
/**
 * The startup saga is the place to define behavior to execute when the application starts.
 */
export function* doSetGame() {
  try {
    navigate('CreateFreq')
  } catch (error) {
    console.warn(error)
  }
}
export function* watchHome() {
  yield takeEvery(SET_GAME, doSetGame)
}
