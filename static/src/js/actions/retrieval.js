import { push } from 'connected-react-router'
import prepareRetrievalParams from '../util/retrievals'
import RetrievalRequest from '../util/request/retrievalRequest'

import { UPDATE_RETRIEVAL } from '../constants/actionTypes'
import { metricsDataAccess } from '../middleware/metrics/actions'
import { portalPathFromState } from '../../../../sharedUtils/portalPath'
import { removeRetrievalHistory } from './retrievalHistory'
import { handleError } from './errors'

export const updateRetrieval = retrievalData => ({
  type: UPDATE_RETRIEVAL,
  payload: retrievalData
})

/**
 * Submit data representing a Retrieval to be stored in the database
 */
export const submitRetrieval = () => (dispatch, getState) => {
  const state = getState()
  const orderParams = prepareRetrievalParams(state)
  const { authToken } = orderParams

  const requestObject = new RetrievalRequest(authToken)

  const { project } = state
  const {
    collectionIds: projectCollectionIds = [],
    byId: collectionsById = {}
  } = project
  const metricsCollections = projectCollectionIds.map((id) => {
    const projectCollection = collectionsById[id]
    const { selectedAccessMethod = '' } = projectCollection

    const { accessMethods } = projectCollection
    const selectedMethod = accessMethods[selectedAccessMethod]
    const { type } = selectedMethod

    let selectedService
    let selectedType

    if (type === 'DOWNLOAD') {
      selectedService = 'Download'
      selectedType = 'download'
    } else if (type === 'ECHO ORDERS') {
      const { option_definition: optionDefinition } = selectedMethod
      const { name } = optionDefinition
      selectedService = name
      selectedType = 'order'
    } else if (type === 'ESI') {
      const { service_option_definition: optionDefinition } = selectedMethod
      const { name } = optionDefinition
      selectedService = name
      selectedType = 'esi'
    }

    return {
      collectionId: id,
      type: selectedType,
      service: selectedService
    }
  })

  dispatch(metricsDataAccess({
    type: 'data_access_completion',
    collections: metricsCollections
  }))

  const response = requestObject.submit(orderParams)
    .then((response) => {
      const { id: retrievalId } = response.data

      dispatch(push(`${portalPathFromState(state)}/downloads/${retrievalId}`))
    })
    .catch((error) => {
      dispatch(handleError({
        error,
        action: 'submitRetrieval',
        resource: 'retrieval',
        verb: 'submitting'
      }))
    })

  return response
}

/**
 * Fetch a retrieval from the database
 * @param {Integer} id Database ID of the retrieval to lookup
 */
export const fetchRetrieval = id => (dispatch, getState) => {
  const { authToken } = getState()

  const requestObject = new RetrievalRequest(authToken)
  const response = requestObject.fetch(id)
    .then((response) => {
      const { data } = response
      const { collections } = data

      const updatedCollections = {
        ...collections
      }

      Object.keys(collections.byId).forEach((collectionId) => {
        const currentCollection = collections.byId[collectionId]

        const { access_method: accessMethod } = currentCollection
        const { type } = accessMethod

        updatedCollections.byId[collectionId] = {
          ...currentCollection,
          // Downloadable orders do not need to be loaded, default them to true
          isLoaded: ['download', 'OPeNDAP'].includes(type)
        }
      })

      dispatch(updateRetrieval({
        ...data,
        collections: updatedCollections
      }))
    })
    .catch((error) => {
      dispatch(handleError({
        error,
        action: 'fetchRetrieval',
        resource: 'retrieval'
      }))
    })

  return response
}

/**
 * Delete a retrieval from the database
 * @param {Integer} id Database ID of the retrieval to lookup
 */
export const deleteRetrieval = id => (dispatch, getState) => {
  const { authToken } = getState()

  try {
    const requestObject = new RetrievalRequest(authToken)
    const response = requestObject.remove(id)
      .then(() => {
        dispatch(removeRetrievalHistory(id))
      })
      .catch((error) => {
        dispatch(handleError({
          error,
          action: 'deleteRetrieval',
          resource: 'retrieval',
          verb: 'deleting'
        }))
      })

    return response
  } catch (e) {
    return null
  }
}
