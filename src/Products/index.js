/*
 * Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Table from 'react-bootstrap/lib/Table';
import Button from 'react-bootstrap/lib/Button';
import ServiceCatalog from '../ServiceCatalog';

/**
 * Product component renders a table with all products available
 * to the user. These products can come from different Service Catalog portfolios.
 */
class Products extends Component {
  constructor(props) {
    super(props);
    this.onLaunchClick = this.onLaunchClick.bind(this);
    this.state = { products: [] };
  }

  async componentDidMount() {
    const { credentials, onError, awsRegion } = this.props;
    try {
      const products = await ServiceCatalog.searchProducts(credentials, awsRegion);
      this.setState({ products });
    } catch (err) {
      console.error('[ServiceCatalog] Error loading products', err);
      if (onError) {
        onError(err);
      } else {
        throw err;
      }
    }
  }

  onLaunchClick(product, artifact, launchPath) {
    if (this.props.onLaunchClick) {
      this.props.onLaunchClick({
        product,
        artifact,
        launchPath,
      });
    }
  };

  renderProducts() {
    const { products } = this.state;
    return products.map(({ product, artifacts, launchPaths }) => {
      return artifacts.map(artifact => {
        return (
          <tr key={artifact.Id}>
            <td>{product.ProductId}</td>
            <td>{product.Name} - {artifact.Name}</td>
            <td>{artifact.Description}</td>
            <td>
              <Button
                className="btn btn-primary btn-sm"
                onClick={() => this.onLaunchClick(product, artifact, launchPaths[0])}
              >
                Launch
              </Button>
            </td>
          </tr>
        );
      });
    });
  }

  render() {
    return (
      <div>
        <Table striped>
          <thead>
          <tr>
            <th>Id</th>
            <th>Resource</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          {this.renderProducts()}
          </tbody>
        </Table>
      </div>
    );
  }
}

Products.propTypes = {
  /**
   * AWS Credentials object
   */
  credentials: PropTypes.object.isRequired,
  /**
   * Callback for when <Launch> button is clicked.
   * Function will receive an object with data about the
   * product desired to launch
   */
  onLaunchClick: PropTypes.func,
  /**
   * Callback for when an error loading the products occurs.
   * Function will receive the error as parameter
   */
  onError: PropTypes.func,
  /**
   * AWS Region where the Service Catalog resides
   */
  awsRegion: PropTypes.string,
};

export default Products;
