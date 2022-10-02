import { connect } from 'react-redux'
import { setNav } from '../Reducers/frequency'
import JoinFreq from './JoinFreq'
// export default ExampleContainer
const mapStateToProps = (state) => ({})

const mapDispatchToProps = {
  setNav,
}

export default connect(mapStateToProps, mapDispatchToProps, null, {
  forwardRef: true,
})(JoinFreq)
