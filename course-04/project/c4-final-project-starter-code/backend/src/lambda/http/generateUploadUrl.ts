import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../../auth/authHelper'
import { getTodo } from '../../dataLayer/dataHelper'
import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'


const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
  signatureVersion: 'v4'
})

const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

const logger = createLogger('Todos')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  const authHeader = event.headers['Authorization']

  const userId = getUserId(authHeader) 

  let item = await getTodo(todoId)

  if(item.Count == 0){
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Invalid Todo Id'
      })
    }
  }

  if(item.userId != userId){
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'User not authorized'
      })
    }
  }

  logger.info(`Getting upload url  ${todoId}`)

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id

  const url =  s3.getSignedUrl('putObject', {
                  Bucket: bucketName,
                  Key: `${todoId}.png`,
                  Expires: urlExpiration
                })
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl: url
    })
  }
}
