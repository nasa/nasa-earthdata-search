import React from 'react'
import ReactDOM from 'react-dom'
import {
  act,
  render,
  screen,
  waitFor
} from '@testing-library/react'
import MockDate from 'mockdate'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import PropTypes from 'prop-types'

import moment from 'moment'

import * as metricsActions from '../../../middleware/metrics/actions'

import TemporalSelectionDropdown from '../TemporalSelectionDropdown'
import TemporalSelectionDropdownMenu from '../TemporalSelectionDropdownMenu'

const MockTemporalMenu = ({ setStartDate, setEndDate }) => {
  const newStartDate = moment.utc('2020-06-15')
  const newEndDate = moment.utc('2020-08-30')

  return (
    <div>
      <button
        onClick={() => setStartDate(newStartDate, true, 'Typed')}
        type="button"
      >
        Set Start Date With Metrics
      </button>
      <button
        onClick={() => setStartDate(newStartDate, false, 'Typed')}
        type="button"
      >
        Set Start Date Without Metrics
      </button>
      <button
        onClick={() => setEndDate(newEndDate, true, 'Typed')}
        type="button"
      >
        Set End Date With Metrics
      </button>
      <button
        onClick={() => setEndDate(newEndDate, false, 'Typed')}
        type="button"
      >
        Set End Date Without Metrics
      </button>
    </div>
  )
}

MockTemporalMenu.propTypes = {
  setStartDate: PropTypes.func.isRequired,
  setEndDate: PropTypes.func.isRequired
}

jest.mock('../TemporalSelectionDropdownMenu')

const mockStore = configureMockStore()
const store = mockStore({})

const setup = (overrideProps) => {
  const user = userEvent.setup()
  const props = {
    temporalSearch: {
      endDate: '',
      startDate: '',
      isRecurring: false
    },
    onChangeQuery: jest.fn(),
    onMetricsTemporalFilter: jest.fn(),
    ...overrideProps
  }

  // Wrapping this in a Redux provider because DatepickerContainer has to be connected to Redux
  render(
    <Provider store={store}>
      <TemporalSelectionDropdown {...props} />
    </Provider>
  )

  return { user }
}

beforeAll(() => {
  ReactDOM.createPortal = jest.fn((dropdown) => dropdown)
  window.console.warn = jest.fn()
})

beforeEach(() => {
  TemporalSelectionDropdownMenu.mockImplementation(jest.requireActual('../TemporalSelectionDropdownMenu').default)
})

afterEach(() => {
  ReactDOM.createPortal.mockClear()
  window.console.warn.mockClear()
})

describe('TemporalSelectionDropdown component', () => {
  test('on load should be closed on initial render', () => {
    setup()

    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.queryByLabelText('Start')).not.toBeInTheDocument()
  })

  test('when clicked toggles the state of show ', async () => {
    const { user } = setup({})

    const btn = screen.getByRole('button', { name: 'Open temporal filters' })
    expect(btn).toBeInTheDocument()

    await waitFor(async () => {
      await user.click(btn)
    })

    const startLabel = screen.getByText(/Start/i)

    expect(startLabel).toBeInTheDocument()
  })

  test('sets the start date correctly when an valid date is passed', async () => {
    const { user } = setup({})

    await waitFor(async () => {
      await user.click(screen.getByRole('button', { name: 'Open temporal filters' }))
    })

    const startDateInput = screen.getByRole('textbox', { name: 'Start Date' })
    const endDateInput = screen.getByRole('textbox', { name: 'End Date' })

    const startTestObj = '2012-01-01 12:00:00'

    await act(async () => {
      await user.type(startDateInput, startTestObj)
    })

    expect(window.console.warn).toHaveBeenCalledTimes(19)

    expect(startDateInput).toHaveValue(startTestObj)
    expect(endDateInput).not.toHaveValue(startTestObj)
  })

  test('sets the end date correctly when an valid date is passed', async () => {
    const { user } = setup({})

    await waitFor(async () => {
      await user.click(screen.getByRole('button', { name: 'Open temporal filters' }))
    })

    const startDateInput = screen.getByRole('textbox', { name: 'Start Date' })
    const endDateInput = screen.getByRole('textbox', { name: 'End Date' })

    const endTestObj = '2015-01-01 12:00:00'

    await act(async () => {
      await user.type(endDateInput, endTestObj)
    })

    expect(window.console.warn).toHaveBeenCalledTimes(18)

    expect(startDateInput).not.toHaveValue(endTestObj)
    expect(endDateInput).toHaveValue(endTestObj)
  })

  test('sets the state correctly with an invalid start date', async () => {
    const { user } = setup({})

    await waitFor(async () => {
      await user.click(screen.getByRole('button', { name: 'Open temporal filters' }))
    })

    const startDateInput = screen.getByRole('textbox', { name: 'Start Date' })
    const endDateInput = screen.getByRole('textbox', { name: 'End Date' })

    const invalidDate = '2012-01-efss 12:00:00'
    const validStartDate = moment.utc('2012-01-01 12:00:00').format('YYYY-MM-DD HH:mm:ss')
    const validEndDate = moment.utc('2012-01-02 12:00:00').format('YYYY-MM-DD HH:mm:ss')

    await act(async () => {
      await user.type(startDateInput, invalidDate)
    })

    expect(window.console.warn).toHaveBeenCalledTimes(21)

    expect(screen.getByText(/Invalid start date/i)).toBeInTheDocument()

    await act(async () => {
      await user.clear(startDateInput)
      await user.type(startDateInput, validStartDate)
      await user.type(endDateInput, validEndDate)
    })

    expect(startDateInput).toHaveValue(validStartDate)
    expect(endDateInput).toHaveValue(validEndDate)
  })

  test('clears the values onClearClick and converts full utc datetime format to expected format', async () => {
    const onChangeQueryMock = jest.fn()
    const validStartDate = '2019-03-29T00:00:00.000Z'
    const validEndDate = '2019-03-30T00:00:00.000Z'
    const { user } = setup({
      onChangeQuery: onChangeQueryMock,
      temporalSearch: {
        endDate: validEndDate,
        startDate: validStartDate
      }
    })

    await waitFor(async () => {
      await user.click(screen.getAllByRole('button', { name: 'Open temporal filters' }).at(0))
    })

    const startDateInput = screen.getByRole('textbox', { name: 'Start Date' })
    const endDateInput = screen.getByRole('textbox', { name: 'End Date' })

    expect(startDateInput).toHaveValue('2019-03-29 00:00:00')
    expect(endDateInput).toHaveValue('2019-03-30 00:00:00')

    const clearBtn = screen.getAllByRole('button', { name: 'Clear' }).at(2)
    await waitFor(async () => {
      await user.click(clearBtn)
    })

    await waitFor(async () => {
      await user.click(screen.getByRole('button', { name: 'Open temporal filters' }))
    })

    const updatedStartDateInput = screen.getByRole('textbox', { name: 'Start Date' })
    const updatedEndtDateInput = screen.getByRole('textbox', { name: 'End Date' })

    expect(updatedStartDateInput).toHaveValue('')
    expect(updatedEndtDateInput).toHaveValue('')

    expect(onChangeQueryMock).toHaveBeenCalledTimes(1)
  })

  test('applies the values onApplyClick', async () => {
    const onChangeQueryMock = jest.fn()
    const { user } = setup({
      onChangeQuery: onChangeQueryMock
    })

    const validStartDate = '2019-03-29 00:00:00'
    const validEndDate = '2019-03-30 00:00:00'

    const expectedStartDate = '2019-03-29T00:00:00.000Z'
    const expectedEndDate = '2019-03-30T23:59:59.999Z'

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Open temporal filters' }))
    })

    const startDateInput = screen.getByRole('textbox', { name: 'Start Date' })
    const endDateInput = screen.getByRole('textbox', { name: 'End Date' })

    await act(async () => {
      await user.type(startDateInput, validStartDate)
      await user.type(endDateInput, validEndDate)

      await user.click(startDateInput)
    })

    expect(window.console.warn).toHaveBeenCalledTimes(36)

    expect(startDateInput).toHaveValue(moment.utc(validStartDate).format('YYYY-MM-DD HH:mm:ss'))
    expect(endDateInput).toHaveValue(moment.utc(validEndDate).endOf('day').format('YYYY-MM-DD HH:mm:ss'))

    const applyBtn = screen.getByRole('button', { name: 'Apply' })

    await waitFor(async () => {
      await user.click(applyBtn)
    })

    expect(onChangeQueryMock).toHaveBeenCalledWith({
      collection: {
        temporal: {
          isRecurring: false,
          startDate: expectedStartDate,
          endDate: expectedEndDate
        }
      }
    })

    expect(onChangeQueryMock).toHaveBeenCalledTimes(1)
  })

  test('applies the values for leap years onApplyUser.click', async () => {
    const onChangeQueryMock = jest.fn()
    const { user } = setup({
      onChangeQuery: onChangeQueryMock
    })

    const validStartDate = '2021-06-15 00:00:00'
    const validEndDate = '2024-06-15 23:59:59'

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Open temporal filters' }))
    })

    const startField = await screen.findByRole('textbox', { name: 'Start Date' })
    const endField = await screen.findByRole('textbox', { name: 'End Date' })

    // Select the start date
    await user.click(startField)
    await user.click((await screen.findAllByText('2021')).at(0))
    await user.click(await screen.findByText('Jun'))
    await user.click(await screen.findByText('15'))
    expect(startField).toHaveValue(validStartDate)

    // Select the end date
    await user.click(endField)
    await user.click((await screen.findAllByText('2024')).at(0))
    await user.click(await screen.findByText('Jun'))
    await user.click((await screen.findAllByText('15')).at(1))
    expect(endField).toHaveValue(validEndDate)

    // Select Recurring
    await user.click(screen.getByLabelText('Recurring?'))

    const applyBtn = screen.getByRole('button', { name: 'Apply' })
    await user.click(applyBtn)

    expect(onChangeQueryMock).toHaveBeenCalledWith({
      collection: {
        temporal: {
          isRecurring: true,
          startDate: '2021-06-15T00:00:00.000Z',
          endDate: '2024-06-15T23:59:59.999Z',
          recurringDayEnd: '166',
          recurringDayStart: '166'
        }
      }
    })

    expect(onChangeQueryMock).toHaveBeenCalledTimes(1)
  })

  test('onMetricsTemporalFilter is called on Apply', async () => {
    const onMetricsTemporalFilterMock = jest.fn()
    const onChangeQueryMock = jest.fn()
    const { user } = setup({
      onMetricsTemporalFilter: onMetricsTemporalFilterMock,
      onChangeQuery: onChangeQueryMock
    })

    const validStartDate = '2019-03-29 00:00:00'
    const validEndDate = '2019-03-30 00:00:00'

    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'Open temporal filters' }))
    })

    const startDateInput = screen.getByRole('textbox', { name: 'Start Date' })
    const endDateInput = screen.getByRole('textbox', { name: 'End Date' })

    await act(async () => {
      await user.type(startDateInput, validStartDate)
      await user.type(endDateInput, validEndDate)
    })

    const applyBtn = screen.getByRole('button', { name: 'Apply' })

    await waitFor(async () => {
      await user.click(applyBtn)
    })

    expect(onMetricsTemporalFilterMock).toHaveBeenCalledWith({
      type: 'Apply Temporal Filter',
      value: '{"startDate":"2019-03-29T00:00:00.000Z","endDate":"2019-03-30T23:59:59.999Z","isRecurring":false}'
    })
  })

  test('onMetricsTemporalFilter is called on Clear', async () => {
    const onMetricsTemporalFilterMock = jest.fn()
    const { user } = setup({ onMetricsTemporalFilter: onMetricsTemporalFilterMock })

    await waitFor(async () => {
      await user.click(screen.getByRole('button', { name: 'Open temporal filters' }))
    })

    const clearBtn = screen.getAllByRole('button', { name: 'Clear' }).at(2)
    await waitFor(async () => {
      await user.click(clearBtn)
    })

    expect(onMetricsTemporalFilterMock).toHaveBeenCalledTimes(1)
    expect(onMetricsTemporalFilterMock).toHaveBeenCalledWith({
      type: 'Clear Temporal Filter',
      value: {}
    })
  })

  test('onMetricsTemporalFilter is not called on Clear if is null', async () => {
    const onMetricsTemporalFilterSpy = jest.spyOn(metricsActions, 'metricsTemporalFilter')
    const { user } = setup({ onMetricsTemporalFilter: null })

    await waitFor(async () => {
      await user.click(screen.getByRole('button', { name: 'Open temporal filters' }))
    })

    const clearBtn = screen.getAllByRole('button', { name: 'Clear' }).at(2)
    await waitFor(async () => {
      await user.click(clearBtn)
    })

    expect(onMetricsTemporalFilterSpy).toHaveBeenCalledTimes(0)
  })

  test('onMetricsTemporalFilter is called when toggling recurring', async () => {
    const onMetricsTemporalFilterMock = jest.fn()
    const { user } = setup({ onMetricsTemporalFilter: onMetricsTemporalFilterMock })

    await waitFor(async () => {
      await user.click(screen.getByRole('button', { name: 'Open temporal filters' }))
    })

    const recurringCheckbox = screen.getByLabelText('Recurring?')

    await waitFor(async () => {
      await user.click(recurringCheckbox)
    })

    expect(onMetricsTemporalFilterMock).toHaveBeenCalledTimes(1)
    expect(onMetricsTemporalFilterMock).toHaveBeenCalledWith({
      type: 'Set Recurring',
      value: true
    })
  })

  test('onMetricsTemporalFilter is not called when it is null and recurring is toggled', async () => {
    const onMetricsTemporalFilterSpy = jest.spyOn(metricsActions, 'metricsTemporalFilter')
    const { user } = setup({ onMetricsTemporalFilter: null })

    await waitFor(async () => {
      await user.click(screen.getByRole('button', { name: 'Open temporal filters' }))
    })

    const recurringCheckbox = screen.getByLabelText('Recurring?')

    await waitFor(async () => {
      await user.click(recurringCheckbox)
    })

    expect(onMetricsTemporalFilterSpy).toHaveBeenCalledTimes(0)
  })

  describe('setStartDate', () => {
    beforeEach(() => {
      TemporalSelectionDropdownMenu.mockImplementation(MockTemporalMenu)
    })

    describe('when metrics should be submitted', () => {
      test('calls onMetricsTemporalFilter', async () => {
        const onMetricsTemporalFilterMock = jest.fn()
        const { user } = setup({
          onMetricsTemporalFilter: onMetricsTemporalFilterMock
        })

        await waitFor(async () => {
          await user.click(screen.getByRole('button', { name: 'Open temporal filters' }))
        })

        await user.click(screen.getByRole('button', { name: 'Set Start Date With Metrics' }))

        expect(onMetricsTemporalFilterMock).toHaveBeenCalledTimes(1)
        expect(onMetricsTemporalFilterMock).toHaveBeenCalledWith({
          type: 'Set Start Date - Typed',
          value: '2020-06-15T00:00:00.000Z'
        })
      })
    })

    describe('when metrics should not be submitted', () => {
      test('does not call onMetricsTemporalFilter', async () => {
        const onMetricsTemporalFilterMock = jest.fn()
        const { user } = setup({
          onMetricsTemporalFilter: onMetricsTemporalFilterMock
        })

        await waitFor(async () => {
          await user.click(screen.getByRole('button', { name: 'Open temporal filters' }))
        })

        await user.click(screen.getByRole('button', { name: 'Set Start Date Without Metrics' }))

        expect(onMetricsTemporalFilterMock).toHaveBeenCalledTimes(0)
      })
    })
  })

  describe('setEndDate', () => {
    beforeEach(() => {
      TemporalSelectionDropdownMenu.mockImplementation(MockTemporalMenu)
    })

    describe('when metrics should be submitted', () => {
      test('calls onMetricsTemporalFilter', async () => {
        const onMetricsTemporalFilterMock = jest.fn()
        const { user } = setup({
          onMetricsTemporalFilter: onMetricsTemporalFilterMock
        })

        await waitFor(async () => {
          await user.click(screen.getByRole('button', { name: 'Open temporal filters' }))
        })

        await user.click(screen.getByRole('button', { name: 'Set End Date With Metrics' }))

        expect(onMetricsTemporalFilterMock).toHaveBeenCalledTimes(1)
        expect(onMetricsTemporalFilterMock).toHaveBeenCalledWith({
          type: 'Set End Date - Typed',
          value: '2020-08-30T00:00:00.000Z'
        })
      })
    })

    describe('when metrics should not be submitted', () => {
      test('does not call onMetricsTemporalFilter', async () => {
        const onMetricsTemporalFilterMock = jest.fn()
        const { user } = setup({
          onMetricsTemporalFilter: onMetricsTemporalFilterMock
        })

        await waitFor(async () => {
          await user.click(screen.getByRole('button', { name: 'Open temporal filters' }))
        })

        await user.click(screen.getByRole('button', { name: 'Set End Date Without Metrics' }))

        expect(onMetricsTemporalFilterMock).toHaveBeenCalledTimes(0)
      })
    })
  })

  describe('TemporalSelectionDropdown recurring and slider behavior', () => {
    test('handles recurring toggle and slider interactions correctly', async () => {
      const onChangeQueryMock = jest.fn()
      const user = userEvent.setup()

      setup({
        onChangeQuery: onChangeQueryMock,
        temporalSearch: {
          startDate: '2022-03-29T00:00:00.000Z',
          endDate: '2024-03-30T00:00:00.000Z',
          isRecurring: true
        }
      })

      // Open dropdown and verify recurring state
      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Open temporal filters' }))
      })

      const startDateInput = screen.getByRole('textbox', { name: 'Start Date' })
      const endDateInput = screen.getByRole('textbox', { name: 'End Date' })

      // In recurring mode, dates should show without year
      expect(startDateInput).toHaveValue('03-29 00:00:00')
      expect(endDateInput).toHaveValue('03-30 00:00:00')
      expect(screen.getByText('Year Range:')).toBeInTheDocument()
      expect(screen.getByText('2022 - 2024')).toBeInTheDocument()

      // Apply recurring state
      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Apply' }))
      })

      expect(onChangeQueryMock).toHaveBeenCalledWith({
        collection: {
          temporal: {
            isRecurring: true,
            startDate: expect.stringMatching(/^2022-03-29/),
            endDate: expect.stringMatching(/^2024-03-30/),
            recurringDayStart: '88',
            recurringDayEnd: '89'
          }
        }
      })

      // Reopen dropdown
      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Open temporal filters' }))
      })

      // Find the checkbox and ensure it's checked
      const recurringCheckbox = screen.getByRole('checkbox', { checked: true })

      // Uncheck it
      await act(async () => {
        await user.click(recurringCheckbox)
        await waitFor(() => {
          expect(recurringCheckbox).not.toBeChecked()
        })
      })

      // Apply non-recurring state
      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Apply' }))
      })

      expect(onChangeQueryMock).toHaveBeenLastCalledWith({
        collection: {
          temporal: {
            isRecurring: false,
            startDate: expect.stringMatching(/^2022-03-29/),
            endDate: expect.stringMatching(/^2024-03-30/)
          }
        }
      })
    })

    test('handles recurring toggle with same year dates', async () => {
      const onChangeQueryMock = jest.fn()
      const user = userEvent.setup()

      setup({
        onChangeQuery: onChangeQueryMock,
        temporalSearch: {
          startDate: '2024-03-29T00:00:00.000Z',
          endDate: '2024-03-30T00:00:00.000Z',
          isRecurring: false
        }
      })

      // Open dropdown
      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Open temporal filters' }))
      })

      const startDateInput = screen.getByRole('textbox', { name: 'Start Date' })
      const endDateInput = screen.getByRole('textbox', { name: 'End Date' })

      // Initial non-recurring state
      expect(startDateInput).toHaveValue('2024-03-29 00:00:00')
      expect(endDateInput).toHaveValue('2024-03-30 00:00:00')
      expect(screen.queryByText('Year Range:')).not.toBeInTheDocument()

      // Toggle recurring on
      const recurringCheckbox = screen.getByRole('checkbox', { checked: false })
      await act(async () => {
        await user.click(recurringCheckbox)
        await waitFor(() => {
          expect(recurringCheckbox).toBeChecked()
        })
      })

      // In recurring mode, dates should show without year and use minimum year
      expect(startDateInput).toHaveValue('03-29 00:00:00')
      expect(endDateInput).toHaveValue('03-30 00:00:00')
      expect(screen.getByText('Year Range:')).toBeInTheDocument()
      expect(screen.getByText('1960 - 2024')).toBeInTheDocument()

      // Apply recurring state
      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Apply' }))
      })

      expect(onChangeQueryMock).toHaveBeenCalledWith({
        collection: {
          temporal: {
            isRecurring: true,
            startDate: '1960-03-29T00:00:00.000Z',
            endDate: '2024-03-30T00:00:00.000Z',
            recurringDayStart: '89',
            recurringDayEnd: '90'
          }
        }
      })
    })
  })

  describe('TemporalSelectionDropdown when dates aren\'t set', () => {
    test('handles recurring toggle with only start date set', async () => {
      MockDate.set('2024-02-01T06:00:00.000Z')
      const onChangeQueryMock = jest.fn()
      const user = userEvent.setup()

      setup({
        onChangeQuery: onChangeQueryMock,
        temporalSearch: {
          startDate: '2024-01-01T00:00:00.000Z',
          endDate: '',
          isRecurring: false
        }
      })

      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Open temporal filters' }))
      })

      const startDateInput = screen.getByRole('textbox', { name: 'Start Date' })
      const endDateInput = screen.getByRole('textbox', { name: 'End Date' })

      expect(startDateInput).toHaveValue('2024-01-01 00:00:00')
      expect(endDateInput).toHaveValue('')
      expect(screen.queryByText('Year Range:')).not.toBeInTheDocument()

      const recurringCheckbox = screen.getByRole('checkbox', { name: 'Recurring?' })
      await act(async () => {
        await user.click(recurringCheckbox)
        await waitFor(() => {
          expect(recurringCheckbox).toBeChecked()
        })
      })

      expect(startDateInput).toHaveValue('01-01 05:00:00')
      expect(endDateInput).toHaveValue('02-01 06:00:00')
      expect(screen.getByText('Year Range:')).toBeInTheDocument()
      expect(screen.getByText('1960 - 2024')).toBeInTheDocument()

      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Apply' }))
      })

      expect(onChangeQueryMock).toHaveBeenCalledWith({
        collection: {
          temporal: {
            isRecurring: true,
            startDate: '1960-01-01T05:00:00.000Z',
            endDate: '2024-02-01T06:00:00.000Z',
            recurringDayStart: '1',
            recurringDayEnd: '32'
          }
        }
      })

      MockDate.reset()
    })

    test('handles recurring toggle with unset dates', async () => {
      MockDate.set('2024-02-01T06:00:00.000Z')
      const onChangeQueryMock = jest.fn()
      const user = userEvent.setup()

      setup({
        onChangeQuery: onChangeQueryMock,
        temporalSearch: {
          startDate: '',
          endDate: '',
          isRecurring: false
        }
      })

      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Open temporal filters' }))
      })

      const startDateInput = screen.getByRole('textbox', { name: 'Start Date' })
      const endDateInput = screen.getByRole('textbox', { name: 'End Date' })

      expect(startDateInput).toHaveValue('')
      expect(endDateInput).toHaveValue('')
      expect(screen.queryByText('Year Range:')).not.toBeInTheDocument()

      const recurringCheckbox = screen.getByRole('checkbox', { checked: false })
      await act(async () => {
        await user.click(recurringCheckbox)
        await waitFor(() => {
          expect(recurringCheckbox).toBeChecked()
        })
      })

      expect(startDateInput).toHaveValue('01-01 05:00:00')
      expect(endDateInput).toHaveValue('02-01 06:00:00')
      expect(screen.getByText('Year Range:')).toBeInTheDocument()
      expect(screen.getByText('1960 - 2024')).toBeInTheDocument()

      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Apply' }))
      })

      expect(onChangeQueryMock).toHaveBeenCalledWith({
        collection: {
          temporal: {
            isRecurring: true,
            startDate: '1960-01-01T05:00:00.000Z',
            endDate: '2024-02-01T06:00:00.000Z',
            recurringDayStart: '1',
            recurringDayEnd: '32'
          }
        }
      })

      MockDate.reset()
    })

    test('handles recurring toggle with only end date set', async () => {
      MockDate.set('2024-02-01T06:00:00.000Z')
      const onChangeQueryMock = jest.fn()
      const user = userEvent.setup()

      setup({
        onChangeQuery: onChangeQueryMock,
        temporalSearch: {
          startDate: '',
          endDate: '2020-01-25T00:00:00.000Z',
          isRecurring: false
        }
      })

      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Open temporal filters' }))
      })

      const startDateInput = screen.getByRole('textbox', { name: 'Start Date' })
      const endDateInput = screen.getByRole('textbox', { name: 'End Date' })

      expect(startDateInput).toHaveValue('')
      expect(endDateInput).toHaveValue('2020-01-25 00:00:00')
      expect(screen.queryByText('Year Range:')).not.toBeInTheDocument()

      const recurringCheckbox = screen.getByRole('checkbox', { checked: false })
      await act(async () => {
        await user.click(recurringCheckbox)
        await waitFor(() => {
          expect(recurringCheckbox).toBeChecked()
        })
      })

      expect(startDateInput).toHaveValue('01-01 05:00:00')
      expect(endDateInput).toHaveValue('01-25 00:00:00')
      expect(screen.getByText('Year Range:')).toBeInTheDocument()
      expect(screen.getByText('1960 - 2020')).toBeInTheDocument()

      await act(async () => {
        await user.click(screen.getByRole('button', { name: 'Apply' }))
      })

      expect(onChangeQueryMock).toHaveBeenCalledWith({
        collection: {
          temporal: {
            isRecurring: true,
            startDate: '1960-01-01T05:00:00.000Z',
            endDate: '2020-01-25T00:00:00.000Z',
            recurringDayStart: '1',
            recurringDayEnd: '25'
          }
        }
      })

      MockDate.reset()
    })
  })
})
