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
import { Auth } from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';
import { NotificationManager, NotificationContainer } from 'react-notifications';
import {
  SCProducts,
  SCProvisionModal,
  SCProvisionedProducts,
  SCProvisionedDetailsModal,
} from "aws-service-catalog-react-components";
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.onCloseModal = this.onCloseModal.bind(this);
    this.onCloseDetailsModal = this.onCloseDetailsModal.bind(this);
    this.onLaunchClick = this.onLaunchClick.bind(this);
    this.onSubmitProvisionRequest = this.onSubmitProvisionRequest.bind(this);
    this.onTerminateProduct = this.onTerminateProduct.bind(this);
    this.onError = this.onError.bind(this);
    this.onDetailsClick = this.onDetailsClick.bind(this);

    this.state = {
      showProvisionModal: false,
      showDetailsModal: false,
      credentials: null,
      productToLaunch: null,
    };
  }

  componentDidMount() {
    Auth.currentCredentials().then(credentials => {
      this.setState({ credentials: Auth.essentialCredentials(credentials) });
    });
  }

  onCloseModal() {
    this.setState({
      showProvisionModal: false,
      productToLaunch: null,
    });
  };

  onCloseDetailsModal() {
    this.setState({
      showDetailsModal: false,
      detailsRecordId: null,
    });
  };

  onLaunchClick(productToLaunch) {
    this.setState({
      showProvisionModal: true,
      productToLaunch,
    });
  };

  onSubmitProvisionRequest() {
    NotificationManager.success('Provision request submitted successfully');
    this.setState({ showProvisionModal: false });
  };

  onTerminateProduct() {
    NotificationManager.success('Terminate request submitted successfully');
  };

  onError() {
    NotificationManager.error('Request failed');
  };

  onDetailsClick(recordId) {
    this.setState({
      showDetailsModal: true,
      detailsRecordId: recordId,
    });
  };

  renderProvisionModal() {
    const { showProvisionModal, productToLaunch } = this.state;
    if (!productToLaunch) {
      return null;
    }

    return (
      <SCProvisionModal
        show={showProvisionModal}
        credentials={this.state.credentials}
        onCancel={this.onCloseModal}
        onSubmit={this.onSubmitProvisionRequest}
        onError={this.onError}
        productId={productToLaunch.product.ProductId}
        artifactId={productToLaunch.artifact.Id}
        launchPathId={productToLaunch.launchPath.Id}
      />
    );
  }

  renderDetailsModal() {
    if (!this.state.detailsRecordId) {
      return null;
    }
    return (
      <SCProvisionedDetailsModal
        show={this.state.showDetailsModal}
        credentials={this.state.credentials}
        recordId={this.state.detailsRecordId}
        onClose={this.onCloseDetailsModal}
      />
    );
  }

  render() {
    if (!this.state.credentials) {
      return (<span>Not authenticated</span>);
    }

    return (
      <div className="container">
        <NotificationContainer />
        {this.renderProvisionModal()}
        {this.renderDetailsModal()}
        <div className="row">
          <div className="col-md-8 col-md-offset-2">
            <h3 className="page-header">Product Catalog</h3>
            <SCProducts
              credentials={this.state.credentials}
              onLaunchClick={this.onLaunchClick}
            />
          </div>
        </div>
        <div className="row">
          <div className="col-md-8 col-md-offset-2">
            <h3 className="page-header">My Provisioned Products</h3>
            <SCProvisionedProducts
              credentials={this.state.credentials}
              onTerminate={this.onTerminateProduct}
              onError={this.onError}
              onDetailsClick={this.onDetailsClick}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default withAuthenticator(App);
