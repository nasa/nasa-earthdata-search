import React from 'react'
import Enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import { Modal } from 'react-bootstrap'
import ChunkedOrderModal from '../ChunkedOrderModal'

Enzyme.configure({ adapter: new Adapter() })

function setup() {
  const props = {
    collectionMetdata: {
      byId: {
        'C100005-EDSC': {
          metadata: {
            title: 'collection title'
          }
        }
      }
    },
    location: {},
    project: {
      byId: {
        'C100005-EDSC': {
          orderCount: 4
        }
      },
      collectionsRequiringChunking: ['C100005-EDSC']
    },
    isOpen: false,
    onSubmitRetrieval: jest.fn(),
    onToggleChunkedOrderModal: jest.fn()
  }

  const enzymeWrapper = shallow(<ChunkedOrderModal {...props} />)

  return {
    enzymeWrapper,
    props
  }
}

describe('ChunkedOrderModal component', () => {
  test('should render a Modal', () => {
    const { enzymeWrapper } = setup()

    expect(enzymeWrapper.find(Modal).length).toEqual(1)
  })

  test('should render a title', () => {
    const { enzymeWrapper } = setup()

    expect(enzymeWrapper.find(Modal.Title).text()).toEqual('Maximum Granules Exceeded')
  })

  test('should render instructions', () => {
    const { enzymeWrapper } = setup()

    expect(enzymeWrapper.find(Modal.Body).find('p').at(0).text()).toEqual('Your order for collection title will be automatically split up into 4 orders. You will receive a set of emails for each order placed.')
  })

  describe('modal actions', () => {
    test('\'Refine your search\' button should trigger onToggleChunkedOrderModal', () => {
      const { enzymeWrapper, props } = setup()

      enzymeWrapper.find('.chunked-order-modal__action--secondary').at(0).simulate('click')

      expect(props.onToggleChunkedOrderModal).toHaveBeenCalledTimes(1)
      expect(props.onToggleChunkedOrderModal).toHaveBeenCalledWith(false)
    })

    test('\'Change access method\' button should trigger onToggleChunkedOrderModal', () => {
      const { enzymeWrapper, props } = setup()

      enzymeWrapper.find('.chunked-order-modal__action--secondary').at(1).simulate('click')

      expect(props.onToggleChunkedOrderModal).toHaveBeenCalledTimes(1)
      expect(props.onToggleChunkedOrderModal).toHaveBeenCalledWith(false)
    })

    test('\'Continue\' button should trigger onToggleChunkedOrderModal', () => {
      const { enzymeWrapper, props } = setup()

      enzymeWrapper.find('.chunked-order-modal__action--secondary').at(2).simulate('click')

      expect(props.onToggleChunkedOrderModal).toHaveBeenCalledTimes(1)
      expect(props.onToggleChunkedOrderModal).toHaveBeenCalledWith(false)
      expect(props.onSubmitRetrieval).toHaveBeenCalledTimes(1)
      // expect(props.onSubmitRetrieval).toHaveBeenCalledWith(false)
    })
  })
})
