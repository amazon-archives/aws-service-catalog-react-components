This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

## Demo Architecture
This project uses AWS Amplify and authenticates against Cognito. End-users need to be registerd in the Cognito User Pool and belong to a Cognito Group with an IAM role associated to it and with the right permissions to access the Service Catalog Portfolios. In order for the React components to query data from Service Catalog. Amplify uses temporary credentials from STS to call the Service Catalog API, which allows us to leverage the portfolio permissions, so end-users can only see the products and portfolios that they have been granted access to.

![Architecture](../docs/arch.png)

## Configuration
For this project to work, you need to create a `config.json` and place it under `src`. The content of the file should 
look like this: (Replace the values with the correct ones from your Cognito User Pool and Identity Pool)

```json
{
  "userPoolId": "us-west-2_MyUserPoolId",
  "userPoolWebClientId": "YourPoolWebClientIdGoesHere",
  "identityPoolId": "us-west-2:00000000-0000-0000-0000-000000000000"
}
``` 

## Install
```bash
npm install && yarn install
```

## Run it locally

In the project directory, run:

```bash
npm start
```

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.
