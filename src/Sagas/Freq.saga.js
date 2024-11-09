import { call as calling, put, takeEvery } from 'redux-saga/effects'
import { saveNewFreq, SET_NAV, START_NEW_FREQ } from '../Reducers/frequency'
import { navigate } from '../Navigators/utils'
// import crashlytics from '@react-native-firebase/crashlytics'


/**
 * The startup saga is the place to define behavior to execute when the application starts.
 */
const URL = 'http://localhost:3000'

export function* doSetNav(action) {
  try {
    // When those operations are finished we redirect to the main screen
    const {
      data: { screen },
    } = action

    navigate(screen)
  } catch (error) {
    console.warn(error)
    // crashlytics().recordError(error, 'SET_NAV')
  }
}

// export function* doStartNewFreq() {
//   try {
//     console.log('doStartNewFreq')
//     debugger

//     const { data } = yield calling(axios.get, URL)
//     debugger
//     yield put(saveNewFreq(data))
//   } catch (error) {
//     console.warn(error)
//   }
// }

export function* watchFreq() {
  yield takeEvery(SET_NAV, doSetNav)
  // yield takeEvery(START_NEW_FREQ, doStartNewFreq)
}
