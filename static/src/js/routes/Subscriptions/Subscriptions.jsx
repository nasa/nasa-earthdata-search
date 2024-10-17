import React from 'react'
import { withRouter } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { getEnvironmentConfig } from '../../../../../sharedUtils/config'

import SubscriptionsListContainer from '../../containers/SubscriptionsListContainer/SubscriptionsListContainer'
import SecondaryToolbarContainer from '../../containers/SecondaryToolbarContainer/SecondaryToolbarContainer'

export const Subscriptions = () => {
  const { edscHost } = getEnvironmentConfig()

  return (
    <>
      <Helmet>
        <title>Subscriptions</title>
        <meta name="title" content="Subscriptions" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={`${edscHost}`} />
      </Helmet>
      <div className="route-wrapper route-wrapper--light route-wrapper--content-page">
        <div className="route-wrapper__content">
          <div className="route-wrapper__content-inner">
            <SecondaryToolbarContainer />
            <SubscriptionsListContainer />
          </div>
        </div>
      </div>
    </>
  )
}

Subscriptions.propTypes = {}

export default withRouter(Subscriptions)
