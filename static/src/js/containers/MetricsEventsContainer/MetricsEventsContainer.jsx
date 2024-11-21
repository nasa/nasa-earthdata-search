import { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { metricsClick } from '../../middleware/metrics/actions'

export const mapDispatchToProps = (dispatch) => ({
  onMetricsClick:
    (data) => dispatch(metricsClick(data))
})

export class MetricsEventsContainer extends Component {
  constructor() {
    super()
    this.metricsClick = this.metricsClick.bind(this)
  }

  componentDidMount() {
    document.body.addEventListener('click', this.metricsClick)
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.metricsClick)
  }

  metricsClick(event) {
    console.log('🚀 ~ file: MetricsEventsContainer.jsx:27 ~ MetricsEventsContainer ~ event:', event)
    const { onMetricsClick } = this.props
    const { target } = event
    console.log('🚀 ~ file: MetricsEventsContainer.jsx:30 ~ MetricsEventsContainer ~ target:', target)

    const clickableParent = target.closest('a, button')

    if (!clickableParent) {
      console.log('no clickable parent found!')
    }

    const title = target.title || target.text || target.name || target.innerText
    console.log('🚀 ~ file: MetricsEventsContainer.jsx:39 ~ MetricsEventsContainer ~ title:', title)

    onMetricsClick({
      elementLabel: title
    })
  }

  render() {
    return null
  }
}

MetricsEventsContainer.propTypes = {
  onMetricsClick: PropTypes.func.isRequired
}

export default connect(null, mapDispatchToProps)(MetricsEventsContainer)
