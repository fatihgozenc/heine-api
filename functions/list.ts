'use strict';
import { APIGatewayEvent } from "aws-lambda";
const AWS = require('aws-sdk')

interface ScanResult {
	Items: Array<{ name: string, age: number }>
}


exports.handler = async (event: APIGatewayEvent) => {

	let scanParams = {
		TableName: process.env.DYNAMODB_PRODUCTS_TABLE
	}

	let scanResult = {} as ScanResult

	try {
		let dynamodb = new AWS.DynamoDB.DocumentClient()
		scanResult = await dynamodb.scan(scanParams).promise()
	} catch (scanError) {
		console.log('There was a problem while scanning products')
		console.log('scanError', scanError)
		return {
			statusCode: 500
		}
	}

	if (scanResult.Items === null ||
		!Array.isArray(scanResult) ||
		scanResult.Items.length === 0) {
		return {
			statusCode: 404
		}
	}

	return {
		statusCode: 200,
		body: JSON.stringify(scanResult.Items.map(product => {
			return {
				name: product.name,
				age: product.age
			}
		}))
	}
}