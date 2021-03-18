import axios from 'axios'

import { getApplicationConfig } from '../../../sharedUtils/config'
import { getClientId } from '../../../sharedUtils/getClientId'
import { getOpenSearchGranulesUrl } from './getOpenSearchGranulesUrl'
import { parseError } from '../../../sharedUtils/parseError'
import { pick } from '../util/pick'
import { prepareExposeHeaders } from '../util/cmr/prepareExposeHeaders'
import { renderOpenSearchTemplate } from './renderOpenSearchTemplate'
import { requestTimeout } from '../util/requestTimeout'
import { wrapAxios } from '../util/wrapAxios'

const wrappedAxios = wrapAxios(axios)

/**
 * Retrieve granules from CWIC
 * @param {Object} event Details about the HTTP request that it received
 */
const cwicGranuleSearch = async (event) => {
  // The headers we'll send back regardless of our response
  const { defaultResponseHeaders } = getApplicationConfig()
  const responseHeaders = {
    ...defaultResponseHeaders,
    'Content-Type': 'application/xml'
  }

  const { body } = event
  const { params } = JSON.parse(body)

  const { echoCollectionId, openSearchOsdd } = params

  // Whitelist parameters supplied by the request
  const permittedOpenSearchParams = [
    'boundingBox',
    'echoCollectionId',
    'openSearchOsdd',
    'pageNum',
    'pageSize',
    'point',
    'temporal'
  ]

  console.log(`Parameters received: ${Object.keys(params)}`)

  const obj = pick(params, permittedOpenSearchParams)

  console.log(`Filtered parameters: ${Object.keys(obj)}`)

  const openSearchUrlResponse = await getOpenSearchGranulesUrl(echoCollectionId, openSearchOsdd)

  console.log(`Completed OSDD request with status ${openSearchUrlResponse.statusCode}.`)

  if (openSearchUrlResponse.statusCode !== 200) {
    const { body } = openSearchUrlResponse

    const parsedResponse = JSON.parse(body)

    return {
      isBase64Encoded: false,
      statusCode: openSearchUrlResponse.statusCode,
      headers: responseHeaders,
      body: parsedResponse.errors
    }
  }

  const { template } = openSearchUrlResponse.body

  const renderedTemplate = renderOpenSearchTemplate(template, obj)

  console.log(`CWIC Granule Query: ${renderedTemplate}`)

  try {
    const granuleResponse = await wrappedAxios({
      method: 'get',
      url: renderedTemplate,
      timeout: requestTimeout(),
      headers: {
        'Client-Id': getClientId().lambda
      }
    })

    const { config, data } = granuleResponse
    const { elapsedTime } = config

    console.log(`CWIC Granule Request took ${elapsedTime} ms`)

    return {
      isBase64Encoded: false,
      statusCode: granuleResponse.status,
      headers: {
        ...responseHeaders,
        'access-control-expose-headers': prepareExposeHeaders(responseHeaders)
      },
      body: data
    }
  } catch (e) {
    return {
      isBase64Encoded: false,
      headers: defaultResponseHeaders,
      ...parseError(e)
    }
  }
}

export default cwicGranuleSearch
