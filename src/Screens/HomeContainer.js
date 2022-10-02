import { connect } from 'react-redux'
import { setNav } from '../Reducers/frequency'
import { setGame } from '../Reducers/home'
import Home from './Home'
// export default ExampleContainer
const mapStateToProps = (state) => ({})

const mapDispatchToProps = {
  setNav,
  setGame,
}

export default connect(mapStateToProps, mapDispatchToProps, null, {
  forwardRef: true,
})(Home)
