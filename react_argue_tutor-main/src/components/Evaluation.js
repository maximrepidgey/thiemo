import {ClapSpinner} from "react-spinners-kit";
import React from "react";
import Swal from "sweetalert";

import {
    computeDashboard, computeEssayStats, getTopSentences, CHATBOT_URL,
    highlightKeyword, highlightTopNPolaritySentences, highlightTopNSubjectivitySentences,
} from "../static/javascript/ArgueTutorEn";

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

    componentDidUpdate(prevProps, prevState, snapshot) {
        document.getElementById("button-eval").disabled = this.state.loading;
    }


    componentWillUnmount() {
        window.displayELEA = undefined;
        window.highlightTopKeywordsWindow = undefined;
    }

    constructor(props) {
        super(props);
        this.state = {
            dashboardText: '',
            dynamic: props.dynamic,
            dashboardIsComputed: false,
            showDashboard: false,
            text: "",
            loading: false,
            ascPolSentences: [[]],
            ascSubSentences: [[]],
            language: props.language,
            dynamicProps: {}
        };
    }

    /**
     * Displays the essay writing interface
     *
     * @param isDbComputed
     *          whether dashboard is computed or not
     */
    showEssayField = (isDbComputed) => {
        this.setState({dashboardIsComputed: isDbComputed});
    }


    /**
     * Scrolls to the top of the essay displayed in the dashboard
     */
    scrollUpDashboard = () => {
        let options = {top: 90, left: 0, behavior: 'smooth'};
        document.getElementById("dashboard-static").scroll(options);
    }


    /**
     * Sends evaluation request to the backend and then displays the corresponding Dashboard with the results
     */
    evaluationChatSuggest = () => {
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
        // document.getElementById("button-eval").disabled = true;
        this.setState({loading: true, text: submittedText}, () => {

            if (this.state.dynamic) {
                this.dynamicEvaluation(submittedText)
            } else {
                this.staticEvaluation(submittedText)
            }
        })
    }


    dynamicEvaluation = (text) => {
        // todo check for timeout
        const timeout = new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new Error('Request timed out'));
            }, 4*60*1000); // Timeout after 4 mins
        });
        //todo change to production
        Promise.race([fetch(CHATBOT_URL + "/evaluate", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({text: text, language: this.state.language})
            }), timeout]
        ).then(response => response.json()
        ).then(data => {
            console.log(data)
            let dynamicData = {
                readability: data.readability,
                structure: data.structure,
                objectivity: data.objectivity,
                conciseness: data.conciseness,
                general: data.general
            }

            this.setState({dynamicProps: dynamicData}, () => {
                this.setState({loading: false, showDashboard: true, dashboardIsComputed: true})
            })


        }).catch(() => {
            // todo handle error, pop up a message
            this.setState({dashboardIsComputed: false, loading: false}, () => {
                Swal({
                    title: 'Error!',
                    text: 'an Error have occurred with your evalaution, please try again',
                    icon: 'error',
                    confirmButtonText: 'Next',
                    confirmButtonColor: '#00762C'
                });
            })
        });
    }


    staticEvaluation = (text) => {
        // Used to signal to the user if there is a massive evaluation delay
        const timeout = new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new Error('Request timed out'));
            }, 30000); // Timeout after 30 seconds
        });
        // use race method in order to check what happens first, response from the bot or timeout
        Promise.race([fetch(CHATBOT_URL + "/texttransfer", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({text: text, language: this.state.language})
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

            console.log("checkpoint 1")
            this.setState({
                dashboardText: adaptedText,
                ascPolSentences: sent_polarities,
                ascSubSentences: sent_subjectivities
            });
            console.log("checkpoint 2")

            let topKeywords = computeEssayStats(adaptedText);
            console.log("checkpoint 3")

            computeDashboard(subjectivity, polarity, adaptedText, sentences, this.addOnClickToReloadPage, topKeywords);
            console.log("checkpoint 4")

            this.setState({loading: false, showDashboard: true, dashboardIsComputed: true})

            //     timeout and error handling
        }).catch(() => {
            // todo handle error, pop up a message
            this.setState({dashboardIsComputed: false, loading: false}, () => {
                Swal({
                    title: 'Error!',
                    text: 'an Error have occured with your evalaution, please try again',
                    icon: 'error',
                    confirmButtonText: 'Next',
                    confirmButtonColor: '#00762C'
                });
            })
        });

    }

    /**
     * adds restart functionality to the reload button
     */
    addOnClickToReloadPage = () => {
        document.getElementById("reload-page").addEventListener('click',
            () =>  window.location.reload());
    }


    /**
     * Highlights the most subjective / objective sentences in the text
     */
    showSubjectivitySources = () => {
        let subjectivity = document.getElementById("subjectivityBar").value;
        let sentencesToHighlight = getTopSentences(subjectivity, this.state.ascSubSentences);

        document.getElementById('userDashboardText').innerHTML = highlightTopNSubjectivitySentences(this.state.dashboardText, sentencesToHighlight, sentencesToHighlight.length);
        this.scrollUpDashboard();
    }

    /**
     * Highlights the most polar sentences in the text
     */
    showPolaritySources = () => {
        let polarity = document.getElementById("polarityBar").value;
        let sentencesToHighlight = getTopSentences(polarity, this.state.ascPolSentences);

        document.getElementById('userDashboardText').innerHTML = highlightTopNPolaritySentences(this.state.dashboardText, sentencesToHighlight, sentencesToHighlight.length);
        this.scrollUpDashboard();
    }

    render() {
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

                    {/*dynamic dashboard is using proper react, therefore this is design is used to run properly the code. Ideally static evaluation should also become react*/}
                    {this.state.showDashboard && this.state.dashboardIsComputed && this.state.dynamic ? <DashboardDynamic {...this.state.dynamicProps} text={this.state.text} language={this.state.language}/> : <React.Fragment/>}

                    {/*use awful style reference to avoid unmounting of the component, static part must be rendered because
                    getElementById function requires element to be rendered*/}
                    <span style={{display: this.state.showDashboard && this.state.dashboardIsComputed? "": "none"}}>
                        {this.state.dynamic?  <React.Fragment/> :  <DashboardStatic showSubjectivitySources={this.showSubjectivitySources} showPolaritySources={this.showPolaritySources} text={this.state.text} language={this.state.language}/>}
                        {/*<DashboardDynamic text={this.state.text} style={{display: this.state.dynamic ? "": "none"}}/>*/}
                        {/*<DashboardStatic text={this.state.text}  style={{display: this.state.dynamic ? "none": ""}}/>*/}
                    </span>
                    <div id="ELEAIframeTemplate" style={{display: this.state.showDashboard && this.state.dashboardIsComputed? "none": "" }}>
                        <form method="post">
                            <label style={{display: "block", fontSize: "x-large", marginBottom: "0.5rem", marginTop: "0.5rem"}}>
                                Evaluation Text box
                            </label>
                            <div className="w3-display-left">
                                <div className="ehi-wordcount-container">
                                    <label htmlFor="evalution_textarea"/>

                                    {this.state.loading ?
                                    <div id={"loadingEvaluationAnimation"}>
                                        <ClapSpinner size={40} color="#686769" loading={true}/>
                                    </div> : null
                                    }
                                    <textarea spellCheck={true} className="text" rows={25} cols={25} name="evaluationText"
                                              id="evalution_textarea" placeholder="Enter your text here..." defaultValue={""}/>
                                </div>
                            </div>
                        </form>
                        <button className="buttonEval" id="button-eval" onClick={this.evaluationChatSuggest}>
                            Evaluate the text
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}

export {Evaluation}