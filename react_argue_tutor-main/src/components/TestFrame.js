import React from "react";

import {ready} from "../static/javascript/ArgueTutorEn";

import {Evaluation} from "./Evaluation";
import {Chat} from "./Chat";

class TestFrame extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            chatGPT: false,
            showPrivacy: true,
            showTutor: false
        };

        /**
         * Startup of the Chatbot
         */
        // todo create method for code verification
        ready(() => {
            // The following is meant for the login:
            let userName = "";
            // while (!(new RegExp('[a-zA-Z0-9\b]{4}-rdexp$')).test(userName)) {
            //     userName = prompt("Please enter your code :");
            // }
            // showPrivacy()
        });
    }


    chatGPT = async () => {
        // if active reset to predefined bot (red)
        if (this.state.chatGPTColor) {
            document.documentElement.style.setProperty("--main-color", "#b51f1f")
            // show instructions about using normal bot
        } else {
            document.documentElement.style.setProperty("--main-color", "#35BC55")
            // show instructions about using chatgpt bot
        }
        await this.setState({chatGPTColor: !this.state.chatGPTColor})
    }



    render() {
        // render privacy window
        if (this.state.showPrivacy) return (
            <div className={"chatbot"} id="privacy">
                <h3>Declaration of consent</h3>
                <p>Please read the consent form carefully.</p>
                <p>
                    I consent that the content of my messages with the chatbot will be  sent to university
                    servers for the purpose of the speech processing. I also agree that my anonymize data
                    may be used for scientific purposes. I am aware that I can revoke my consent at any time.
                </p>
                <p>
                    We assure full anonymity - an allocation of the collected data points to individual participants is not possible.
                </p>
                <p>
                    If you have any questions about the use of your data, you can contact the organisers of the
                    survey at the following contact details:
                </p>
                <p>
                    <a href="mailto:thiemo.wambsganss@epfl.ch">thiemo.wambsganss@epfl.ch</a>
                </p>
                <p>
                    <button type="button" id="privacy-accept" className="button button-primary"
                            onClick={() => {// hide privacy and show introduction screen
                                this.setState({showPrivacy: false, showTutor: true})}}>
                        I consent.
                    </button>
                </p>
            </div>)
        // render introduction screen
        else if (this.state.showTutor) return (
            <div className={"chatbot"} id={"tutor"}>
                <h3>Choose the chatbot modality</h3>
                <button type={"button"} className={"button button-primary"}
                        onClick={() => this.setState({showTutor: false, chatGPT: false})}>
                    Static
                </button>
                <button type={"button"} className={"button button-sec"}
                        onClick={() => this.setState({showTutor: false, chatGPT: true})}>
                    Dynamic
                </button>

            </div>
        )
        // render the main chatbot
        else return (
            <div>
                <div className={"columns"}>
                    <Chat chatGPT={this.state.chatGPT}/>
                    <Evaluation chatGPT={this.state.chatGPT}/>
                </div>
            </div>
        );
    }
}

export {TestFrame}