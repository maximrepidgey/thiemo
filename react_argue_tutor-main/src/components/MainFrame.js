import React from "react";

import {ready} from "../static/javascript/ArgueTutorEn";

import {Evaluation} from "./Evaluation";
import {Chat} from "./Chat";

class MainFrame extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            chatGPT: true,
            showPrivacy: true,
            showTutor: false,
            showEvaluationSelection: false,
            evaluationDynamic: true,
            language: "",
        };

        /**
         * Startup of the Chatbot
         */
        ready(() => {
            // The following is meant for the login:
            let userName = "";
            /*while (!(new RegExp('[a-zA-Z0-9\b]{4}-rdexp$')).test(userName)) {
                userName = prompt("Please enter your code :");
            }*/
            // todo assign tutor basing on the code
        });
    }


    render() {
        //first thing is to select the language
        if (this.state.language.length === 0) return (
            <div className={"chatbot"} id={"tutor"}>
                <h3>Select you language</h3>
                Wählen Sie die Sprache <br/>
                <button type={"button"} className={"button button-primary"}
                        onClick={() => this.setState({language: "en"})}>
                    English
                </button>
                <button type={"button"} className={"button button-sec"}
                        onClick={() => this.setState({language: "de"})}>
                    Deutsch
                </button>
            </div>
        )
        // render privacy window
        else if (this.state.showPrivacy){
            if (this.state.language === "en") return (
                <div className={"chatbot"} id="privacy" style={{paddingTop: "30vh"}}>
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
                    <button type="button" id="privacy-accept" className="button button-primary"
                            onClick={() => {// hide privacy and show introduction screen
                                this.setState({showPrivacy: false, showTutor: true})}}>
                        I consent.
                    </button>
                </div>
            ) else if (this.state.language === "de") return (
                <div className={"chatbot"} id="privacy" style={{paddingTop: "30vh"}}>
                    <h3>Einverständniserklärung</h3>
                    <p>Bitte lesen Sie die Einwilligungserklärung sorgfältig durch.</p>
                    <p>
                        Ich bin damit einverstanden, dass der Inhalt meiner Nachrichten an den Chatbot zum Zweck der
                        Sprachverarbeitung an Universitätsserver gesendet wird. Ich bin außerdem damit
                        einverstanden, dass meine anonymisierten Daten für wissenschaftliche Zwecke genutzt werden
                        können. Mir ist bekannt, dass ich meine Einwilligung jederzeit widerrufen kann.
                    </p>
                    <p>
                        Wir versichern volle Anonymität - eine Zuordnung der gesammelten Datenpunkte zu einzelnen
                        Teilnehmern ist nicht möglich.
                    </p>
                    <p>
                        Wenn Sie Fragen zur Verwendung Ihrer Daten haben, können Sie sich an die Organisatoren der
                        Umfrage unter den folgenden Kontaktdaten wenden:
                    </p>
                    <p>
                        <a href="mailto:thiemo.wambsganss@epfl.ch">thiemo.wambsganss@epfl.ch</a>
                    </p>
                    <button type="button" id="privacy-accept" className="button button-primary"
                        onClick={() => {// hide privacy and show introduction screen
                        this.setState({showPrivacy: false, showTutor: true})}}>
                        Ich bin damit einverstanden.
                    </button>
                </div>
            )
        }
        // render introduction screen
        /*else if (this.state.showTutor) return (
            <div className={"chatbot"} id={"tutor"}>
                <h3>Choose the chatbot modality</h3>
                <p>Choose the chatbot modality that you have been assigned</p>
                <button type={"button"} className={"button button-primary"}
                        onClick={() => this.setState({showTutor: false, chatGPT: false, showEvaluationSelection: true})}>
                    Static
                </button>
                <button type={"button"} className={"button button-sec"}
                        onClick={() => this.setState({showTutor: false, chatGPT: true, showEvaluationSelection: true})}>
                    Dynamic
                </button>

            </div>
        )
        else if (this.state.showEvaluationSelection) return (
            <div className={"chatbot"} id={"tutor"}>
                <h3>Choose the evaluation method</h3>
                Choose the evaluation that you have been assigned <br/>
                If you have made a mistake, just reload the page <br/>
                <button type={"button"} className={"button button-primary"}
                        onClick={() => this.setState({showEvaluationSelection: false, evaluationDynamic: false})}>
                    Static
                </button>
                <button type={"button"} className={"button button-sec"}
                        onClick={() => this.setState({showEvaluationSelection: false, evaluationDynamic: true})}>
                    Dynamic
                </button>
            </div>
        )*/
        // render the main chatbot
        else return (
            <div>
                <div className={"columns"}>
                    <Chat chatGPT={this.state.chatGPT} language={this.state.language}/>
                    <Evaluation dynamic={this.state.evaluationDynamic} language={this.state.language}/>
                </div>
            </div>
        );
    }
}

export {MainFrame}