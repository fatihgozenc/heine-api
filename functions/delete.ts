'use strict';
import { APIGatewayEvent } from "aws-lambda";
const AWS = require('aws-sdk')

exports.handler = async (event: APIGatewayEvent) => {
	let deleteParams = {
		TableName: process.env.DYNAMODB_PRODUCTS_TABLE,
		Key: {
			name: event.pathParameters.name
		}
	}

	let deleteResult = {}
	try {
		let dynamodb = new AWS.DynamoDB.DocumentClient()
		deleteResult = dynamodb.delete(deleteParams).promise()
	} catch (deleteError) {
		console.log('There was a problem getting the product.')
		console.log('deleteError', deleteError)
		return {
			statusCode: 500
		}
	}

	return {
		statusCode: 200
	}
}
