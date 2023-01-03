import { connect } from 'react-redux'
import { startNewFrequency, setNav } from '../Reducers/frequency'
import CreateFreq from './CreateFreq'
// export default ExampleContainer
const mapStateToProps = ({ frequency: { room } }) => ({
  room,
})

const mapDispatchToProps = {
  startNewFrequency,
  setNav,
}

export default connect(mapStateToProps, mapDispatchToProps, null, {
  forwardRef: true,
})(CreateFreq)
