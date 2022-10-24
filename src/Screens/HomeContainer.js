import { connect } from 'react-redux'
import { setNav, saveNewFreq } from '../Reducers/frequency'
import { setGame } from '../Reducers/home'
import Home from './Home'
// export default ExampleContainer
const mapStateToProps = (state) => ({})

const mapDispatchToProps = {
  setNav,
  setGame,
  saveNewFreq,
}

export default connect(mapStateToProps, mapDispatchToProps, null, {
  forwardRef: true,
})(Home)
