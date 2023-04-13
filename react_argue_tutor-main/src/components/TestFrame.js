import React from "react";
import Swal from 'sweetalert';
import {ClapSpinner} from 'react-spinners-kit';

import {
    initializeBot,
    ready,
} from "../static/javascript/ArgueTutorEn";

import {showPrivacy} from "../static/javascript/hideShow"
import {Evaluation} from "./Evaluation";
import {Chat} from "./Chat";

class TestFrame extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            chatGPT: false,
            // showPrivacy: "",
            // showTutor: "none",
            // showChat: "none",
            showPrivacy: true,
            showTutor: false,
            showChat: false
        };

        /**
         * Startup of the Chatbot
         */
        ready(() => {
            // The following is meant for the login:
            let userName = "";
            // while (!(new RegExp('[a-zA-Z0-9\b]{4}-rdexp$')).test(userName)) {
            //     userName = prompt("Please enter your code :");
            // }

            showPrivacy()
        });
    }

    /**
     * hide privacy window
     */
    hidePrivacy() {
        this.setState({showPrivacy: false, showTutor: true})
    }

    /**
     * Hides the introduction page of the tutor. User selects which type of tutor.
     * @param gpt
     */
    hideTutor(gpt) {
        // document.querySelectorAll("#open-feedback-button, #open-help-button, #open-Detail-button, #chatgpt")
        //     .forEach(e => e.style.display = '');
        // document.getElementById("scrollbox").style.display = '';
        // document.getElementById("userInput").style.display = '';
        this.setState({showChat: true, showTutor: false, chatGPT: gpt})
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
        initializeBot(this.updateChatBoxContent, this.state.chatGPTColor)
    }



    render() {

        if (this.state.showPrivacy) return (<div className={"chatbot"} id="privacy">
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
                        onClick={() => {
                            this.hidePrivacy();
                            // initializeBot(this.updateChatBoxContent, this.state.chatGPTColor);}}>
                            initializeBot(this.state.chatGPTColor);}}>
                    I consent.
                </button>
            </p>
        </div>)
        else if (this.state.showTutor) return (<div className={"chatbot"} id={"tutor"}>
            <h3>Choose the chatbot modality</h3>
            <button type={"button"} className={"button button-primary"}
                    onClick={() => this.hideTutor(false)}>
                Static
            </button>
            <button type={"button"} className={"button button-sec"}
                    onClick={() => this.hideTutor(true)}>
                Dynamic
            </button>

        </div>)
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