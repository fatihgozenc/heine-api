import { APIGatewayEvent } from "aws-lambda";
import middy from "@middy/core";
import doNotWaitForEmptyEventLoop from "@middy/do-not-wait-for-empty-event-loop";
import "source-map-support/register";
import FTPClient from "ftp";
import chromium from "chrome-aws-lambda";

const handler = async (event: APIGatewayEvent) => {

	let bodyObj: any = {};

	try {
		bodyObj = JSON.parse(event.body)
	} catch (e) {
		console.log('Error on parsing the body.', e)
		return {
			statusCode: 400
		}
	}

	const executablePath = process.env.IS_OFFLINE
		? '/Applications/Chromium.app/Contents/MacOS/Chromium'
		: await chromium.executablePath;

	const template = await require("../template/pdfTemplate.ejs");
	const html = await template({ bodyObj })

	let browser = null;

	try {
		browser = await chromium.puppeteer.launch({
			headless: true,
			args: chromium.args,
			ignoreHTTPSErrors: true,
			defaultViewport: chromium.defaultViewport,
			executablePath
		})
		const page = await browser.newPage();

		await page.setContent(html);

		const pdfStream = await page.pdf({
			format: "A4",
			printBackground: true,
			margin: { top: "1.5cm", right: "1.5cm", bottom: "1.5cm", left: "1.5cm" }
		});

		await browser.close()

		let uploadToFtpServer = (stream: any) => {
			return new Promise((resolve, reject) => {
				const ftp = new FTPClient()

				ftp.connect({
					host: process.env.FTP_HOST,
					user: process.env.FTP_USER,
					password: process.env.FTP_PASS,
				});

				ftp.on('ready', () => {
					ftp.put(stream, `www/datasheets/${bodyObj.name}.pdf`, (err) => {
						if (err) reject(err);
						ftp.end();
						resolve('PDF Generated successfully')
					});
				});
			})
		}

		return uploadToFtpServer(pdfStream).then(m => {
			return {
				statusCode: 200,
				body: JSON.stringify({
					message: m
				})
			}
		}).catch(err => {
			return {
				statusCode: 500,
				body: JSON.stringify(err)
			}
		})

	} catch (err) {
		console.log(err);
		return {
			statusCode: 500,
			body: JSON.stringify(err)
		}
	}
};

export const generate = middy(handler).use(doNotWaitForEmptyEventLoop());
