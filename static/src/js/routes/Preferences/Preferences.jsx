import React from 'react'
import { withRouter } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import SecondaryToolbarContainer from '../../containers/SecondaryToolbarContainer/SecondaryToolbarContainer'

import PreferencesContainer from '../../containers/PreferencesContainer/PreferencesContainer'

import { getEnvironmentConfig } from '../../../../../sharedUtils/config'

export const Preferences = () => {
  const { edscHost } = getEnvironmentConfig()

  return (
    <>
      <Helmet>
        <title>Preferences</title>
        <meta name="title" content="Preferences" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={`${edscHost}/preferences`} />
      </Helmet>
      <div className="route-wrapper route-wrapper--light route-wrapper--content-page">
        <div className="route-wrapper__content">
          <div className="route-wrapper__content-inner">
            <SecondaryToolbarContainer />
            <PreferencesContainer />
          </div>
        </div>
      </div>
    </>
  )
}

export default withRouter(Preferences)
