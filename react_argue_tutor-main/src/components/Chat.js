import React from "react";
import Swal from 'sweetalert';

import {
    CHATBOT_URL,
    getTime,
} from "../static/javascript/ArgueTutorEn";

import {
    hideDetail,
    hideFeedback,
    hideHelp,
    showCloseFeedbackButton,
    showOpenFeedbackButton,
} from "../static/javascript/hideShow"

class Chat extends React.Component {

    /**
     * Handles injected code
     */
    componentDidMount() {
        const that = this; // used to trick JS avoiding recursive call (inherited from past)

        // Initializes chatbot, gets first response, and loads intro message
        if (this.state.chatGPT) {
            this.getResponse("StartGPT");
        } else {
            this.getResponse("Introduction");
        }


        /**
         * Handles Chatbot button clicks
         *
         * @param text
         *          Message for the backend
         */
        window.chatSuggest = function (text) {
            that.setState({wasQuestion: true},
                () => that.chatSuggestCall(text)
            );
        }


        /**
         * Displays Video with the given ID from YouTube inside the chat
         *
         * @param VideoID
         *          video id
         */
        window.playVideo = function (VideoID) {
            let htmlTemplateString = `
            <div class="data-wrapper">
                <p>
                    <iframe id="ytplayer" type="text/html" width="100%" height="360" src="TargetURL"
                            allow="autoplay"></iframe>
                </p>
            </div>`;

            that.setState({
                    wasQuestion: true,
                    scrollHeight: document.getElementById("scrollbox").scrollHeight
                },
                () => {
                    that.updateChatBoxContent(
                        Array.from(document.getElementsByClassName("message")).slice(-1)[0]
                        + (htmlTemplateString.replace("TargetURL", "https://www.youtube.com/embed/" + VideoID)))
                });
        }

        /**
         * Displays Website with the given url inside the chat
         *
         * @param url
         *          website url
         */
        window.displayWebsite = function (url) {
            // <iframe id="ytplayer" type="text/html" width="100%" height="700" src="TargetURL"
            let htmlWepPage = `
                    <div class="data-wrapper">
                        <p>
                           
                            <iframe id="ytplayer" type="text/html" width="100%" height="550" src="TargetURL"
                                allow="autoplay"></iframe>
                        </p>
                    </div>
                `;

            that.setState({
                    wasQuestion: false,
                    scrollHeight: document.getElementById("scrollbox").scrollHeight
                },
                () => that.updateChatBoxContent(
                    Array.from(document.getElementsByClassName("message")).slice(-1)[0]
                    + (htmlWepPage.replace("TargetURL", "https://" + url))));
        }
    }


    componentWillUnmount() {
        window.chatSuggest = undefined;
        window.playVideo = undefined;
        window.displayWebsite = undefined;
    }

    constructor(props) {
        super(props);
        this.state = {
            stringChatBotContent: '',
            chatBoxContent: {__html: ''},
            scrollHeight: 0,
            wasQuestion: false,
            chatGPTColor: false,
            chatGPT: props.chatGPT,
            IDKcounter: 0,
            evaluationRunning: false
        };
    }



    /**
     * Scrolls to the position indicated by 'scrollHeight' in the chatbox
     */
    scrollChatBox = () => {
        let options = {
            top: this.state.scrollHeight,
            left: 0,
            behavior: 'smooth'
        };
        document.getElementById("scrollbox").scroll(options);
    }

    /**
     * Removes the three dots indicating that the chatbot is typing
     *
     * @returns {string}
     *          returns the chatbox content after removing the "typing" messages
     */
    deletedTypingMessage = () => {
        return this.state.stringChatBotContent.replaceAll(`<div class="message typing"><div class="message-botname">WritingTutor</div><div class="botText"><div class="avatar-wrapper"><img class="avatar" src="/img/ArgueTutorClosed.png"></div><div class="data-wrapper"><img src="/img/typing3.gif"></div></div></div>`, "");
    }

    /**
     * Adds the given argument to the chatbox
     *
     * @param newContent
     *          content to be added to the chat
     */
    updateChatBoxContent = (newContent) => {
        let newValue;
        if (!this.state.wasQuestion) {
            newValue = this.deletedTypingMessage() + newContent.replace("[object HTMLDivElement]", "");
        } else {
            newValue = this.state.stringChatBotContent + newContent.replace("[object HTMLDivElement]", "");
        }

        // if a question was asked before, we scroll to the height of that question, otherwise to the height of the received new element
        this.setState({
                stringChatBotContent: newValue,
                chatBoxContent: {__html: newValue},

            },
            () => {
                let scrollHeight = this.state.wasQuestion
                    ? document.getElementById("scrollbox").scrollHeight - 200
                    : this.state.scrollHeight;
                this.setState({
                        wasQuestion: !this.state.wasQuestion,
                        scrollHeight: scrollHeight,
                    },
                    this.scrollChatBox)
            });
    }


    /**
     * get response from python chatterbot backend and update the chatbox with the received answer
     * @param text
     *          request of the user
     */
    getResponse(text) {
        fetch(CHATBOT_URL + "/getResponse",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({gpt: this.state.chatGPT, text: text})
            })
            .then(response => {
                return response.json()
            })
            .then(data => {
                let botReply = data.botReply;
                this.addBotMessage(botReply);
            });
    }


    /**
     * Adds chatbot message to the chatbox.
     *
     * @param text
     *          bot message
     */
    addBotMessage(text) {
        if (text === null) return;

        let botHtml =
            '<div class="message">' +
            '<div class="message-botname">WritingTutor</div>' +
            '<div class="botText">' +
            '<div class="avatar-wrapper">' +
            '<img alt="avatar" class="avatar" src="/img/ArgueTutor.png">' +
            '</div>' +
            '<div class="data-wrapper">' + text +'</div>' +
            '</div>' +
            '<div class="message-time">' + getTime() + '</div></div>';

        this.updateChatBoxContent(botHtml);

        document.getElementById("buttonInput").disabled = false;
        document.getElementById("textInput").disabled = false;
        document.getElementById("textInput").focus();
    }


    /**
     * Adds user message to the chatbox
     *
     * @param text
     *          user message
     */
    addUserMessage(text) {
        if (text === null) return;

        let userHtml;
        if (text.toString() === "Evaluation") {
            userHtml = '<div class="message"><p class="userText eval">' + text + '</p></div>';
        } else {
            userHtml = '<div class="message"><p class="userText">' + text + '</p></div>';
        }

        // to add typing message of the chatbot
        userHtml += '<div class="message typing"><div class="message-botname">WritingTutor</div><div class="botText"><div class="avatar-wrapper"><img class="avatar" src="/img/ArgueTutorClosed.png"></div><div class="data-wrapper"><img src="/img/typing3.gif"></div></div></div>';

        this.updateChatBoxContent(userHtml);
    }

    /**
     * Submits message to the backend
     *
     * @param text
     *          message to submit
     */
    submitMessage(text) {
        if (text.trim() === "") {
            return;
        }

        this.addUserMessage(text);
        document.getElementById("textInput").value = ""
        document.getElementById("buttonInput").disabled = true;
        document.getElementById("textInput").disabled = true;

        text = text.toLowerCase(); // convert input text to lowercase
        // get response from backend
        this.getResponse(text)
    }

    /**
     * handles chat suggest calls from user
     *
     * @param text
     *          user message
     */
    chatSuggestCall(text) {
        const elems = document.getElementsByClassName('chatSuggest');
        for (const elem of elems) {
            elem.disabled = true
        }

        document.getElementById("textInput").value = text;
        this.submitMessage(text);
    }


    render() {

        /**
         * Sends the question from the textInput to the backend
         */
        const sendText = () => {
            let text = document.getElementById("textInput").value;

            // added this, so that the scrollbox height is adjusted to the correct spot since the last one is still at the height of the
            // last question if we clicked on "textfeld öffnen"
            this.setState({wasQuestion: true},
                () => this.submitMessage(text))
        }

        /**
         * When the user hits enter (13), the typed question is sent to the backend
         *
         * @param event
         *          keyboard event
         */
        const keyUpTextInput = (event) => {
            if (event.which === 13) {
                sendText();
            }
        }


        /**
         * Hides the Chat interface
         */
        const hideChat = () => {
            document.getElementById("open-feedback-button").style.display = 'none';
            document.getElementById("open-Detail-button").style.display = 'none';
            document.getElementById("open-help-button").style.display = 'none';
            document.getElementById("scrollbox").style.display = 'none';
            document.getElementById("userInput").style.display = 'none';
        }


        /**
         * Handles help button click
         */
        const helpButtonClick = () => {
            hideChat();

            document.getElementById("close-help-button").style.display = '';
            document.getElementById("help").style.display = 'inline-block';
        }


        /**
         * handles detail button click (FAQ)
         */
        const detailButtonClick = () => {
            hideChat();

            document.getElementById("close-Detail-button").style.display = '';
            document.getElementById("Detail").style.display = 'inline-block';
        }


        /**
         * handles feedback button click
         */
        const feedbackButtonClick = () => {
            document.getElementById("open-help-button").style.display = 'none';
            document.getElementById("open-Detail-button").style.display = 'none';
            document.getElementById("scrollbox").style.display = 'none';
            document.getElementById("userInput").style.display = 'none';

            document.getElementById("feedback").style.display = 'inline-block';
            showCloseFeedbackButton();
        }

        /**
         * handles close feedback button click
         */
        const closeFeedbackButtonClick = () => {
            showOpenFeedbackButton();
            hideFeedback();
        }

        /**
         * submits the feedback to the backend
         */
        const feedbackSubmitButtonClick = () => {
            let feedbackBot = "WritingTutor Evaluation";
            let feedbackText = document.getElementById("feedback-text").value;
            let feedbackImprovement = document.getElementById("feedback-improve").value;

            if (feedbackText.trim() === "") {
                Swal({
                    title: 'Empty text!',
                    text: 'Please write feedback in the text box provided',
                    icon: 'error',
                    confirmButtonText: 'Next',
                    confirmButtonColor: '#00762C'
                });
                return;
            }

            // if nothing pressed, then the value is "on"...
            let rating = document.getElementById("rating-1").value;
            let feedbackRating = rating === "on"
                ? 0
                : rating;

            let _data = {
                bot: feedbackBot,
                rating: feedbackRating,
                text: feedbackText.replaceAll(";", " -"),
                improve: feedbackImprovement.replaceAll(";", " -")
            }

            fetch(CHATBOT_URL + "/feedback", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify(_data)
            }).then(() => {
                Swal({
                    title: 'Completed!',
                    text: 'Thank you for the feedback! 🤩',
                    icon: 'success',
                    confirmButtonText: 'Next',
                    confirmButtonColor: '#00762C'
                })
                closeFeedbackButtonClick();
            });
        }


        /**
         * Sets the value of the lowest star to the rating selected
         */
        const adaptFeedbackStars = (idx) => {
            document.getElementById("rating-1").value = idx;
        }

        return (
            <div className={"column"}>
                <div className="chatbot">
                    <div className="header">
                        <div className="header-logo"/>
                            <div className="header-botname">WritingTutor</div>
                        <div className="header-button-bar">
                            <button className="header-button" id="open-help-button" onClick={helpButtonClick}>
                                <i className="fa fa-question-circle"/>
                                <span>Help</span>
                            </button>
                            <button className="header-button" id="open-Detail-button" onClick={detailButtonClick}>
                                <i className="fa fa-comments"/>
                                <span>FAQ</span>
                            </button>
                            <button className="header-button" id="close-Detail-button" style={{display: "none"}}
                                onClick={hideDetail}>
                                <i className="fa fa-times"/>
                                <span>FAQ</span>
                            </button>
                            <button className="header-button" id="open-feedback-button" onClick={feedbackButtonClick}>
                                <i className="fa fa-pencil-square-o"/>
                                <span>Feedback</span>
                            </button>
                            <button className="header-button" id="close-feedback-button" style={{display: "none"}}
                                onClick={closeFeedbackButtonClick}>
                                <i className="fa fa-times"/>
                                <span>Feedback</span>
                            </button>
                            <button className="header-button" id="close-help-button" style={{display: "none"}}
                                    onClick={hideHelp}>
                                <i className="fa fa-times"/>
                                <span>Help</span>
                            </button>
                        </div>
                    </div>
                    <div id="scrollbox">
                        <div className="messagecontainer">
                            <div id="chatbox" dangerouslySetInnerHTML={this.state.chatBoxContent}/>
                        </div>
                    </div>

                    {/*privacy was here*/}
                    <div id="feedback">
                        <h3> The WritingTutor would be pleased to receive your feedback!</h3>
                        <form id="feedback-form">
                            <div>
                                <p> How satisfied are you with the usage? </p>
                                <fieldset className="rating">
                                    <input
                                        type="radio"
                                        id="rating-5"
                                        name="feedback-rating"
                                        onClick={() => adaptFeedbackStars(5)}
                                    />
                                    <label htmlFor="rating-5"/>
                                    <input
                                        type="radio"
                                        id="rating-4"
                                        name="feedback-rating"
                                        onClick={() => adaptFeedbackStars(4)}
                                    />
                                    <label htmlFor="rating-4"/>
                                    <input
                                        type="radio"
                                        id="rating-3"
                                        name="feedback-rating"
                                        onClick={() => adaptFeedbackStars(3)}
                                    />
                                    <label htmlFor="rating-3"/>
                                    <input
                                        type="radio"
                                        id="rating-2"
                                        name="feedback-rating"
                                        onClick={() => adaptFeedbackStars(2)}
                                    />
                                    <label htmlFor="rating-2"/>
                                    <input
                                        type="radio"
                                        id="rating-1"
                                        name="feedback-rating"
                                        onClick={() => adaptFeedbackStars(1)}
                                    />
                                    <label htmlFor="rating-1"/>
                                </fieldset>
                            </div>
                            <div>
                                <p>
                                    {" "}
                                    What do you think of WritingTutor? Is it a useful tool to
                                    clarify questions?{" "}
                                </p>
                                <p>
                    <textarea type="text" id="feedback-text" placeholder="Write at least two short sentences, please."
                        defaultValue={""}/>
                                </p>
                            </div>
                            <div>
                                <p> What could still be improved? (Optional)</p>
                                <p>
                    <textarea type="text" id="feedback-improve" placeholder="Write here your suggestions for the improvement..."
                        defaultValue={""}/>
                                </p>
                            </div>
                            <p>
                                <button type={"button"} className="button button-primary" id="feedback-submit"
                                        onClick={feedbackSubmitButtonClick}>
                                    <i className="fa fa-check"/>
                                    <span>Submit</span>
                                </button>
                            </p>
                        </form>
                    </div>
                    <div id="help">
                        <h1>Help</h1>
                        <div>
                            <h4>Problems with the WritingTutor?</h4>
                            <p>
                                {" "}
                                If you get stuck or feel that WritingTutor is not answering try typing ''Introduction''
                                in the chat box. Alternatively, you can also reload the page.
                            </p>
                            <p>Do you need further support? </p>
                            <p>
                                {" "}
                                If so, please contact Thiemo Wambsganss at the following
                                e-mail address:
                            </p>
                            <p>
                                <a href="mailto:thiemo.wambsganss@epfl.ch">
                                    thiemo.wambsganss@epfl.ch
                                </a>
                            </p>
                        </div>
                    </div>
                    <div id="Detail">
                        <h1>FAQ</h1>
                        <div>
                            <h4>What can the WritingTutor do?</h4>
                            <p>
                                {" "}
                                WritingTutor is trained to support you in the argumentative
                                writing and to analyse the coherence of the structure of your arguments.
                                You will be able to learn the basics of argumentative
                                writing with the theories provided. The text analysis will give you direct
                                feedback that you can adapt to your own preferences.
                            </p>
                            <h4>How should I use the WritingTutor?</h4>
                            <p>
                                {" "}
                                WritingTutor offers you the opportunity to learn at your own pace.
                                You are free to consult the theory at any time, also during the writing.
                                Once you have finished the writing, WritingTutor will analyze your outcome.
                                You revise the evaluation as many times as you like.
                                WritingTutor does not prescribe a learning process for you, but gives you
                                the possibility to adapt your learning process according to your wishes. The
                                buttons allow you to navigate easily through the different learning units.
                                This way you can use the WritingTutor in the way that suits you best. If you need
                                need further support, you can always go to the help area.{" "}
                            </p>
                            <h4>How does the WritingTutor work?</h4>
                            <p>
                                {" "}
                                WritingTutor uses a predefined library of textual and visual
                                content to teach you about argumentative writing.
                                In addition, the analysis of your text is carried out with the help of the TextBlob library.
                                The latest is a popular tool for natural language processing. WritingTutor was
                                developed as part of a master's thesis by Jiir Awdir and the
                                documentation and code can be found in the master's thesis.{" "}
                            </p>
                            <h4>What is sentiment analysis?</h4>
                            <p>
                                {" "}
                                A sentiment analysis (e.g. also called Emotion AI) uses
                                natural language processing, text analysis and further linguistic
                                tools to identify, analyse and structure a given text into its emotional state.
                                This includes the categorisation of the polarity and
                                subjectivity, both of which constitute the emotional state of your text.{" "}
                            </p>
                            <h4>Have your questions been answered? </h4>

                            <p>
                                <a href="mailto:thiemo.wambsganss@epfl.ch">
                                    If not, contact Thiemo Wambsganss to obtain further
                                    information:
                                </a>
                            </p>
                        </div>
                    </div>


                    {/* Header Buttons END */}
                    <div id="userInput">
                        <input id="textInput" type="text" name="msg" placeholder="Type your question here..."
                            autoFocus autoCorrect={"true"} onKeyUp={keyUpTextInput}/>
                        <button id="buttonInput" onClick={ () => sendText()}>
                        {/*<button id="buttonInput" onClick={() => console.log(this.state.chatGPT)}>*/}
                            <i className="fa fa-arrow-right"/>
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

export {Chat}