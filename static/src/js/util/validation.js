import * as Yup from 'yup'
import Moment from 'moment'

const dateFormat = 'YYYY-MM-DDTHH:m:s.SSSZ'

/**
 * Returns null if the original value passed is an empty string
 * @param {String} value - The validated field value
 * @param {String} originalValue - The original field value
 * @returns {Null|String} null or the valid field value
 */
export const nullableValue = (value, originalValue) => (originalValue.trim() === '' ? null : value)

/**
 * Returns null if the original date passed is an invalid moment object
 * @param {String} value - The validated field value
 * @param {String} originalValue - The original field value
 * @returns {Null|String} null or the valid field value
 */
// eslint-disable-next-line arrow-body-style,no-unused-vars
export const nullableTemporal = (value, originalValue) => {
  const isDate = value instanceof Date
  if ((isDate && !Number.isNaN(value)) && originalValue === '') {
    return null
  }
  return value
}

/**
 * Checks to see if the value the cloudCover.min is less than cloudCover.max
 * @param {String} value - The field value to be validatated
 * @returns {Boolean} The result
 */
export function minLessThanMax(value) {
  const min = value
  const max = this.resolve(Yup.ref('max'))

  // If there is no max
  if (min && !max) return true

  // If the value is not set, dont check
  if (min === null) return true
  return min <= max
}

/**
 * Checks to see if the value the cloudCover.max is less than cloudCover.min
 * @param {String} value - The field value to be validatated
 * @returns {Boolean} The result
 */
export function maxLessThanMin(value) {
  const max = value
  const min = this.resolve(Yup.ref('min'))
  if (max && !min) return true
  if (max === null) return true
  return max >= min
}

/**
 * Checks to see if the value the temporal.startDate is before than temporal.endDate
 * @param {String} value - The field value to be validatated
 * @returns {Boolean} The result
 */
export function startBeforeEnd(value) {
  const endDate = this.resolve(Yup.ref('endDate'))
  const momentEndVal = Moment(endDate, dateFormat, true)
  const momentStartVal = Moment(value, dateFormat, true)
  if (!value) return true
  if (momentStartVal && !endDate) return true
  return momentStartVal.isBefore(momentEndVal)
}
