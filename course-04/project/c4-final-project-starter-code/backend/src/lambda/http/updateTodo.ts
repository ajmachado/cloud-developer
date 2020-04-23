import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
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
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

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

  logger.info(`Updating todo  ${todoId}`)

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  await docClient.update({
    TableName: todosTable,
    Key:{
        'todoId':todoId
    },
    UpdateExpression: 'set #namefield = :name, dueDate = :dueDate, done = :done',
    ExpressionAttributeValues: {
        ':name' : updatedTodo.name,
        ':dueDate' : updatedTodo.dueDate,
        ':done' : updatedTodo.done
    },
    ExpressionAttributeNames:{
        "#namefield": "name"
      }
  }).promise()

  item = await getTodo(todoId)
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      Item: item,
    })
  }
  
}


