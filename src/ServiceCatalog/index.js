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
import sc from './client';
import UUID from 'uuid/v4';

const searchProducts = async (credentials, region) => {
  const serviceCatalog = await sc.getServiceCatalogClient(credentials, region);
  const products = [];
  const searchResult = await serviceCatalog.searchProducts().promise();
  for (const product of searchResult.ProductViewSummaries) {
    const productDetailsPromise = serviceCatalog.describeProduct({ Id: product.ProductId }).promise();
    const productLaunchPathsPromise = serviceCatalog.listLaunchPaths({ ProductId: product.ProductId }).promise();

    const response = await Promise.all([productDetailsPromise, productLaunchPathsPromise]);
    const productDetails = response[0];
    const productLaunchPaths = response[1];

    products.push({
      product: productDetails.ProductViewSummary,
      artifacts: productDetails.ProvisioningArtifacts,
      launchPaths: productLaunchPaths.LaunchPathSummaries,
    });
  }
  return products;
};

const describeProvisioningParameters = async (productId, artifactId, launchPathId, credentials, region) => {
  const serviceCatalog = await sc.getServiceCatalogClient(credentials, region);
  const response = await serviceCatalog.describeProvisioningParameters({
    ProductId: productId,
    ProvisioningArtifactId: artifactId,
    PathId: launchPathId,
  }).promise();
  return response.ProvisioningArtifactParameters;
};

const provisionProduct = async (provisionRequest, credentials, region) => {
  const serviceCatalog = await sc.getServiceCatalogClient(credentials, region);
  return await serviceCatalog.provisionProduct({
    ProductId: provisionRequest.ProductId,
    ProvisionToken: UUID(),
    ProvisionedProductName: provisionRequest.ResourceName,
    ProvisioningArtifactId: provisionRequest.ProvisioningArtifactId,
    PathId: provisionRequest.PathId,
    ProvisioningParameters: provisionRequest.ProvisioningParams,
  }).promise();
};

const searchProvisionedProducts = async (credentials, region) => {
  const serviceCatalog = await sc.getServiceCatalogClient(credentials, region);
  const response = await serviceCatalog.searchProvisionedProducts().promise();
  return response.ProvisionedProducts;
};

const terminateProvisionedProduct = async (provisionedProductName, idempotencyToken, credentials, region) => {
  const serviceCatalog = await sc.getServiceCatalogClient(credentials, region);
  const response = await serviceCatalog.terminateProvisionedProduct({
    TerminateToken: idempotencyToken,
    ProvisionedProductName: provisionedProductName,
  }).promise();
  return response.RecordDetail;
};

const describeRecordDetails = async (recordId, credentials, region) => {
  const serviceCatalog = await sc.getServiceCatalogClient(credentials, region);
  return await serviceCatalog.describeRecord({ Id: recordId }).promise();
};

export default {
  searchProducts,
  describeProvisioningParameters,
  provisionProduct,
  searchProvisionedProducts,
  terminateProvisionedProduct,
  describeRecordDetails,
};
