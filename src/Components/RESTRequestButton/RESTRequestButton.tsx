import React, { Component } from 'react'
import * as SDK from "azure-devops-extension-sdk"
import { IWorkItemFormService, WorkItemTrackingServiceIds, WorkItemOptions } from "azure-devops-extension-api/WorkItemTracking"

import "./RestRequestButton.scss"

import { Button } from "azure-devops-ui/Button"

import { showRootComponent } from "../../Common"

class RESTRequestButton extends Component<{}, { buttonText: string, buttonIcon: string, statusColor: string, message: string | undefined }> {

    constructor(props: {}) {
        super(props)
        this.state = {
            buttonText: "default text",
            buttonIcon: "CircleRing",
            statusColor: "",
            message: "Click the button to send a HTTP request"
        }
    }

    public componentDidMount() {
        SDK.init({})
            .then( () => {
                this.setState({
                    buttonText: SDK.getConfiguration().witInputs["ButtonTitle"]
                })
            })
    }

    public render(): JSX.Element {
        return (
            <Button
                text={this.state.buttonText}
                tooltipProps={{
                    text: this.state.message,
                    delayMs: 500
                }}
                iconProps={{
                    iconName: this.state.buttonIcon,
                    style: {color: this.state.statusColor}
                }}
                onClick={() => this.clickEvent()}
            />
        )
    }

    private async clickEvent() {
        const fields : Array<string> = SDK.getConfiguration().witInputs["Fields"].split(",")
        const endpoint: string = SDK.getConfiguration().witInputs["Endpoint"]

        this.setState({
            buttonIcon: "ProgressRingDots",
            statusColor: "",
            message: "Sending request..."
        })

        const options = new Options()
        const workItemFormService = await SDK.getService<IWorkItemFormService>(
            WorkItemTrackingServiceIds.WorkItemFormService
        )

        const fieldValues : Promise<{[fieldName: string]: Object}> = workItemFormService.getFieldValues(fields, options)
        fieldValues
            .then( data => {
                fetch(this.buildUri(endpoint, data), this.buildConfiguration(data))
                    .then(
                        (response) => {
                            if (response.status >= 200 && response.status < 300)
                                this.setState({
                                    buttonIcon: "SkypeCircleCheck",
                                    statusColor: "#55a362",
                                })
                            else if (
                                (response.status >= 300 && response.status < 400) ||
                                (response.status >= 100 && response.status < 200)
                            )
                                this.setState({
                                    buttonIcon: "AlertSolid",
                                    statusColor: "#ffb900",
                                })
                            else
                                this.setState({
                                    buttonIcon: "StatusErrorFull",
                                    statusColor: "#e81123",
                                })

                            this.setState({
                                message: response.statusText
                            })
                        },
                        (error: Error) => this.setState({
                            buttonIcon: "StatusErrorFull",
                            statusColor: "#e81123",
                            message: error.stack
                        })
                    )
            })
    }

    private buildConfiguration(body: object) : RequestInit {
        let requestConfig: RequestInit =  new RequestConfig();

        const method: string = SDK.getConfiguration().witInputs["Method"]
        if (method != null && method != undefined)
            requestConfig.method = SDK.getConfiguration().witInputs["Method"]

        const mode: string = SDK.getConfiguration().witInputs["Mode"]
        if (mode != null && mode != undefined)
            requestConfig.mode = SDK.getConfiguration().witInputs["Mode"]

        const cache: string = SDK.getConfiguration().witInputs["Cache"]
        if (cache != null && cache != undefined)
            requestConfig.cache = SDK.getConfiguration().witInputs["Cache"]

        const credentials: string = SDK.getConfiguration().witInputs["Credentials"]
        if (credentials != null && credentials != undefined)
            requestConfig.credentials = SDK.getConfiguration().witInputs["Credentials"]
        
        const redirect: string = SDK.getConfiguration().witInputs["Redirect"]
        if (redirect != null && redirect != undefined)
            requestConfig.redirect = SDK.getConfiguration().witInputs["Redirect"]

        const referrerPolicy: string = SDK.getConfiguration().witInputs["ReferrerPolicy"]
        if (referrerPolicy != null && referrerPolicy != undefined)
            requestConfig.referrerPolicy = SDK.getConfiguration().witInputs["ReferrerPolicy"]

        requestConfig.headers = new Headers();
        requestConfig.headers.append("Content-Type", "application/json")

        const authorization: string = SDK.getConfiguration().witInputs["Authorization"]
        if (authorization != null && authorization != undefined)
            requestConfig.headers.append("Authorization", SDK.getConfiguration().witInputs["Authorization"])

        if (
            requestConfig.method == "PUT" ||
            requestConfig.method == "POST" ||
            requestConfig.method == "PATCH"
        )
            requestConfig.body = JSON.stringify(body)

        return requestConfig
    }

    private buildUri(endpoint: string, body: object) : string {
        let getParams: string = ""

        const method: string = SDK.getConfiguration().witInputs["Method"]
        switch(method) {
            case null:
            case undefined:
            case "GET":
            case "DELETE":
            case "TRACE":
            case "OPTIONS":
            case "HEAD":
                getParams = Object.keys(body).map(key => key + '=' + body[key as keyof typeof body]).join('&')
                break
        }

        if(endpoint.includes('?'))
            return `${endpoint}&${getParams}`
        else
            return `${endpoint}?${getParams}`
    }
}

class Options implements WorkItemOptions { returnOriginalValue: boolean = true }
class RequestConfig implements RequestInit { }

export default RESTRequestButton
showRootComponent(<RESTRequestButton />)