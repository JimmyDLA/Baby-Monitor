import { connect } from 'react-redux'
import { setNav, saveNewFreq } from '../Reducers/frequency'
import JoinFreq from './JoinFreq'
// export default ExampleContainer
const mapStateToProps = ({ frequency: { room } }) => ({
  room,
})

const mapDispatchToProps = {
  setNav,
  saveNewFreq,
}

export default connect(mapStateToProps, mapDispatchToProps, null, {
  forwardRef: true,
})(JoinFreq)
