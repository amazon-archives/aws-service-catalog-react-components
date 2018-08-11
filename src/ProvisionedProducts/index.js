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
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import Label from 'react-bootstrap/lib/Label';
import ServiceCatalog from '../ServiceCatalog';

/**
 * Renders a table with a list of provisioned products for which the
 * authenticated user has access to. It allows the user to terminate
 * a product and provides a Details button.
 */
class ProvisionedProducts extends Component {
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      terminateLoading: false,
    };
  }

  componentDidMount() {
    return this.loadProducts();
  }

  loadProducts = async () => {
    try {
      const { credentials, awsRegion } = this.props;
      const products = await ServiceCatalog.searchProvisionedProducts(credentials, awsRegion);
      this.setState({ products });
    } catch (err) {
      console.error('[ServiceCatalog] Error loading provisioned products', err);
      if (this.props.onError) {
        this.props.onError(err);
      }
    }
  };

  terminateProduct = async (product) => {
    try {
      const { onTerminate, credentials, awsRegion } = this.props;
      this.setState({ terminateLoading: true });
      const response = await ServiceCatalog.terminateProvisionedProduct(
        product.Name,
        product.IdempotencyToken,
        credentials,
        awsRegion
      );

      if (response.RecordErrors.length <= 0 && onTerminate) {
        onTerminate(response);
      }
    } catch(err) {
      console.error('[ServiceCatalog] Error terminating product', err);
      if (this.props.onError) {
        this.props.onError(err);
      }
    } finally {
      this.setState({ terminateLoading: false });
      await this.loadProducts();
    }
  };

  onDetailsClick = (recordId) => {
    if (this.props.onDetailsClick) {
      this.props.onDetailsClick(recordId);
    }
  };

  static renderStatusLabel(product) {
    switch(product.Status) {
      case 'ERROR':
        const tooltip = (
          <Tooltip placement="right" className="in" id={product.Id}>
            {product.StatusMessage}
          </Tooltip>
        );
        return (
          <OverlayTrigger placement="right" overlay={tooltip}>
            <Label bsStyle="danger">{product.Status}</Label>
          </OverlayTrigger>
        );
      case 'AVAILABLE': return (<Label bsStyle="success">{product.Status}</Label>);
      default: return (<Label bsStyle="primary">{product.Status}</Label>);
    }
  }

  renderProducts() {
    const { products, terminateLoading } = this.state;
    return products.map(product => {
      const date = new Date(product.CreatedTime);
      return (
        <tr key={product.Id}>
          <td>{product.Name}</td>
          <td>
            {ProvisionedProducts.renderStatusLabel(product)}
          </td>
          <td>{date.toUTCString()}</td>
          <td>
            &nbsp;
            <button
              className="btn btn-sm btn-primary"
              onClick={() => this.onDetailsClick(product.LastRecordId)}
            >
              Details
            </button>
            &nbsp;
            <button
              className="btn btn-primary btn-sm"
              onClick={() => this.terminateProduct(product)}
              disabled={terminateLoading}>
              Terminate
            </button>
          </td>
        </tr>
      );
    });
  }

  render() {
    return (
      <div>
        <a onClick={this.loadProducts} className="pull-right">Refresh</a>
        <Table striped>
          <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>CreatedTime</th>
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

ProvisionedProducts.propTypes = {
  /**
   * AWS Credentials object
   */
  credentials: PropTypes.object.isRequired,
  /**
   * Callback for when <Details> button is clicked.
   * Function will receive the recordId of the product clicked
   */
  onDetailsClick: PropTypes.func.isRequired,
  /**
   * Callback for when an error interacting with Service Catalog occurs.
   * Function will receive the error as parameter
   */
  onError: PropTypes.func,
  /**
   * Callback for when a terminate request has been submitted.
   * Function will receive the terminate response as parameter
   */
  onTerminate: PropTypes.func,
  /**
   * AWS Region where the Service Catalog resides
   */
  awsRegion: PropTypes.string,
};

export default ProvisionedProducts;
