import React from 'react'
import { PropTypes } from 'prop-types'
import Dropdown from 'react-bootstrap/Dropdown'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'

import {
  FaCrop,
  FaCircle,
  FaFile
} from 'react-icons/fa'

import { Map } from '@edsc/earthdata-react-icons/horizon-design-system/hds/ui'

import { eventEmitter } from '../../events/events'

import { getApplicationConfig } from '../../../../../sharedUtils/config'

import Button from '../Button/Button'
import EDSCIcon from '../EDSCIcon/EDSCIcon'

import './SpatialSelectionDropdown.scss'

const SpatialSelectionDropdown = (props) => {
  const {
    onToggleShapefileUploadModal,
    onMetricsSpatialSelection
  } = props

  const onItemClick = (item) => {
    // Sends metrics for spatial selection usage
    onMetricsSpatialSelection({ item })

    if (item === 'point') {
      eventEmitter.emit('map.drawStart', {
        type: 'marker'
      })
    }

    if (item === 'rectangle') {
      eventEmitter.emit('map.drawStart', {
        type: 'rectangle'
      })
    }

    if (item === 'polygon') {
      eventEmitter.emit('map.drawStart', {
        type: 'polygon'
      })
    }

    if (item === 'circle') {
      eventEmitter.emit('map.drawStart', {
        type: 'circle'
      })
    }

    if (item === 'file') {
      onToggleShapefileUploadModal(true)
    }
  }

  const { disableDatabaseComponents } = getApplicationConfig()

  // Parse string field `disableDatabaseComponents` disable shapefile search if true
  const disableShapefileSearch = disableDatabaseComponents === 'true'

  const spatialSelectionFileSpan = (
    <span>
      File
      <span className="spatial-selection-dropdown__small">(KML, KMZ, ESRI, …)</span>
    </span>
  )

  return (
    <Dropdown
      className="spatial-selection-dropdown"
    >
      <Dropdown.Toggle
        variant="light"
        id="spatial-selection-dropdown"
        aria-label="spatial-selection-dropdown"
        data-testid="spatial-selection-dropdown"
        className="search-form__button search-form__button--dark"
      >
        <EDSCIcon className="spatial-selection-dropdown__icon button__icon" icon={FaCrop} size="0.825rem" />
      </Dropdown.Toggle>
      <Dropdown.Menu className="spatial-selection-dropdown__menu">
        <Dropdown.Item
          className="spatial-selection-dropdown__button"
          as={Button}
          icon="edsc-icon-poly edsc-icon-fw"
          onClick={() => onItemClick('polygon')}
        >
          <span>Polygon</span>
        </Dropdown.Item>
        <Dropdown.Item
          className="spatial-selection-dropdown__button"
          as={Button}
          icon="edsc-icon-rect edsc-icon-fw"
          onClick={() => onItemClick('rectangle')}
        >
          <span>Rectangle</span>
        </Dropdown.Item>
        <Dropdown.Item
          className="spatial-selection-dropdown__button"
          as={Button}
          icon={FaCircle}
          onClick={() => onItemClick('circle')}
        >
          <span>Circle</span>
        </Dropdown.Item>
        <Dropdown.Item
          className="spatial-selection-dropdown__button"
          as={Button}
          icon={Map}
          onClick={() => onItemClick('point')}
        >
          <span>Point</span>
        </Dropdown.Item>
        <Dropdown.Item
          className="spatial-selection-dropdown__button"
          as={Button}
          icon={FaFile}
          onClick={() => onItemClick('file')}
          disabled={disableShapefileSearch}
        >
          {
            disableShapefileSearch ? (
              <OverlayTrigger
                placement="right"
                overlay={
                  (
                    <Tooltip>
                      Shapefile subsetting is currently disabled
                    </Tooltip>
                  )
                }
              >
                <div>
                  {spatialSelectionFileSpan}
                </div>
              </OverlayTrigger>
            )
              : (spatialSelectionFileSpan)

          }
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  )
}

SpatialSelectionDropdown.propTypes = {
  onMetricsSpatialSelection: PropTypes.func.isRequired,
  onToggleShapefileUploadModal: PropTypes.func.isRequired
}

export default SpatialSelectionDropdown
