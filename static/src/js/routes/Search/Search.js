import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import {
  Route,
  Switch,
  withRouter
} from 'react-router-dom'

import ConnectedEdscMapContainer
  from '../../containers/MapContainer/MapContainer'
import ConnectedMasterOverlayPanelContainer
  from '../../containers/MasterOverlayPanelContainer/MasterOverlayPanelContainer'
import ConnectedSearchFormContainer
  from '../../containers/SearchFormContainer/SearchFormContainer'
import CollectionResultsTabContainer
  from '../../containers/CollectionResultsTabContainer/CollectionResultsTabContainer'
import GranuleResultsTabContainer
  from '../../containers/GranuleResultsTabContainer/GranuleResultsTabContainer'
import GranuleResultsBodyContainer
  from '../../containers/GranuleResultsBodyContainer/GranuleResultsBodyContainer'
import GranuleResultsHeaderContainer
  from '../../containers/GranuleResultsHeaderContainer/GranuleResultsHeaderContainer'
import MyDropzone
  from '../../components/MyDropzone/MyDropzone'
import SidebarContainer
  from '../../containers/SidebarContainer/SidebarContainer'
import CollectionResultsHeader
  from '../../components/CollectionResults/CollectionResultsHeader'
import CollectionResultsBody
  from '../../components/CollectionResults/CollectionResultsBody'

import '../../components/CollectionResults/CollectionResults.scss'

const headerCollectionResults = <CollectionResultsHeader />
const bodyCollectionResults = <CollectionResultsBody />

const headerGranuleResults = <GranuleResultsHeaderContainer />
const bodyGranuleResults = <GranuleResultsBodyContainer />


class Search extends PureComponent {
  render() {
    const { match } = this.props
    return (
      <div className="route-wrapper route-wrapper--search search">
        <ConnectedEdscMapContainer />
        <MyDropzone />
        <SidebarContainer />
        <ConnectedSearchFormContainer />
        <Switch>
          <Route exact path={match.path}>
            <ConnectedMasterOverlayPanelContainer
              tabHandle={<CollectionResultsTabContainer />}
              header={headerCollectionResults}
              body={bodyCollectionResults}
            />
          </Route>
          <Route path={`${match.path}/granules`}>
            <ConnectedMasterOverlayPanelContainer
              tabHandle={<GranuleResultsTabContainer />}
              header={headerGranuleResults}
              body={bodyGranuleResults}
            />
          </Route>
        </Switch>
      </div>
    )
  }
}

Search.propTypes = {
  match: PropTypes.shape({}).isRequired,
  location: PropTypes.shape({}).isRequired
}

export default withRouter(Search)
