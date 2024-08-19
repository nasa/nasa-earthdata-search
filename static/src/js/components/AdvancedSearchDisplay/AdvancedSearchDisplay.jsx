import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import { isEmpty, isObject } from 'lodash-es'
// TODO I don't think we want this
import { Slideshow } from '@edsc/earthdata-react-icons/horizon-design-system/hds/ui'

import AdvancedSearchDisplayEntry from './AdvancedSearchDisplayEntry'
import FilterStackItem from '../FilterStack/FilterStackItem'
import FilterStackContents from '../FilterStack/FilterStackContents'

import './AdvancedSearchDisplay.scss'

class AdvancedSearchDisplay extends PureComponent {
  render() {
    const {
      advancedSearch,
      onUpdateAdvancedSearch,
      onChangeQuery
    } = this.props

    const advancedSearchFiltersApplied = Object.values(advancedSearch).filter((value) => {
      if (isObject(value)) {
        return !isEmpty(value)
      }

      return !!value
    }).length

    if (advancedSearchFiltersApplied === 0) return null

    const valueToDisplay = `(${advancedSearchFiltersApplied} applied)`

    console.log('🚀 ~ file: AdvancedSearchDisplay.jsx:33 ~ AdvancedSearchDisplay ~ render ~ valueToDisplay:', valueToDisplay)

    return (
      <FilterStackItem
        icon={Slideshow}
        title="Advanced Search"
        onRemove={
          () => {
            onUpdateAdvancedSearch({})
            onChangeQuery({
              collection: {
                spatial: {}
              }
            })
          }
        }
      >
        <FilterStackContents
          body={
            (
              <AdvancedSearchDisplayEntry>
                <span className="advanced-search-display__text">
                  {valueToDisplay}
                </span>
              </AdvancedSearchDisplayEntry>
            )
          }
          title="Advanced Search"
        />
      </FilterStackItem>
    )
  }
}

AdvancedSearchDisplay.defaultProps = {
  advancedSearch: {}
}

AdvancedSearchDisplay.propTypes = {
  advancedSearch: PropTypes.shape({}),
  onUpdateAdvancedSearch: PropTypes.func.isRequired,
  onChangeQuery: PropTypes.func.isRequired
}

export default AdvancedSearchDisplay
