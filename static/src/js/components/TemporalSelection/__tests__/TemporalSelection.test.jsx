import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from '@wojtekmaj/enzyme-adapter-react-17'
import moment from 'moment'

import Alert from 'react-bootstrap/Alert'

import TemporalSelection from '../TemporalSelection'
import DatepickerContainer from '../../../containers/DatepickerContainer/DatepickerContainer'

Enzyme.configure({ adapter: new Adapter() })

function setup() {
  const props = {
    controlId: 'test-id',
    portal: {
      minimumTemporalDateString: '1960-01-01 00:00:00'
    },
    temporal: {},
    onRecurringToggle: jest.fn(),
    onChangeRecurring: jest.fn(),
    onSubmitStart: jest.fn(),
    onSubmitEnd: jest.fn(),
    onInvalid: jest.fn(),
    onValid: jest.fn(),
    setFieldValue: jest.fn(),
    viewMode: 'years'
  }

  const enzymeWrapper = shallow(<TemporalSelection {...props} />)

  return {
    enzymeWrapper,
    props
  }
}

describe('TemporalSelection component', () => {
  test('when passed a start date renders DatePickerContainer component correctly', () => {
    const { enzymeWrapper } = setup()
    enzymeWrapper.setProps({
      temporal: {
        startDate: '2019-03-30T00:00:00.000Z',
        endDate: ''
      }
    })

    expect(enzymeWrapper.find(DatepickerContainer).at(0).prop('type')).toBe('start')
    expect(enzymeWrapper.find(DatepickerContainer).at(0).prop('value')).toBe('2019-03-30T00:00:00.000Z')
    expect(enzymeWrapper.find(DatepickerContainer).at(1).prop('type')).toBe('end')
    expect(enzymeWrapper.find(DatepickerContainer).at(1).prop('value')).toBe('')
  })

  test('when passed a end date renders DatePickerContainer component correctly', () => {
    const { enzymeWrapper } = setup()
    enzymeWrapper.setProps({
      temporal: {
        startDate: '',
        endDate: '2019-03-30T00:00:00.000Z'
      }
    })

    expect(enzymeWrapper.find(DatepickerContainer).at(0).prop('type')).toBe('start')
    expect(enzymeWrapper.find(DatepickerContainer).at(0).prop('value')).toBe('')
    expect(enzymeWrapper.find(DatepickerContainer).at(1).prop('type')).toBe('end')
    expect(enzymeWrapper.find(DatepickerContainer).at(1).prop('value')).toBe('2019-03-30T00:00:00.000Z')
  })

  test('when passed a both start and end dates renders DatePickerContainer components correctly', () => {
    const { enzymeWrapper } = setup()
    enzymeWrapper.setProps({
      temporal: {
        endDate: '2019-03-30T00:00:00.000Z',
        startDate: '2019-03-29T00:00:00.000Z'
      }
    })

    expect(enzymeWrapper.find(DatepickerContainer).at(0).prop('type')).toBe('start')
    expect(enzymeWrapper.find(DatepickerContainer).at(0).prop('value')).toBe('2019-03-29T00:00:00.000Z')
    expect(enzymeWrapper.find(DatepickerContainer).at(1).prop('type')).toBe('end')
    expect(enzymeWrapper.find(DatepickerContainer).at(1).prop('value')).toBe('2019-03-30T00:00:00.000Z')
  })

  test('when passed a start date after the end date renders DatePickerContainer components correctly', () => {
    const { enzymeWrapper } = setup()
    enzymeWrapper.setProps({
      temporal: {
        endDate: '2019-03-29T00:00:00.000Z',
        startDate: '2019-03-30T00:00:00.000Z'
      }
    })

    expect(enzymeWrapper.find(DatepickerContainer).at(0).prop('type')).toBe('start')
    expect(enzymeWrapper.find(DatepickerContainer).at(0).prop('value')).toBe('2019-03-30T00:00:00.000Z')
    expect(enzymeWrapper.find(DatepickerContainer).at(1).prop('type')).toBe('end')
    expect(enzymeWrapper.find(DatepickerContainer).at(1).prop('value')).toBe('2019-03-29T00:00:00.000Z')
  })

  test('when passed a start date after the end date fires isInvalid', () => {
    const { enzymeWrapper, props } = setup()
    enzymeWrapper.setProps({
      temporal: {
        endDate: '2019-03-29T00:00:00.000Z',
        startDate: '2019-03-30T00:00:00.000Z'
      }
    })

    expect(props.onInvalid).toBeCalledTimes(1)
  })

  test('when passed a start date before the end date renders Alert correctly', () => {
    const { enzymeWrapper } = setup()
    enzymeWrapper.setProps({
      temporal: {
        endDate: '2019-03-30T00:00:00.000Z',
        startDate: '2019-03-29T00:00:00.000Z'
      }
    })

    expect(enzymeWrapper.find(Alert).at(0).prop('show')).toBe(false)
    expect(enzymeWrapper.find(Alert).at(1).prop('show')).toBe(false)
  })

  test('when passed a start date after the end date renders Alert correctly', () => {
    const { enzymeWrapper } = setup()
    enzymeWrapper.setProps({
      temporal: {
        endDate: '2019-03-29T00:00:00.000Z',
        startDate: '2019-03-30T00:00:00.000Z'
      }
    })

    expect(enzymeWrapper.find(Alert).at(0).prop('show')).toBe(true)
    expect(enzymeWrapper.find(Alert).at(1).prop('show')).toBe(false)
  })

  test('sets the start date correctly when an invalid date is passed', () => {
    const { enzymeWrapper, props } = setup()
    enzymeWrapper.find(DatepickerContainer).at(0).props().onSubmit('2012-01-efss 12:00:00')
    expect(props.onSubmitStart).toBeCalledTimes(1)
    expect(props.onSubmitStart).toHaveBeenCalledWith('2012-01-efss 12:00:00')
  })

  test('sets the end date correctly when an invalid date is passed', () => {
    const { enzymeWrapper, props } = setup()
    const testObj = moment('2012-01-efss 12:00:00', 'YYYY-MM-DD HH:mm:ss', true)

    enzymeWrapper.find(DatepickerContainer).at(1).props().onSubmit(testObj)
    expect(props.onSubmitEnd).toBeCalledTimes(1)
  })

  test('calls setFieldValue on onChange and onChangeRecurring only on onChangeComplete for the year range slider', () => {
    const { enzymeWrapper, props } = setup()

    // Set up component with required props for showing the slider
    enzymeWrapper.setProps({
      temporal: {
        startDate: '2019-01-01T00:00:00.000Z',
        endDate: '2020-01-01T00:00:00.000Z',
        isRecurring: true
      },
      setFieldValue: props.setFieldValue,
      allowRecurring: true,
      onChangeRecurring: props.onChangeRecurring
    })

    // Find the InputRange component
    const inputRange = enzymeWrapper.find('InputRange')

    // Simulate onChange
    inputRange.prop('onChange')({
      min: 2018,
      max: 2021
    })

    // Verify setFieldValue was called for both dates
    expect(props.setFieldValue).toHaveBeenCalledTimes(2)
    expect(props.setFieldValue).toHaveBeenCalledWith(
      'temporal.startDate',
      moment('2019-01-01T00:00:00.000Z').year(2018).toISOString()
    )

    expect(props.setFieldValue).toHaveBeenCalledWith(
      'temporal.endDate',
      moment('2020-01-01T00:00:00.000Z').year(2021).toISOString()
    )

    // Verify onChangeRecurring was not called during onChange
    expect(props.onChangeRecurring).not.toHaveBeenCalled()

    // Simulate onChangeComplete
    inputRange.prop('onChangeComplete')({
      min: 2018,
      max: 2021
    })

    // Verify onChangeRecurring was called only once with the new range
    expect(props.onChangeRecurring).toHaveBeenCalledTimes(1)
    expect(props.onChangeRecurring).toHaveBeenCalledWith({
      min: 2018,
      max: 2021
    })
  })
})
