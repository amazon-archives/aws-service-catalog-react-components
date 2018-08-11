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
import ListGroupItem from 'react-bootstrap/lib/ListGroupItem';
import ListGroup from 'react-bootstrap/lib/ListGroup';
import ServiceCatalog from '../ServiceCatalog';

/**
 * Renders a Bootstrap modal that displays the details
 * of the selected provisioned product.
 */
class ProvisionedDetailsModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recordDetails: null,
      paramValues: {},
    };
  }

  componentDidMount() {
    return this.listRecordDetails();
  }

  listRecordDetails = async () => {
    try {
      const { recordId, credentials, awsRegion } = this.props;
      const recordDetails = await ServiceCatalog.describeRecordDetails(recordId, credentials, awsRegion);
      this.setState({ recordDetails });
    } catch(err) {
      console.error('[ServiceCatalog] Error loading record details', err);
      if (this.props.onError) {
        this.props.onError();
      } else {
        throw err;
      }
    }
  };

  onClose = () => {
    if (this.props.onClose) {
      this.props.onClose();
    }
  };

  renderRecordDetails() {
    const { recordDetails } = this.state;
    if(!recordDetails) {
      return null;
    }

    if(!recordDetails.RecordOutputs) {
      return null;
    }

    return recordDetails.RecordOutputs.map(output => {
      return (
        <ListGroupItem key={output.OutputKey}>
          <b>{output.OutputKey}</b><br />
          <span>{output.OutputValue}</span>
        </ListGroupItem>
      );
    });
  }

  render() {
    const { show } = this.props;
    return (
      <div className="static-modal">
        <Modal show={show}>
          <Modal.Header>
            <Modal.Title>Record Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <ListGroup>
              {this.renderRecordDetails()}
            </ListGroup>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.onClose}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

ProvisionedDetailsModal.propTypes = {
  /**
   * AWS Credentials object
   */
  credentials: PropTypes.object.isRequired,
  /**
   * Whether to display the Modal or not.
   */
  show: PropTypes.bool.isRequired,
  /**
   * RecordId of the product to provision. You should get this
   * value from the <onDetailsClick> callback from the ProvisionedProducts Component.
   */
  recordId: PropTypes.string.isRequired,
  /**
   * Callback for when an error interacting with Service Catalog occurs.
   * Function will receive the error as parameter
   */
  onError: PropTypes.func,
  /**
   * Callback for when the user clicks the <Close> button.
   * Use this callback to close the modal.
   */
  onClose: PropTypes.func,
  /**
   * AWS Region where the Service Catalog resides
   */
  awsRegion: PropTypes.string,
};

export default ProvisionedDetailsModal;
