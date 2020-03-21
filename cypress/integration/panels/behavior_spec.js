describe('Panel Behavior', () => {
  beforeEach(() => {
    cy.server()
    cy.route({
      method: 'POST',
      url: '**/search/collections.json',
      response: {
        feed: {
          updated: '2020-01-07T21:44:39.829Z',
          id: 'https://cmr.earthdata.nasa.gov:443/search/collections.json?has_granules_or_cwic=true&include_facets=v2&include_granule_counts=true&include_has_granules=true&include_tags=edsc.extra.%2A%2Corg.ceos.wgiss.cwic.granules.prod&options%5Bscience_keywords_h%5D%5Bor%5D=true&options%5Btemporal%5D%5Blimit_to_granules%5D=true&page_num=1&page_size=20&sort_key%5B%5D=has_granules_or_cwic',
          title: 'ECHO dataset metadata',
          entry: [
            {
              tags: {
                'org.ceos.wgiss.cwic.granulesprod': {}
              },
              boxes: [
                '-90 -180 90 180'
              ],
              time_start: '2018-11-07T00:00:00.000Z',
              version_id: '2.61',
              updated: '2019-08-07T00:00:00.000Z',
              dataset_id: 'GHRSST Level 2P OSPO dataset v2.61 from VIIRS on the NOAA-20 satellite (GDS v2) (GDS version 2)',
              has_spatial_subsetting: false,
              has_transforms: false,
              has_variables: false,
              data_center: 'NOAA_NCEI',
              short_name: '10.25921/sfs7-9688',
              organizations: [
                'DOC/NOAA/NESDIS/NCEI'
              ],
              title: 'GHRSST Level 2P OSPO dataset v2.61 from VIIRS on the NOAA-20 satellite (GDS v2) (GDS version 2)',
              coordinate_system: 'CARTESIAN',
              summary: 'NOAA-20 (N20/JPSS-1/J1) is the second satellite in the US NOAA latest generation Joint Polar Satellite System (JPSS). N20 was launched on November 18, 2017. In conjunction with the first US satellite in JPSS series, Suomi National Polar-orbiting Partnership (S-NPP) satellite launched on October 28, 2011, N20 form the new NOAA polar constellation. NOAA is responsible for all JPSS products, including SST from the Visible Infrared Imaging Radiometer Suite (VIIRS). VIIRS is a whiskbroom scanning radiometer, which takes measurements in the cross-track direction within a field of view of 112.56-deg using 16 detectors and a double-sided mirror assembly. At a nominal altitude of 829 km, the swath width is 3,060 km, providing global daily coverage for both day and night passes. VIIRS has 22 spectral bands, covering the spectrum from 0.4-12 um, including 16 moderate resolution bands (M-bands). \n\nThe L2P SST product is derived at the native sensor resolution (~0.75 km at nadir, ~1.5 km at swath edge) using NOAA\'s Advanced Clear-Sky Processor for Ocean (ACSPO) system, and reported in 10 minute granules in netCDF4 format, compliant with the GHRSST Data Specification version 2 (GDS2). There are 144 granules per 24hr interval, with a total data volume of 27GB/day. In addition to pixel-level earth locations, Sun-sensor geometry, and ancillary data from the NCEP global weather forecast, ACSPO outputs include four brightness temperatures (BTs) in M12 (3.7um), M14 (8.6um), M15 (11um), and M16 (12um) bands, and two reflectances in M5 (0.67um) and M7 (0.87um) bands. The reflectances are used for cloud identification. Beginning with ACSPO v2.60, all BTs and reflectances are destriped (Bouali and Ignatov, 2014) and resampled (Gladkova et al., 2016), to minimize the effect of bow-tie distortions and deletions. SSTs are retrieved from destriped BTs. \n\nSSTs are derived from BTs using the Multi-Channel SST (MCSST; night) and Non-Linear SST (NLSST; day) algorithms (Petrenko et al., 2014). ACSPO clear-sky mask (ACSM) is provided in each pixel as part of variable l2p_flags, which also includes day/night, land, ice, twilight, and glint flags (Petrenko et al., 2010). Fill values are reported in all pixels with >5 km inland. For each valid water pixel (defined as ocean, sea, lake or river, and up to 5 km inland), four BTs in M12/14/15/16 (included for those users interested in direct \'radiance assimilation\', e.g., NOAA NCEP, NASA GMAO, ECMWF) and two refelctances in M5/7 are reported, along with derived SST. Other variables include NCEP wind speed and ACSPO SST minus reference SST (Canadian Met Centre 0.1deg L4 SST; available at https://podaac.jpl.nasa.gov/dataset/CMC0.1deg-CMC-L4-GLOB-v3.0).  Only ACSM confidently clear pixels are recommended (equivalent to GDS2 quality level=5). Per GDS2 specifications, two additional Sensor-Specific Error Statistics layers (SSES bias and standard deviation) are reported in each pixel with QL=5. Note that users of ACSPO data have the flexibility to ignore the ACSM and derive their own clear-sky mask, and apply it to BTs and SSTs. They may also ignore ACSPO SSTs, and derive their own SSTs from the original BTs. \n\nThe L2P product is monitored and validated against quality controlled in situ data provided by NOAA in situ SST Quality Monitor system (iQuam; Xu and Ignatov, 2014), using another NOAA system, SST Quality Monitor (SQUAM; Dash et al, 2010). Corresponding clear-sky BTs are validated against RTM simulation in the Monitoring IR Clear-sky Radiances over Ocean for SST system (MICROS; Liang and Ignatov, 2011). A reduced size (1GB/day), equal-angle gridded (0.02-deg), ACSPO L3U product is also available at https://podaac.jpl.nasa.gov/dataset/VIIRS_N20-OSPO-L3U-v2.61, where gridded L2P SSTs with QL=5 only are reported, and BT layers omitted.',
              has_granules: false,
              orbit_parameters: {},
              id: 'C1597928934-NOAA_NCEI',
              has_formats: false,
              original_format: 'ISO19115',
              granule_count: 0,
              archive_center: 'DOC/NOAA/NESDIS/NCEI',
              has_temporal_subsetting: false,
              browse_flag: true,
              online_access_flag: true,
              links: [
                {
                  length: '0.0KB',
                  rel: 'http://esipfed.org/ns/fedsearch/1.1/data#',
                  hreflang: 'en-US',
                  href: 'https://doi.org/10.25921/sfs7-9688'
                },
                {
                  length: '0.0KB',
                  rel: 'http://esipfed.org/ns/fedsearch/1.1/data#',
                  hreflang: 'en-US',
                  href: 'https://www.nodc.noaa.gov/search/granule/rest/find/document?searchText=fileIdentifier%3AGHRSST-VIIRS_N20-OSPO-L2P*%20OR%20fileIdentifier%3AVIIRS_N20-OSPO-L2P*%20OR%20fileIdentifier%3AGHRSST-VIIRS_N20-OSPO-L2P*%20OR%20fileIdentifier%3AVIIRS_N20-OSPO-L2P*&start=1&max=100&f=searchPage'
                }
              ]
            }
          ]
        }
      },
      headers: {
        'cmr-hits': 1
      }
    })

    cy.visit('/')
  })

  it('is present by default on page load', () => {
    // Panel is visible
    cy.get('.panels--is-open').should('have.length', 1)
    cy.get('.panels--is-minimized').should('have.length', 0)

    // Handle is visible
    cy.get('.panels__handle').should('be.visible')
  })

  it('opens and closes when clicking the handle', () => {
    // Click the handle
    cy.get('.panels__handle').click().wait(600)

    // Panel is minimized
    cy.get('.panels--is-open').should('have.length', 0)
    cy.get('.panels--is-minimized').should('have.length', 1)

    // Click the handle
    cy.get('.panels__handle').click().wait(600)

    // Panel is minimized
    cy.get('.panels--is-open').should('have.length', 1)
    cy.get('.panels--is-minimized').should('have.length', 0)
  })

  it('opens and closes when using keyboard shortcuts', () => {
    // Press the key
    cy.window().trigger('keydown', { key: ']' }).wait(600)

    // Panel is minimized
    cy.get('.panels--is-open').should('have.length', 0)
    cy.get('.panels--is-minimized').should('have.length', 1)

    // Press the key
    cy.window().trigger('keydown', { key: ']' }).wait(600)

    // Panel is visible
    cy.get('.panels--is-open').should('have.length', 1)
    cy.get('.panels--is-minimized').should('have.length', 0)
  })
})
