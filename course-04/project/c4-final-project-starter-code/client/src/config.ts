// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '0i20l22e27'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-ojhxvc7v.auth0.com',            // Auth0 domain
  clientId: 'xkTNkocMF5X8O1F7VB27wgLJkrm99Tf2',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
