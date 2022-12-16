import React, { Component } from 'react'
import * as SDK from "azure-devops-extension-sdk"
import { IWorkItemFormService, WorkItemTrackingServiceIds, WorkItemOptions } from "azure-devops-extension-api/WorkItemTracking"

import "./RestRequestButton.scss"

import { Button } from "azure-devops-ui/Button"

import { showRootComponent } from "../../Common"

class RESTRequestButton extends Component<{}, { buttonText: string, buttonIcon: string, statusColor: string, message: string | undefined, responseBody: string | undefined}> {

    constructor(props: {}) {
        super(props)
        this.state = {
            buttonText: "default text",
            buttonIcon: "CircleRing",
            statusColor: "",
            message: "Click the button to send a HTTP request",
            responseBody: ""
        }
    }

    public componentDidMount() {
        SDK.init()
        .then( () => {
            SDK.register(SDK.getContributionId(), () => {
                return {
                    
                }
            })
        })

        SDK.ready().then(
            () => {
                SDK.notifyLoadSucceeded()
                this.setState({
                    buttonText: SDK.getConfiguration().witInputs["ButtonTitle"]
                })
                SDK.resize()
            }
        )
    }

    public render(): JSX.Element {
        return (
            <div className='buttonContainer'>
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
                    className="button"
                />
                <pre className="resultbox depth-4 padding-4 font-size-xs custom-scrollbar">
                    {this.state.responseBody}
                </pre>
            </div>
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
            .then( async data => {

                // set Sender

                if (SDK.getConfiguration().witInputs["CustomSender"] != null && SDK.getConfiguration().witInputs["CustomSender"] != undefined && SDK.getConfiguration().witInputs["CustomSender"] != "")
                    data["Sender"] = SDK.getConfiguration().witInputs["CustomSender"]
                else
                    data["Sender"] = "WorkItemRESTRequestButton"

                // set user data

                if (SDK.getConfiguration().witInputs["SendUser"] != "false" && SDK.getConfiguration().witInputs["SendUser"] != false) {
                    data["User.Id"] = SDK.getUser().id
                    data["User.Name"] = SDK.getUser().name
                    data["User.DisplayName"] = SDK.getUser().displayName
                    data["User.Descriptor"] = SDK.getUser().descriptor
                    data["User.ImageURL"] = SDK.getUser().imageUrl
                }

                // send request

                fetch(this.buildUri(endpoint, data), await this.buildConfiguration(data))
                    .then(
                        async (response) => {
                            if (response.status >= 200 && response.status < 300)
                                this.setState({
                                    buttonIcon: "SkypeCircleCheck",
                                    statusColor: "#55a362"
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
                                message: `${response.status} - ${response.statusText}`
                            })

                            if (response.body !== null){
                                let responseText: string = await response.text()

                                try {
                                    responseText = JSON.stringify(JSON.parse(responseText), null, 2); 
                                } catch (e) {}

                                this.setState({
                                    responseBody: SDK.getConfiguration().witInputs["ShowResponseBody"] != "false" ? responseText : ""
                                })
                            }
                        },
                        (error: Error) => this.setState({
                            buttonIcon: "StatusErrorFull",
                            statusColor: "#e81123",
                            message: "error",
                            responseBody: SDK.getConfiguration().witInputs["ShowResponseBody"] != "false" ? error.stack : ""
                        })
                    )
                    .then(
                        () => SDK.resize()
                    )
            })
    }

    private async buildConfiguration(body: object) : Promise<RequestInit> {
        let requestConfig: RequestInit =  new RequestConfig();

        const method: string = SDK.getConfiguration().witInputs["Method"]
        if (method != null && method != undefined)
            requestConfig.method = method

        const mode: string = SDK.getConfiguration().witInputs["Mode"]
        if (mode != null && mode != undefined)
            requestConfig.mode = mode as RequestMode

        const cache: string = SDK.getConfiguration().witInputs["Cache"]
        if (cache != null && cache != undefined)
            requestConfig.cache = cache as RequestCache

        const credentials: string = SDK.getConfiguration().witInputs["Credentials"]
        if (credentials != null && credentials != undefined)
            requestConfig.credentials = credentials as RequestCredentials
        
        const redirect: string = SDK.getConfiguration().witInputs["Redirect"]
        if (redirect != null && redirect != undefined)
            requestConfig.redirect = redirect as RequestRedirect

        const referrerPolicy: string = SDK.getConfiguration().witInputs["ReferrerPolicy"]
        if (referrerPolicy != null && referrerPolicy != undefined)
            requestConfig.referrerPolicy = referrerPolicy as ReferrerPolicy

        requestConfig.headers = new Headers();
        requestConfig.headers.append("Content-Type", "application/json")

        const authorization: string = SDK.getConfiguration().witInputs["Authorization"]
        if (authorization != null && authorization != undefined)
            requestConfig.headers.append("Authorization", authorization)
        else
            requestConfig.headers.append("Authorization", `Bearer ${await SDK.getAppToken()}`)

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