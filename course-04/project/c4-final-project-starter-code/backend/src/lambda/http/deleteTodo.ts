import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../../auth/authHelper'
import { getTodo } from '../../dataLayer/dataHelper'
import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'


const XAWS = AWSXRay.captureAWS(AWS)

const docClient = new XAWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE

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

  logger.info(`Deleting todo  ${todoId}`)

  // TODO: Remove a TODO item by id
  await docClient.delete({
    TableName: todosTable,
    Key:{
        "todoId":todoId
    }
  }).promise()
  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: null
  }
}


