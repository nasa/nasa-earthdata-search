import React from 'react'
import PropTypes from 'prop-types'

import SanitizedHTML from 'react-sanitized-html'

import CollapsePanel from '../CollapsePanel/CollapsePanel'
import EDSCIcon from '../EDSCIcon/EDSCIcon'

import './DataQualitySummary.scss'

export const DataQualitySummary = ({
  dataQualitySummaries
}) => (
  dataQualitySummaries.length > 0 && (
    <div className="data-quality-summary">
      <CollapsePanel
        className="data-quality-summary__panel"
        header={(
          <>
            <EDSCIcon library="fa" icon="FaExclamationCircle" />
            {' Important data quality information'}
          </>
        )}
      >
        {
            dataQualitySummaries.map((dqs) => {
              const { id, summary } = dqs
              const key = `dqs-${id}`

              return (
                <SanitizedHTML
                  key={key}
                  html={summary}
                  allowedTags={['br', 'span', 'a', 'p']}
                />
              )
            })
          }
      </CollapsePanel>
    </div>
  )
)

DataQualitySummary.propTypes = {
  dataQualitySummaries: PropTypes.arrayOf(
    PropTypes.shape({})
  ).isRequired
}

export default DataQualitySummary
