#= require models/data/query
#= require models/data/collections
#= require models/data/collection
#= require models/data/variables

ns = @edsc.models.data

ns.Project = do (ko,
                 document
                 $ = jQuery
                 extend = $.extend
                 param = $.param
                 deparam = @edsc.util.deparam
                 ajax = @edsc.util.xhr.ajax
                 urlUtil = @edsc.util.url
                 QueryModel = ns.query.CollectionQuery
                 CollectionsModel = ns.Collections
                 VariablesModel = ns.Variables
                 ServiceOptionsModel = ns.ServiceOptions
                 Collection = ns.Collection
                 QueryParam = ns.QueryParam) ->

  # Maintains a finite pool of values to be distributed on demand.  Calling
  # next() on the pool returns either an unused value, prioritizing those
  # which have been returned to the pool most recently or, in the case where
  # there are no unused values, the value which has been checked out of the
  # pool the longest.
  class ValuePool
    constructor: (values) ->
      @_pool = values.concat()

    use: (value) ->
      @_remove(value)
      @_pool.push(value)
      value

    next: ->
      @use(@_pool[0])

    has: (value) ->
      @_pool.indexOf(value) != -1

    unuse: (value) ->
      @_remove(value)
      @_pool.unshift(value)
      value

    _remove: (value) ->
      index = @_pool.indexOf(value)
      @_pool.splice(index, 1) unless index == -1

  colorPool = new ValuePool([
    '#3498DB',
    '#E67E22',
    '#2ECC71',
    '#E74C3C',
    '#9B59B6'
  ])

  # Currently supported UMM-S Record Types
  supportedServiceTypes = ['OPeNDAP', 'WEB SERVICES']

  class ProjectCollection
    constructor: (@collection, @meta={}) ->
      @collection.reference()
      @meta.color ?= colorPool.next()

      @granuleAccessOptions = ko.asyncComputed({}, 100, @_loadGranuleAccessOptions, this)
      @serviceOptions = new ServiceOptionsModel(@granuleAccessOptions)
      @isResetable = ko.computed(@_computeIsResetable, this, deferEvaluation: true)
      @selectedVariables = ko.observableArray([])
      @expectedAccessMethod = ko.computed(@_computeExpectedAccessMethod, this, deferEvaluation: true)
      @expectedUmmService = ko.computed(@_computeExpectedUmmService, this, deferEvaluation: true)
      @loadingServiceType = ko.observable(false)

    _computeIsResetable: ->
      if @granuleAccessOptions().defaults?
        for method in @granuleAccessOptions().defaults.accessMethod
          return true if method.collection_id == @collection.id
      false

    dispose: ->
      colorPool.unuse(@meta.color) if colorPool.has(@meta.color)
      @collection.dispose()
      @serviceOptions.dispose()
      @granuleAccessOptions.dispose()

    _loadGranuleAccessOptions: ->
      dataSource = @collection.granuleDatasource()
      unless dataSource
        @granuleAccessOptions(hits: 0, methods: [])
        return

      @loadingServiceType(true)
      console.log "Loading granule access options for #{@collection.id}"
      $(document).trigger('dataaccessevent', [@collection.id])
      success = (data) =>
        console.log "Finished loading access options for #{@collection.id}"
        console.log data

        @granuleAccessOptions(data)

        # Done loading
        @loadingServiceType(false)
      retry = => @_loadGranuleAccessOptions
      dataSource.loadAccessOptions(success, retry)


    # Based on the fact that we are only supporting two UMM Service types we
    # can infer which accessMethod the user *should* be choosing for a particular
    # collection, here we are setting that accessMethod for use within the
    # customization modals
    _computeExpectedAccessMethod: =>
      expectedMethod = null
      $.each @granuleAccessOptions().methods, (index, accessMethod) =>
        # For now we're using the first valid/supported UMM Service record found
        if accessMethod.umm_service?.umm?.Type in supportedServiceTypes
          expectedMethod = accessMethod

          # A non-false return statemet within jQuery's `.each` will
          # simply continue rather than return, so we need to set a variable
          # to null outside of the loop, set the value like we've done above
          # when the conditional is true, and return false which will exit
          # the loop
          return false

      expectedMethod

    # Retrieve the user selected UMM Service from the access method. In the
    # future this will be set by the user, but for now were just going to
    # use the first supported UMM Service record as we'll only be assigning
    # one UMM Service record to each collection. 
    _computeExpectedUmmService: =>
      # If we've already determined the expectedAccessMethod we'll just use the
      # associated UMM Service record, the logic in this method is the same as determining
      # the expectedAccessMethod
      return @expectedAccessMethod().umm_service if @expectedAccessMethod()?

      expectedUmmService = null
      $.each @granuleAccessOptions().methods, (index, accessMethod) =>
        # For now we're using the first valid/supported UMM Service record found
        if accessMethod.umm_service?.umm?.Type in supportedServiceTypes
          expectedUmmService = accessMethod.umm_service

          # A non-false return statement within jQuery's `.each` will
          # simply continue rather than return, so we need to set a variable
          # to null outside of the loop, set the value like we've done above
          # when the conditional is true, and return false which will exit
          # the loop
          return false

      expectedUmmService

    launchCustomizationModal: =>
      modalSuffixesByType = {
        'OPeNDAP': '-customization-modal',
        'WEB SERVICES': '-echo-forms-modal'
      }

      serviceType = @expectedUmmService()?.umm?.Type
      
      # Sets the accessMethod for the serviceOptionModel
      if @serviceOptions.accessMethod().length > 0
        console.log('Selected ' + @expectedAccessMethod().name + ' for ' + @collection.id)

        # Prevent re-rendering the form if it has previously been selected
        unless @collection.hasEchoFormLoaded()
          @serviceOptions.accessMethod()[0].method(@expectedAccessMethod().name)
          @serviceOptions.accessMethod()[0].renderServiceForm(@collection)

      # Show the modal
      $('#' + @collection.id + modalSuffixesByType[serviceType]).modal()

      # We're not rendering the form again so if the use had scrolled before
      # closing the modal we want to reset the modal the next time it's shown
      $('.echo-forms .modal-body').animate({ scrollTop: (0) }, 0);

    findSelectedVariable: (variable) =>
      selectedVariablePosition = @indexOfSelectedVariable(variable)

      return null if selectedVariablePosition == -1

      @selectedVariables()[selectedVariablePosition]

    indexOfSelectedVariable: (variable) =>
      for asdf, index in @selectedVariables()
        if variable.meta()['concept-id'] == asdf.meta()['concept-id']
          return index
      -1

    hasSelectedVariable: (variable) =>
      @indexOfSelectedVariable(variable) != -1

    hasSelectedVariables: =>
      @selectedVariables().length > 0

    fromJson: (jsonObj) ->
      @serviceOptions.fromJson(jsonObj.serviceOptions)

    setSelectedVariablesById: (variables) => 
      # Retrieve the stored selected variables by concept id and assign
      # them to the project collection
      VariablesModel.forIds variables, {}, (variables) =>
        @selectedVariables(variables)

    customizeButtonText: =>
      return 'Edit Customizations' if @hasSelectedVariables()

      'Customize'

    transforms_enabled: ->
      false

    formats_enabled: ->
      false

    serialize: ->
      options = @serviceOptions.serialize()
      $(document).trigger('dataaccessevent', [@collection.id, options])

      form_hashes = []
      for method in @granuleAccessOptions().methods || []
        console.log 'method.type: ' + method.type
        for accessMethod in options.accessMethod
          console.log 'accessMethod.type: ' + accessMethod.type          
          form_hash = {}
          if ((method.id == null || method.id == undefined ) || accessMethod.id == method.id) && accessMethod.type == method.type
            if method.id?
              form_hash['id'] = method.id
            else
              form_hash['id'] = accessMethod.type
            form_hash['form_hash'] = method.form_hash
            form_hashes.push form_hash

      id: @collection.id
      params: param(@collection.granuleDatasource()?.toQueryParams() ? @collection.query.globalParams())
      serviceOptions: options
      variables: @selectedVariables().map((v) => v.meta()['concept-id']).join('!')
      selectedService: @expectedUmmService(),
      form_hashes: form_hashes

  class Project
    constructor: (@query) ->
      @_collectionIds = ko.observableArray()
      @_collectionsById = {}

      @id = ko.observable(null)
      @collections = ko.computed(read: @getCollections, write: @setCollections, owner: this)
      @focusedProjectCollection = ko.observable(null)
      @focus = ko.computed(read: @_readFocus, write: @_writeFocus, owner: this)
      @searchGranulesCollection = ko.observable(null)
      @accessCollections = ko.computed(read: @_computeAccessCollections, owner: this, deferEvaluation: true)
      @allReadyToDownload = ko.computed(@_computeAllReadyToDownload, this, deferEvaluation: true)
      @visibleCollections = ko.computed(read: @_computeVisibleCollections, owner: this, deferEvaluation: true)

      @serialized = ko.computed
        read: @_toQuery
        write: @_fromQuery
        owner: this
        deferEvaluation: true
      @_pending = ko.observable(null)

    _computeAllReadyToDownload: ->
      return false for ds in @accessCollections() when !ds.serviceOptions.readyToDownload()
      true

    _computeAccessCollections: ->
      focused = @focusedProjectCollection()
      if focused
        [focused]
      else
        @_collectionsById[id] for id in @_collectionIds()

    _readFocus: -> @focusedProjectCollection()?.collection
    _writeFocus: (collection) ->
      observable = @focusedProjectCollection
      current = observable()
      unless current?.collection == collection
        current?.dispose()
        if collection?
          projectCollection = new ProjectCollection(collection)
        observable(projectCollection)

    getCollections: ->
      @_collectionsById[id] for id in @_collectionIds()

    exceedCollectionLimit: ->
      for projectCollection in @getCollections()
        return true if projectCollection.collection.isMaxOrderSizeReached()
      false

    setCollections: (collections) ->
      collectionIds = []
      collectionsById = {}
      for ds, i in collections
        id = ds.id
        collectionIds.push(id)
        collectionsById[id] = @_collectionsById[id] ? new ProjectCollection(ds)
      @_collectionsById = collectionsById
      @_collectionIds(collectionIds)
      null

    _computeVisibleCollections: ->
      collections = (collection for projectCollection in @collections() when projectCollection.collection.visible())

      focus = @focus()
      if focus && focus.visible() && collections.indexOf(focus) == -1
        collections.push(focus)

      # Other visible collections not controlled by the project
      for collection in Collection.visible()
        collections.push(collection) if collections.indexOf(collection) == -1
      collections

    backToSearch: =>
      projectId = deparam(urlUtil.realQuery()).projectId
      if projectId
        path = "/search?projectId=#{projectId}"
      else
        path = '/search?' + urlUtil.currentQuery()

      $(window).trigger('edsc.save_workspace')
      window.location.href = urlUtil.fullPath(path)

    # This seems like a UI concern, but really it's something that spans several
    # views and something we may eventually want to persist with the project or
    # allow the user to alter.
    colorForCollection: (collection) ->
      return null unless @hasCollection(collection)

      @_collectionsById[collection.id].meta.color

    isEmpty: () ->
      @_collectionIds.isEmpty()

    addCollection: (collection) ->
      id = collection.id

      @_collectionsById[id] ?= new ProjectCollection(collection)
      @_collectionIds.remove(id)
      @_collectionIds.push(id)
      null

    removeCollection: (collection) =>
      id = collection.id
      @_collectionsById[id]?.dispose()
      delete @_collectionsById[id]
      @_collectionIds.remove(id)
      null

    hasCollection: (other) =>
      @_collectionIds.indexOf(other.id) != -1

    isSearchingGranules: (collection) =>
      @searchGranulesCollection() == collection

    fromJson: (jsonObj) ->
      collections = null
      if jsonObj.collections?
        collections = {}
        collections[ds.id] = ds for ds in jsonObj.collections
      @_pendingAccess = collections
      @serialized(deparam(jsonObj.query))

    serialize: (collections=@collections) ->
      collections = (ds.serialize() for ds in @accessCollections())
      {query: param(@serialized()), collections: collections, source: urlUtil.realQuery()}

    ###*
     * Retreive a ProjectCollection object for the collection matching the provided concept-id
     ###
    getProjectCollection: (id) ->
      focus = @focusedProjectCollection()
      if focus?.collection.id == id
        focus
      else
        @_collectionsById[id]

    _toQuery: ->
      return @_pending() if @_pending()?
      result = $.extend({}, @query.serialize())
      collections = [@focus()].concat(projectCollection.collection for projectCollection in @collections())
      ids = (ds?.id ? '' for ds in collections)
      if collections.length > 1 || collections[0]
        queries = [{}]
        result.p = ids.join('!')
        start = 1
        start = 0 if @focus() && !@hasCollection(@focus())
        for collection, i in collections[start...]
          datasource = collection.granuleDatasource()
          projectCollection = @getProjectCollection(collection.id)

          query = {}

          # Only set the variables if there are any selected
          if projectCollection.hasSelectedVariables()
            query['variables'] = projectCollection.selectedVariables().map((v) => v.meta()['concept-id']).join('!')

          if datasource?
            $.extend(query, datasource.toBookmarkParams())

            queries[i + start] = {} if Object.keys(query).length == 0
            query.v = 't' if (i + start) != 0 && collection.visible()
            # Avoid inserting an empty map
            for own k, v of query
              queries[i + start] = query
              break

        for q, index in queries
          queries[index] = {} if q == undefined
        result.pg = queries if queries.length > 0

      result

    _fromQuery: (value) ->
      @query.fromJson(value)

      collectionIdStr = value.p
      if collectionIdStr
        singleGranuleId = value.sgd
        if collectionIdStr != @_collectionIds().join('!')
          collectionIds = collectionIdStr.split('!')
          focused = !!collectionIds[0]
          collectionIds.shift() unless focused
          @_pending(value)
          value.pg ?= []
          value.pg[0] ?= {}

          # if focused collection id is duplicated in params, copy query
          if focused
            for id, i in collectionIds
              if i > 0 && id == collectionIds[0]
                value.pg[0] = value.pg[i]

          CollectionsModel.forIds collectionIds, @query, (collections) =>
            @_pending(null)
            pending = @_pendingAccess ? {}
            offset = 0
            offset = 1 unless focused
            queries = value["pg"] ? []
            for collection, i in collections
              query = queries[i + offset]

              if i == 0 && focused
                @focus(collection)
              else
                @addCollection(collection)

              if query?
                if query.variables
                  variables = query.variables.split('!')

                  # Retrieve the stored selected variables by concept id and assign
                  # them to the project collection
                  @getProjectCollection(collection.id).setSelectedVariablesById(variables)

                if collection.granuleDatasource()?
                  collection.granuleDatasource().fromBookmarkParams(query, value)
                  collection.visible(true) if query.v == 't'

              collection.dispose() # forIds ends up incrementing reference count
              @getProjectCollection(collection.id).fromJson(pending[collection.id]) if pending[collection.id]
            @_pendingAccess = null
      else
        @collections([])

  exports = Project
