import Request from '../request'
import { getEnvironmentConfig } from '../../../../../../sharedUtils/config'

export default class RetrievalRequest extends Request {
  constructor(authToken, earthdataEnvironment) {
    super(getEnvironmentConfig().apiHost, earthdataEnvironment)

    this.authenticated = true
    this.authToken = authToken
  }

  all(params) {
    const fullList = this.get('admin/retrievals', params)
    // console.log('🚀 ~ file: retrievalRequest.js:14 ~ RetrievalRequest ~ all ~ fullList:', fullList)
    return fullList
  }

  fetch(id) {
    return this.get(`admin/retrievals/${id}`)
  }

  isAuthorized() {
    return this.get('admin/is_authorized')
  }

  requeueOrder(params) {
    return this.post('requeue_order', params)
  }
}
