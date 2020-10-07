'use strict';
import { APIGatewayEvent } from "aws-lambda";
const AWS = require('aws-sdk')

exports.handler = async (event: APIGatewayEvent) => {
	let getParams = {
		TableName: process.env.DYNAMODB_PRODUCTS_TABLE,
		Key: {
			name: event.pathParameters.name
		}
	}

	let getResult: any = {}
	try {
		let dynamodb = new AWS.DynamoDB.DocumentClient()
		getResult = dynamodb.get(getParams).promise()
	} catch (getError) {
		console.log('There was a problem getting the product.')
		console.log('getError', getError)
		return {
			statusCode: 500
		}
	}

	if (getResult.Item === null) {
		return {
			statusCode: 404
		}
	}

	return {
		statusCode: 200,
		body: JSON.stringify({
			name: getResult.Item.name,
			age: getResult.Item.age
		})
	}
}
