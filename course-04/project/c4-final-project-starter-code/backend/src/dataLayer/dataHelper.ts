
import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'


const XAWS = AWSXRay.captureAWS(AWS)

const docClient = new XAWS.DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE

export async function getTodo(todoId: string) {
    const result = await docClient
      .query({
        TableName: todosTable,
        KeyConditionExpression: 'todoId = :todoId',
        ExpressionAttributeValues:{
          ':todoId': todoId
        }
      })
      .promise()
    return result.Item
}