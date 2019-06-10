import actions from './index'
import { updateGranuleQuery } from './search'
import {
  CLEAR_COLLECTION_GRANULES,
  COPY_GRANULE_RESULTS_TO_COLLECTION,
  UPDATE_FOCUSED_COLLECTION
} from '../constants/actionTypes'
import { updateCollectionMetadata } from './collections'
import { updateGranuleResults, addGranulesFromCollection } from './granules'
import { updateAuthTokenFromHeaders } from './authToken'
import { createFocusedCollectionMetadata } from '../util/focusedCollection'
import CollectionRequest from '../util/request/collectionRequest'
import ConceptRequest from '../util/request/conceptRequest'

export const updateFocusedCollection = payload => ({
  type: UPDATE_FOCUSED_COLLECTION,
  payload
})

export const addCollectionGranules = payload => ({
  type: COPY_GRANULE_RESULTS_TO_COLLECTION,
  payload
})

export const clearCollectionGranules = () => ({
  type: CLEAR_COLLECTION_GRANULES
})

/**
 * Copy granules from searchResults to collections
 */
export const copyGranulesToCollection = () => (dispatch, getState) => {
  const { focusedCollection, searchResults } = getState()
  const { granules } = searchResults

  const {
    allIds,
    byId,
    isCwic,
    hits
  } = granules

  dispatch(addCollectionGranules({
    collectionId: focusedCollection,
    granules: {
      allIds,
      byId,
      isCwic,
      hits
    }
  }))
}

/**
 * Copy granules from a given collection into searchResults
 * @param {string} collectionId
 */
export const copyGranulesFromCollection = collectionId => (dispatch, getState) => {
  const { metadata } = getState()
  const { collections } = metadata
  const collection = collections.byId[collectionId]

  if (!collection) return null

  const { granules } = collection
  const { allIds } = granules
  if (!allIds) return null

  return dispatch(addGranulesFromCollection(granules))
}

/**
 * Perform a collection request based on the focusedCollection from the store.
 */
export const getFocusedCollection = () => async (dispatch, getState) => {
  const { focusedCollection, metadata, searchResults } = getState()

  const { granules } = searchResults
  const { allIds = [] } = granules

  // Reset granule pageNum to 1 when focusedCollection is changing
  dispatch(updateGranuleQuery({ pageNum: 1 }))

  if (focusedCollection === '') {
    dispatch(updateGranuleResults({ results: [] }))
    return null
  }

  const { collections } = metadata
  const { allIds: fetchedCollectionIds } = collections
  // If we already have the metadata for this focusedCollection, don't fetch it again
  if (fetchedCollectionIds.indexOf(focusedCollection) !== -1) {
    // If granules were copied from collections, don't make a new getGranules request
    if (allIds.length === 0) dispatch(actions.getGranules())
    return null
  }

  const { authToken } = getState()
  const requestObject = new CollectionRequest(authToken)
  const ummRequestObject = new ConceptRequest(authToken)

  // Define both the umm and ummJson requests with the correct aruguments.
  const collectionJsonRequest = () => requestObject.search({
    concept_id: [focusedCollection],
    includeTags: 'edsc.*,org.ceos.wgiss.cwic.granules.prod',
    includeHasGranules: true
  })

  const collectionUmmRequest = () => ummRequestObject.search(focusedCollection, 'umm_json')

  let collectionJsonResponse
  let collectionUmmResponse

  // Get data in both json and umm_json formats. Both formats are used in order to create the
  // metadata that we transform and add to the state on the [focusedCollection].metadata key.
  await Promise.all([
    collectionJsonRequest(),
    collectionUmmRequest()
  ])
    .then(([collectionJson, collectionUmm]) => {
      const payload = []
      const [json] = collectionJson.data.feed.entry
      const ummJson = collectionUmm.data

      // Pass json and ummJson into createFocusedCollectionMetadata to transform/normalize the data
      // to be used in the UI.
      const metadata = createFocusedCollectionMetadata(json, ummJson, authToken)

      // The raw data from the json and ummJson requests are added to the state, as well as the
      // transformed/normalized metadata.
      payload.push({
        [focusedCollection]: {
          json,
          ummJson,
          metadata
        }
      })

      collectionJsonResponse = collectionJson
      collectionUmmResponse = collectionUmm

      // The .all().then() will only fire when both requests resolve successfully, so we can
      // rely on collectionJson to have the correct auth information in its headers.
      dispatch(updateAuthTokenFromHeaders(collectionJson.headers))
      dispatch(updateCollectionMetadata(payload))

      // If granules were copied from collections, don't make a new getGranules request.
      if (allIds.length === 0) dispatch(actions.getGranules())
    }, (error) => {
      console.log('Promise Rejected', error)
    })
    .catch((e) => {
      console.log('Promise Rejected', e)
      dispatch(updateFocusedCollection(''))
    })

  return {
    json: collectionJsonResponse,
    ummJson: collectionUmmResponse
  }
}

/**
 * Change the focusedCollection, copy granules, and get the focusedCollection metadata.
 * @param {string} collectionId
 */
export const changeFocusedCollection = collectionId => (dispatch) => {
  if (collectionId === '') dispatch(copyGranulesToCollection())

  if (collectionId !== '') dispatch(copyGranulesFromCollection(collectionId))

  dispatch(updateFocusedCollection(collectionId))
  dispatch(actions.getFocusedCollection())
}
