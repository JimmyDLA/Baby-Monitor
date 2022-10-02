// Actions
export const SET_GAME = 'monitor/home/SET_GAME'

// Initial State
export const initialState = {
  ready: false,
}

// Reducer
export const home = (state = initialState, action) => {
  const { type, data } = action

  switch (type) {
    case SET_GAME:
      return { ...state, ready: data }

    default:
      return state
  }
}

// Action creators
export const setGame = data => {
  console.log('action creator: setGame')
  return ({ type: SET_GAME, data })
}
