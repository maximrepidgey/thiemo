import React, { useState } from 'react';
import {showDetail} from "../static/javascript/ArgueTutor";
import {
    CHATBOT_URL,
    computeDashboard,
    getTime,
    getTopSentences,
    highlightKeyword, highlightTopNPolaritySentences, highlightTopNSubjectivitySentences
} from "../static/javascript/ArgueTutorEn";
import {hideEssayField, showChat} from "../static/javascript/hideShow";
import Swal from "sweetalert";



class DashboardStatic extends React.Component{

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
            wasQuestion: false,
            dashboardIsComputed: false,
            topKeywords: [],
            dashboardText: '',
            ascPolSentences: [[]],
            ascSubSentences: [[]],
        };
    }


    /**
     * adds restart functionality to the reload button
     */
    addOnClickToReloadPage = () => {
        document.getElementById("reload-page").addEventListener('click',
            () =>  window.location.reload());
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

    /**
     * recomputes the essay stats
     */
    updateEssayStats = () => {
        let text = document.getElementById("evalution_textarea").value;
        let characterCount = document.getElementById("characterCount");
        let wordCount = document.getElementById("wordCount");
        let sentenceCount = document.getElementById("sentenceCount");
        let paragraphCount = document.getElementById("paragraphCount");
        let readingTime = document.getElementById("readingTime");
        let topKeywords = document.getElementById("topKeywords");

        this.computeEssayStats(characterCount, text, wordCount, sentenceCount, paragraphCount, readingTime, topKeywords);

        let keywords = document.getElementsByClassName("keywords")
        for (let i = 0; i < keywords.length; i++) {
            keywords[i].style.display = "block";
        }
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
            this.setState({wasQuestion: false});
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


            this.setState({wasQuestion: false});

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
                let botHtml =
                    `<div class="message">
                    <div class="message-botname">WritingTutor</div>
                    <div class="botText">
                        <div class="avatar-wrapper">
                            <img class="avatar" alt="avatar">
                        </div>
                        <div class="data-wrapper">There was a mistake when evaluating your essay, I apologise. Please try again by clicking on the "Open text box" button above.</div>
                    </div>
                    <div class="message-time">` + getTime() + `</div>
                </div>
                `;
                this.setState({wasQuestion: true}, () => this.updateChatBoxContent(botHtml));
            });
        }

        /**
         * Highlights the most subjective / objective sentences in the text
         */
        const showSubjectivitySources = () => {
            let subjectivity = document.getElementById("subjectivityBar").value;
            let sentencesToHighlight = getTopSentences(subjectivity, this.state.ascSubSentences);

            document.getElementById('userDashboardText').innerHTML = highlightTopNSubjectivitySentences(this.state.dashboardText, sentencesToHighlight, sentencesToHighlight.length);
            this.scrollUpDashboard();
        }

        /**
         * Highlights the most polar sentences in the text
         */
        const showPolaritySources = () => {
            let polarity = document.getElementById("polarityBar").value;
            let sentencesToHighlight = getTopSentences(polarity, this.state.ascPolSentences);

            document.getElementById('userDashboardText').innerHTML = highlightTopNPolaritySentences(this.state.dashboardText, sentencesToHighlight, sentencesToHighlight.length);
            this.scrollUpDashboard();
        }

        const ratingsObjectivity = [
            {id: "s1", text: "Very objective"},
            {id: "s2", text: "Objective"},
            {id: "s3", text: "Neutral"},
            {id: "s4", text: "Subjective"},
            {id: "s5", text: "Very subjective"},
        ]

        const ratingsEmotions = [
            {id: "p1", text: "Very Negative"},
            {id: "p2", text: "Negative"},
            {id: "p3", text: "Neutral"},
            {id: "p4", text: "Positive"},
            {id: "p5", text: "Very Positive"},
        ]

        return (
            <div id="dashboard">
                <div className="col-md-12">
                    <div className="rounded border">
                        <div className="container-fluid text-center mt-3">
                            <h1 className="m-0" style={{borderBottomStyle: "solid", marginBottom: "15px!important"}}>
                                Dashboard
                            </h1>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <div className="p-2">
                                    {/* STRUCTURE-GRAPH */}
                                    <div className="container-fluid text-center" style={{fontSize: "1.5em", fontWeight: 600}}>
                                        Here is you text
                                    </div>
                                </div>
                            </div>
                            {/* Implementation of the text in the dashboard, including the wordcount table*/}
                            <div className="col-md-12 card" style={{maxWidth: "80%", marginLeft: "auto", marginRight: "auto"}}>
                                <div className="p-2 border p-4" id="userDashboardText"
                                    style={{marginTop: 10, marginBottom: 20, backgroundColor: "azure"}}/>
                            </div>
                        </div>
                        {/* Second section  */}
                        <div className="row">
                            <div className="col-md-12">
                                <div className="p-2">
                                    {/* Visual and written feedback */}
                                    <div className="container-fluid text-center">
                                        Do you have any questions about the analysis? (
                                        <a href="javascript:void(0);" onClick={() => {
                                            closeDashboardButtonClick();
                                            showDetail();
                                        }}>
                                            How was my text analysed?
                                        </a>
                                        )
                                    </div>
                                    <div className="row text-center" style={{height: "auto"}}>
                                        <div className="col-md-12 text-center my-5">
                                            {/* Evaluation section within the Dashboard */}
                                            <h1 style={{borderTopStyle: "solid"}}>
                                                Evaluation feedback
                                            </h1>
                                            <div className="container my-3" style={{alignItems: "flex-start"}}>
                                                <h4 className={"my-2"}>Generated summary</h4>
                                                <div id={"summary"}/>

                                                <h4 className="my-2"> Subjectivity/Objectivity </h4>
                                                <progress className={"progress"} id="subjectivityBar" max="100" value="90"
                                                          title={"On a scale from very objective (0%) to very subjective (100%), this text is: "}>
                                                </progress>
                                                <div className="row w-100 text-center mx-auto mt-2" style={{marginBottom: 15}}>
                                                    {ratingsObjectivity.map(({id, text})=> (
                                                        <div id={id} className="col-md-2 border mx-auto rating">{text}</div>
                                                    ))}
                                                </div>
                                                <a href={"javascript:void(0)"}
                                                   onClick={showSubjectivitySources}> Most influential sentences for the
                                                    Subjectivity decision?
                                                </a>

                                                <h4 className="my-2"> Polarity </h4>
                                                <progress className={"progress"} id="polarityBar" max="100" value="90"
                                                          title={"On a scale from very negative (0%) to very positive (100%), this text is: "}>
                                                </progress>
                                                <div className="row w-100 text-center mx-auto mt-2" style={{marginBottom: 20}}>
                                                    {ratingsEmotions.map(({id, text})=> (
                                                        <div id={id} className="col-md-2 border mx-auto rating">{text}</div>
                                                    ))}
                                                </div>
                                                <a href={"javascript:void(0)"} onClick={showPolaritySources}> Most influential sentences for the polarity decision? </a>

                                                <h4>Emotions</h4>
                                                {["Neutral", "Disgust", "Sadness", "Fear", "Anger", "Surprise", "Joy"].map((text) => (
                                                    <React.Fragment>
                                                        <progress className={"progress"} id={text.toLowerCase()} max="100" value="90"
                                                                  title={"On a scale from not applicable at all (0%) to very applicable (100%), this text is:"}
                                                                  style={{content:"hello"}}>
                                                        </progress>
                                                        <div className="progressbarText">{text}</div>
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                            {/* Feedback on the text */}
                                            <div className="container-fluid text-center cardtwo my-4">
                                                <div id="dashboard-h2 my-2" style={{fontSize: "x-large"}}>
                                                    Subjectivity/Objectivity{" "}
                                                </div>
                                                <div className="text-black-50" style={{fontSize: "large"}} id="writtenSubjectivity"/>
                                                <div id="dashboard-h2 my-2" style={{fontSize: "x-large"}}>
                                                    {" "}
                                                    Polarity{" "}
                                                </div>
                                                <div id="writtenPolarity" className="text-black-50" style={{fontSize: "large", marginBottom: 30}}/>
                                            </div>
                                            {/* Reload page function - getting back to the introduction.  */}
                                            <div className="container-fluid text-center">
                                                <div className="display-8">
                                                    {" "}
                                                    Contact {" "}
                                                    <a href="mailto:thiemo.wambsganss@epfl.ch">
                                                        thiemo.wambsganss@epfl.ch
                                                    </a>
                                                    , if you need any further help.
                                                </div>
                                                <button type={"button"} className="buttonTest" id="reload-page">
                                                {/*<button type={"button"} className="buttonTest" id="reload-page" onClick={refreshPage}>*/}
                                                    <span>Start again</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export {DashboardStatic}