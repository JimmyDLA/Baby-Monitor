// Actions
export const SET_NAV = 'monitor/frequency/SET_NAV'
export const START_NEW_FREQ = 'monitor/frequency/START_NEW_FREQ'
export const SAVED_NEW_FREQ = 'monitor/frequency/SAVED_NEW_FREQ'
export const SAVED_STREAMS = 'monitor/frequency/SAVED_STREAMS'

// Initial State
export const initialState = {
  // ready: false,
}

// Reducer
export const frequency = (state = initialState, action) => {
  const { type, data } = action

  switch (type) {
    case SAVED_NEW_FREQ:
      return { ...state, room: data }
    case SAVED_STREAMS:
      return { ...state, streams: [...state.streams, data] }
    default:
      return state
  }
}

// Action creators
export const setNav = data => ({ type: SET_NAV, data })
export const startNewFrequency = () => ({ type: START_NEW_FREQ })
export const saveNewFreq = data => ({ type: SAVED_NEW_FREQ, data })
export const saveStreams = data => ({ type: SAVED_STREAMS, data })
