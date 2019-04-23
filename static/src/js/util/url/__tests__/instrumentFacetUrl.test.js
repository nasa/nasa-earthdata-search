import { decodeUrlParams, encodeUrlQuery } from '../url'

import emptyDecodedResult from './url.test'

describe('url#decodeUrlParams', () => {
  test('decodes instrumentFacets correctly', () => {
    const expectedResult = {
      ...emptyDecodedResult,
      cmrFacets: {
        instrument_h: ['facet 1', 'facet 2']
      }
    }
    expect(decodeUrlParams('?fi=facet%201%21facet%202')).toEqual(expectedResult)
  })
})

describe('url#encodeUrlQuery', () => {
  test('encodes instrumentFacets correctly', () => {
    const props = {
      pathname: '/path/here',
      instrumentFacets: ['facet 1', 'facet 2']
    }
    expect(encodeUrlQuery(props)).toEqual('/path/here?fi=facet%201%21facet%202')
  })
})
