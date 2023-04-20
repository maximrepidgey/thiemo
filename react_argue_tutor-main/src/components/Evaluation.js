import {showDetail} from "../static/javascript/ArgueTutorEn";
import {ClapSpinner} from "react-spinners-kit";
import React from "react";
import Swal from "sweetalert";

import {
    CHATBOT_URL,
    computeDashboard,
    getTime,
    highlightKeyword,
} from "../static/javascript/ArgueTutorEn";

import {showChat, hideEssayField} from "../static/javascript/hideShow"
import {DashboardDynamic} from "./DashboardDynamic";
import {DashboardStatic} from "./DashboardStatic";


class Evaluation extends React.Component {

    componentDidMount() {
        const that = this;

        /**
         * Switches to the essay-writing interface
         */
        window.displayELEA = function () {
            that.showEssayField(false);
        }

        /**
         * Highlights the 'keyWord' appearances in the text
         *
         * @param keyWord
         *          keyword to highlight
         */
        window.highlightTopKeywordsWindow = function (keyWord) {
            document.getElementById('userDashboardText').innerHTML = highlightKeyword(that.state.dashboardText, keyWord);

            that.scrollUpDashboard();
        }
    }

    componentWillUnmount() {
        window.displayELEA = undefined;
        window.highlightTopKeywordsWindow = undefined;
    }

    constructor(props) {
        super(props);
        this.state = {
            topKeywords: [],
            dashboardText: '',
            ascPolSentences: [[]],
            ascSubSentences: [[]],
            dynamic: props.dynamic,
            dashboardIsComputed: false,
            showDashboard: false,
        };
    }

    /**
     * Displays the essay writing interface
     *
     * @param isDbComputed
     *          whether dashboard is computed or not
     */
    showEssayField = (isDbComputed) => {
        document.getElementById("button-eval").disabled = false;
        document.getElementById("close-essay-field-button").disabled = false;

        document.getElementById("close-dashboard-button").click();

        document.getElementById("show-dashboard-button").style.display = 'none';
        document.getElementById("close-essay-field-button").style.display = '';
        document.getElementById("ELEAIframeTemplate").style.display = 'inline-block';

        document.getElementById("open-essay-page").style.display = 'none'

        let keywords = document.getElementsByClassName("keywords");
        for (let i = 0; i < keywords.length; i++) {
            keywords[i].style.display = "block";
        }
        this.setState({dashboardIsComputed: isDbComputed});
    }

    /**
     * Scrolls to the top of the essay displayed in the dashboard
     */
    scrollUpDashboard = () => {
        let options = {
            top: 90,
            left: 0,
            behavior: 'smooth'
        };
        document.getElementById("dashboard").scroll(options);
    }




    render() {

        /**
         * Shows the Dashboard after already having evaluated the essay
         *
         * @param text Essay text
         */
        const showDashboardStats = (text) => {
            let characterCount = document.getElementById("characterCountDB");
            let wordCount = document.getElementById("wordCountDashboard");
            let sentenceCount = document.getElementById("sentenceCountDB");
            let paragraphCount = document.getElementById("paragraphCountDB");
            let readingTime = document.getElementById("readingTimeDB");
            let topKeywords = document.getElementById("topKeywordsDB");

            this.computeEssayStats(characterCount, text, wordCount, sentenceCount, paragraphCount, readingTime, topKeywords);
        }


        /**
         * Shows the dashboard
         *      - only callable once the dashboard has been computed and the user has returned to the chat (with the button in the header bar)
         */
        const showDashboardButtonClick = () => {
            document.getElementById("show-dashboard-button").style.display = 'none';
            document.getElementById("close-dashboard-button").style.display = '';
            document.getElementById("dashboard").style.display = 'inline-block';
        }


        /**
         * Handles close Dashboard button click
         */
        const closeDashboardButtonClick = () => {
            document.getElementById("dashboard").style.display = 'none';
            document.getElementById("open-essay-page").style.display = 'none';
            document.getElementById("close-dashboard-button").style.display = 'none';

            if (this.state.dashboardIsComputed) {
                document.getElementById("show-dashboard-button").style.display = '';
            }
        }


        /**
         * handles close essay button click
         */
        const closeEssayButtonClick = () => {
            hideEssayField();

            if (this.state.dashboardIsComputed) {
                showDashboardButtonClick();
                document.getElementById("open-essay-page").style.display = '';
            } else {
                showChat();
            }
        }


        /**
         * adds restartfunctionality to the reload button
         */
        const addOnClickToReloadPage = () => {
            document.getElementById("reload-page").addEventListener('click',
                () => window.location.reload());
        }

        /**
         * Sends evaluation request to the backend and then displays the corresponding Dashboard with the results
         */
            // todo create evaluation method for chatGPT
        const evaluationChatSuggest = () => {
                let submittedText = document.getElementById("evalution_textarea").value;

                if (submittedText.trim().length === 0) {
                    Swal({
                        title: 'Empty text!',
                        text: 'Please write a text about 200 words',
                        icon: 'error',
                        confirmButtonText: 'Next',
                        confirmButtonColor: '#00762C'
                    })
                    return;
                }


                document.getElementById("loadingEvaluationAnimation").style.display = "";
                document.getElementById("close-essay-field-button").disabled = true;
                document.getElementById("button-eval").disabled = true;

                let _data = {
                    text: submittedText
                }

                // Used to signal to the user if there is a massive evaluation delay
                const timeout = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        reject(new Error('Request timed out'));
                    }, 30000); // Timeout after 30 seconds
                });
                // use race method in order to check what happens first, response from the bot or timeout
                Promise.race([fetch(CHATBOT_URL + "/evaluate", {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json;charset=utf-8'
                        },
                        body: JSON.stringify(_data)
                    }), timeout]
                ).then(response => response.json()
                ).then(data => {

                    let subjectivity = data.subjectivity;
                    let polarity = data.polarity;
                    let summary = data.summary;
                    let text = data.text;
                    let sent_polarities = data.pol_per_sentence;
                    let sent_subjectivities = data.sub_per_sentence;
                    let emotions = data.emotions;

                    for (let i = 0; i < emotions.length; i++) {
                        const score = (emotions[i].score * 100).toFixed(2);
                        document.getElementById(emotions[i].label).value = score;
                        document.getElementById(emotions[i].label).title = "On a scale from not at all appropriate (0%) to very appropriate (100%), this text is: " + score + "%";
                    }
                    let adaptedText = text.replaceAll("\\n", "\n");

                    let sentences = text.split(/[.!?]+/g)

                    const subj = subjectivity * 100;
                    const pol = ((polarity / 2.0) + 0.5) * 100;
                    document.getElementById("subjectivityBar").value = subj;
                    document.getElementById("subjectivityBar").title = "On a scale from very objective (0%) to very subjective (100%), this text is: " + subj.toFixed(2) + "%";
                    document.getElementById("polarityBar").value = pol;
                    document.getElementById("polarityBar").title = "On a scale from very negative (0%) to very positive (100%), this text is: " + pol.toFixed(2) + "%";
                    document.getElementById("summary").innerText = summary;

                    closeEssayButtonClick();
                    this.setState({
                        dashboardIsComputed: true,
                        dashboardText: adaptedText,
                        ascPolSentences: sent_polarities,
                        ascSubSentences: sent_subjectivities
                    });
                    showDashboardStats(adaptedText);
                    computeDashboard(subjectivity, polarity, adaptedText, sentences, addOnClickToReloadPage, this.state);

                    document.getElementById("loadingEvaluationAnimation").style.display = "none";

                    //     timeout and error handling
                }).catch(() => {
                    // todo handle error
                    document.getElementById("loadingEvaluationAnimation").style.display = "none";
                    closeEssayButtonClick();
                    closeDashboardButtonClick();
                    this.setState({dashboardIsComputed: false})
                });
            }

        // todo use state for showing buttons, and show the dashboard with the message that the evaluation is not done yet
        // or simply

        // todo check if rerendering the dashboard will save the info
        // pass the info to the dashboard components as obj prop, compute everything here
        return (
            <div className={"column"}>
                <div className="chatbot">
                    <div className="header">
                        <div className="header-button-bar">
                        {this.state.dashboardIsComputed ? // checks if the evaluation was performed, if so show the dashboard
                            this.state.showDashboard ? // used to show the close and open buttons for dashboard
                                <button className="header-button" id="close-dashboard-button"
                                    onClick={() => this.setState({showDashboard: false})}>
                                    <i className="fa fa-times"/>
                                    <span>Dashboard</span>
                                </button>
                                :
                                <button className="header-button" id="show-dashboard-button"
                                        onClick={() => this.setState({showDashboard: true})}>
                                    <i className="fas fa-chart-pie"/>
                                    <span>Dashboard</span>
                                </button>
                            : <React.Fragment/>
                        }
                        </div>
                    </div>

                    {this.state.showDashboard ? // renders evaluation dashboard otherwise renders the text box
                        this.state.dynamic ? <DashboardDynamic/> : <DashboardStatic/>
                    :
                        <div id="ELEAIframeTemplate">
                            <form method="post">
                                <label style={{display: "block", fontSize: "x-large", marginBottom: "0.5rem", marginTop: "0.5rem"}}>
                                    Evaluation Text box
                                </label>
                                <div className="w3-display-left">
                                    <div className="ehi-wordcount-container">
                                        <label htmlFor="evalution_textarea"/>

                                        <div id={"loadingEvaluationAnimation"} style={{display: "none"}}>
                                            <ClapSpinner size={40} color="#686769" loading={true}/>
                                        </div>
                                        <textarea spellCheck={true} className="text" rows={25} cols={25} name="evaluationText"
                                                  id="evalution_textarea" placeholder="Enter your text here..." defaultValue={""}/>
                                    </div>
                                </div>
                            </form>
                            <button className="buttonEval" id="button-eval" onClick={evaluationChatSuggest}>
                                Evaluate the text
                            </button>
                        </div>
                    }


                </div>
            </div>
        )
    }
}

export {Evaluation}