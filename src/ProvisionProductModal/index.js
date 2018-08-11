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
import Button from 'react-bootstrap/lib/Button';
import Modal from 'react-bootstrap/lib/Modal';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import FormControl from 'react-bootstrap/lib/FormControl';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import ServiceCatalog from '../ServiceCatalog';

/**
 * Renders a Bootstrap Modal to provision the selected product.
 * Dynamically generates a form with the configurable parameters
 * for the product.
 */
class ProvisionProductModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      resourceName: '',
      formValues: {},
      provisioningParams: [],
    };
  }

  componentDidMount() {
    return this.loadProvisioningParameters();
  }

  onResourceNameChange = (e) => {
    this.setState({ resourceName: e.target.value });
  };

  onParamChange = (e) => {
    const formValues = this.state.formValues;
    formValues[e.target.name] = e.target.value;
    this.setState({ formValues: formValues });
  };

  loadProvisioningParameters = async () => {
    try {
      const { productId, artifactId, launchPathId, credentials, awsRegion } = this.props;
      const provisioningParams = await ServiceCatalog.describeProvisioningParameters(
        productId,
        artifactId,
        launchPathId,
        credentials,
        awsRegion,
      );
      this.setState({ provisioningParams });
    } catch(err) {
      console.error('[ServiceCatalog] Error loading provisioning parameters', err);
      if (this.props.onError) {
        this.props.onError();
      }
    }
  };

  provisionProduct = async () => {
    const { productId, artifactId, launchPathId, credentials, onSubmit, onError, awsRegion } = this.props;
    const { resourceName, formValues } = this.state;
    const provisioningParams = Object.keys(formValues).map(key => ({ Key: key, Value: formValues[key] }));
    try {
      await ServiceCatalog.provisionProduct({
        ProductId: productId,
        ProvisioningArtifactId: artifactId,
        PathId: launchPathId,
        ResourceName: resourceName,
        ProvisioningParams: provisioningParams,
      }, credentials, awsRegion);

      if (onSubmit) {
        onSubmit();
      }
    } catch(err) {
      console.error('[ServiceCatalog] Error provisioning product', err);
      if (onError) {
        onError(err);
      }
    }
  };

  onCancel = () => {
    this.setState({
      provisioningParams: [],
      formValues: {},
      resourceName: '',
    });
    if (this.props.onCancel) {
      this.props.onCancel();
    }
  };

  renderProvisioningParams() {
    const { provisioningParams } = this.state;
    return provisioningParams.map(param => {
      return (
        <FormGroup controlId="formBasicText" key={param.ParameterKey}>
          <ControlLabel>{param.Description}</ControlLabel>
          <FormControl
            type="text"
            name={param.ParameterKey}
            placeholder={param.DefaultValue}
            onChange={this.onParamChange}
          />
        </FormGroup>
      );
    });
  }

  render() {
    const { show } = this.props;
    return (
      <div>
        <Modal show={show}>
          <Modal.Header>
            <Modal.Title>Provision Product</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form>
              <FormGroup controlId="formBasicText">
                <ControlLabel>Resource Name</ControlLabel>
                <FormControl
                  type="text"
                  value={this.state.resourceName}
                  placeholder="Enter a name for your launched resource"
                  onChange={this.onResourceNameChange}
                />
              </FormGroup>
              {this.renderProvisioningParams()}
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={() => this.onCancel()}>Close</Button>
            <Button bsStyle="primary" onClick={this.provisionProduct}>Submit Request</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

ProvisionProductModal.propTypes = {
  /**
   * AWS Credentials object
   */
  credentials: PropTypes.object.isRequired,
  /**
   * Whether to display the Modal or not.
   */
  show: PropTypes.bool.isRequired,
  /**
   * ProductId of the product to provision. You should get this
   * value from the <onLaunchClick> callback from the Products Component.
   */
  productId: PropTypes.string.isRequired,
  /**
   * ArtifactId of the product to provision. You should get this
   * value from the <onLaunchClick> callback from the Products Component.
   */
  artifactId: PropTypes.string.isRequired,
  /**
   * LaunchPathId of the product to provision. You should get this
   * value from the <onLaunchClick> callback from the Products Component.
   */
  launchPathId: PropTypes.string.isRequired,
  /**
   * Callback for when the Launch Request has been submitted to the
   * Service Catalog API. Use this callback to show an acknowledge the user
   */
  onSubmit: PropTypes.func,
  /**
   * Callback for when an error interacting with Service Catalog occurs.
   * Function will receive the error as parameter
   */
  onError: PropTypes.func,
  /**
   * Callback for when the user clicks the <Cancel> button.
   * Use this callback to close the modal.
   */
  onCancel: PropTypes.func,
  /**
   * AWS Region where the Service Catalog resides
   */
  awsRegion: PropTypes.string,
};

export default ProvisionProductModal;
