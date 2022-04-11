/**
 * Return the GraphQl query for verifying the request is what we expect inside of cy.intercept
 * @param {String} conceptId conceptId to retrieve
 */
export const graphQlGetCollections = (conceptId) => `{"query":"\\n    query GetCollections(\\n      $ids: [String]\\n      $includeHasGranules: Boolean\\n      $includeTags: String\\n      $pageSize: Int\\n      $subscriberId: String\\n    ) {\\n      collections (\\n        conceptId: $ids\\n        includeHasGranules: $includeHasGranules\\n        includeTags: $includeTags\\n        limit: $pageSize\\n      ) {\\n        items {\\n          abstract\\n          archiveAndDistributionInformation\\n          associatedDois\\n          boxes\\n          browseFlag\\n          conceptId\\n          coordinateSystem\\n          dataCenter\\n          dataCenters\\n          directDistributionInformation\\n          doi\\n          hasGranules\\n          lines\\n          points\\n          polygons\\n          relatedCollections (\\n            limit: 3\\n          ) {\\n            count\\n            items {\\n              id\\n              title\\n            }\\n          }\\n          relatedUrls\\n          scienceKeywords\\n          shortName\\n          spatialExtent\\n          tags\\n          temporalExtents\\n          tilingIdentificationSystems\\n          title\\n          versionId\\n          services {\\n            count\\n            items {\\n              conceptId\\n              longName\\n              name\\n              type\\n              url\\n              serviceOptions\\n              supportedOutputProjections\\n              supportedReformattings\\n            }\\n          }\\n          granules {\\n            count\\n            items {\\n              conceptId\\n              onlineAccessFlag\\n            }\\n          }\\n          subscriptions (\\n            subscriberId: $subscriberId\\n          ) {\\n            count\\n            items {\\n              collectionConceptId\\n              conceptId\\n              name\\n              query\\n            }\\n          }\\n          tools {\\n            count\\n            items {\\n              longName\\n              name\\n              potentialAction\\n            }\\n          }\\n          variables {\\n            count\\n            items {\\n              conceptId\\n              definition\\n              longName\\n              name\\n              nativeId\\n              scienceKeywords\\n            }\\n          }\\n        }\\n      }\\n    }","variables":{"ids":["${conceptId}"],"includeTags":"edsc.*,opensearch.granule.osdd","includeGranuleCounts":true,"includeHasGranules":true,"pageSize":1}}`
