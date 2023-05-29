import { connect } from 'react-redux'
import { setNav, saveNewFreq } from '../Reducers/frequency'
import { setGame } from '../Reducers/home'
import EnterFreq from './EnterFreq'
// export default ExampleContainer
const mapStateToProps = ({ frequency: { room } }) => ({
  room,
})

const mapDispatchToProps = {
  setNav,
  setGame,
  saveNewFreq,
}

export default connect(mapStateToProps, mapDispatchToProps, null, {
  forwardRef: true,
})(EnterFreq)
