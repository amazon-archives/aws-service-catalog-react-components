import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import ServiceCatalog from '../../src/ServiceCatalog';
import ProvisionedProducts from '../../src/ProvisionedProducts';

const onDetailsCallback = jest.fn();
const credentials = {
  accessKeyId: '123',
  secretAccessKey: '456',
};

describe('ProvisionedProducts component', () => {

  it('should render an empty table when no provisioned products found', () => {
    ServiceCatalog.searchProvisionedProducts = jest.fn(() => []);
    const wrapper = shallow(
      <ProvisionedProducts credentials={credentials} onDetailsClick={onDetailsCallback} />,
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render a table with provisioned products', (done) => {
    ServiceCatalog.searchProvisionedProducts = jest.fn(() => [
      {
        Id: '123',
        Name: 'Dingler Server',
        CreatedTime: 20392382938,
        LastRecordId: 1,
      },
    ]);

    const wrapper = shallow(
      <ProvisionedProducts credentials={credentials} onDetailsClick={onDetailsCallback} />,
    );

    process.nextTick(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });
});
