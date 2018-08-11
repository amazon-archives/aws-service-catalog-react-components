import React from 'react';
import { shallow } from 'enzyme';
import toJson from 'enzyme-to-json';
import ServiceCatalog from '../../src/ServiceCatalog';
import Products from '../../src/Products';

const credentials = {
  accessKeyId: '123',
  secretAccessKey: '456',
};

describe('Products component', () => {

  it('should render an empty table when no products found', () => {
    ServiceCatalog.searchProducts = jest.fn(() => []);
    const wrapper = shallow(<Products credentials={credentials} />);
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should render a table with products', (done) => {
    ServiceCatalog.searchProducts = jest.fn(() => [{
      product: {
        ProductId: '1',
        Name: 'Linux Server',
      },
      artifacts: [{
        Id: 'abc',
        Description: 'Amazon AMI',
      }],
      launchPaths: [{
        Id: '123'
      }],
    }]);

    const wrapper = shallow(
      <Products credentials={credentials} />,
    );

    process.nextTick(() => {
      wrapper.update();
      expect(toJson(wrapper)).toMatchSnapshot();
      done();
    });
  });
});
