'use strict';
import { APIGatewayEvent } from "aws-lambda";
const AWS = require('aws-sdk')

exports.handler = async (event: APIGatewayEvent) => {

	let bodyObj: any = {};

	try {
		bodyObj = JSON.parse(event.body)
	} catch (jsonError) {
		console.log('There was an error parsing the body', jsonError)
		return {
			statusCode: 400
		}
	}
	if (typeof bodyObj.name === 'undefined') {
		console.log('Missing parameters')
		return {
			statusCode: 400
		}
	}

	let updateParams = {
		TableName: process.env.DYNAMODB_PRODUCTS_TABLE,
		Key: {
			name: event.pathParameters.name
		},
		UpdateExpression: 'set #age = :age',
		ExpressionAttributeName: {
			'#age': 'age'
		},
		ExpressionAttributeValues: {
			':age': bodyObj.age
		}
	}

	try {
		let dynamodb = new AWS.DynamoDB.DocumentClient()
		dynamodb.update(updateParams).promise()
	} catch (updateError) {
		console.log('There was a problem updating the product')
		console.log('updateError', updateError)
		return {
			statusCode: 500
		}
	}

	return {
		statusCode: 200
	}
}