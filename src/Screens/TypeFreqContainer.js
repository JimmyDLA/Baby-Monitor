import { connect } from 'react-redux'
import { setNav, saveNewFreq } from '../Reducers/frequency'
import TypeFreq from './TypeFreq'
const mapStateToProps = ({ frequency: { room } }) => ({
  room,
})

const mapDispatchToProps = {
  setNav,
  saveNewFreq,
}

export default connect(mapStateToProps, mapDispatchToProps, null, {
  forwardRef: true,
})(TypeFreq)
