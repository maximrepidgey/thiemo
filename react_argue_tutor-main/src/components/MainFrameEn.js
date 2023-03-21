import React from "react";
import Swal from 'sweetalert';
import {ClapSpinner} from 'react-spinners-kit';

import {
    CHATBOT_URL,
    chatSuggestCall,
    computeDashboard,
    getTime, getTopSentences,
    hideDetail,
    hideEssayField,
    hideFeedback,
    hideHelp,
    hidePrivacy,
    highlightKeyword,
    highlightTopNPolaritySentences,
    highlightTopNSubjectivitySentences,
    initializeBot,
    ready,
    showChat,
    showCloseFeedbackButton,
    showDetail,
    showOpenFeedbackButton,
    showPrivacy,
    submitMessage
} from "../static/javascript/ArgueTutorEn";

class MainFrameEn extends React.Component {

    /**
     * Handles injected code
     */
    componentDidMount() {
        const that = this;

        /**
         * Handles Chatbot button clicks
         *
         * @param text
         *          Message for the backend
         */
        window.chatSuggest = function (text) {
            that.setState({wasQuestion: true},

                () => chatSuggestCall(that, that.state.chatGPTColor, text)
            );
        }

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
        window.displayELEA = undefined;
        window.playVideo = undefined;
        window.displayWebsite = undefined;
        window.highlightTopKeywordsWindow = undefined;
    }

    constructor(props) {
        super(props);
        this.state = {
            stringChatBotContent: '',
            chatBoxContent: {__html: ''},
            scrollHeight: 0,
            wasQuestion: false,
            dashboardIsComputed: false,
            topKeywords: [],
            dashboardText: '',
            ascPolSentences: [[]],
            ascSubSentences: [[]],
            chatGPTColor: false
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
     * Displays the essay writing interface
     *
     * @param isDbComputed
     *          whether dashboard is computed or not
     */
    showEssayField = (isDbComputed) => {
        document.getElementById("button-eval").disabled = false;
        document.getElementById("close-essay-field-button").disabled = false;

        document.getElementById("close-feedback-button").click();
        document.getElementById("close-Detail-button").click();
        document.getElementById("close-help-button").click();
        document.getElementById("close-dashboard-button").click();

        document.getElementById("show-dashboard-button").style.display = 'none';
        document.getElementById("open-feedback-button").style.display = 'none';
        document.getElementById("open-Detail-button").style.display = 'none';
        document.getElementById("open-help-button").style.display = 'none';
        document.getElementById("close-essay-field-button").style.display = '';
        document.getElementById("scrollbox").style.display = 'none';
        document.getElementById("userInput").style.display = 'none';
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

    chatGPT = async () => {
        // if active reset to predefined bot (red)
        // todo pass parameter to .answer function (that send to backend)
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



    /**
     * Computes the essay stats based on the given input
     *
     * @param characterCount
     * @param text
     * @param wordCount
     * @param sentenceCount
     * @param paragraphCount
     * @param readingTime
     * @param topKeywords
     */
    computeEssayStats = (characterCount, text, wordCount, sentenceCount, paragraphCount, readingTime, topKeywords) => {
        characterCount.innerHTML = text.length;
        let words = text.match(/[-?(\w+)äöüÄÖÜß]+/gi);

        if (words === null) {
            wordCount.innerHTML = 0;
            sentenceCount.innerHTML = 0;
            paragraphCount.innerHTML = 0;
            readingTime.innerHTML = "0s";
            topKeywords.style.display = "none";

            return;
        }

        wordCount.innerHTML = words.length;
        sentenceCount.innerHTML = text.split(/[.!?]+/g).length - 1;
        paragraphCount.innerHTML = text.replace(/\n$/gm, '').split(/\n/).length;

        const seconds = Math.ceil(words.length * 60 / 275);
        if (seconds > 59) {
            let minutes = Math.floor(seconds / 60);
            const actualSeconds = seconds - minutes * 60;
            readingTime.innerHTML = minutes + "m " + actualSeconds + "s";
        } else {
            readingTime.innerHTML = seconds + "s";
        }

        // todo redefine stop words
        let nonStopWords = [];
        let stopWords = ["a", "ab", "aber", "ach", "acht", "achte", "achten", "achter", "achtes", "ag", "alle", "allein", "allem", "allen", "aller", "allerdings", "alles", "allgemeinen", "als", "also", "am", "an", "ander", "andere", "anderem", "anderen", "anderer", "anderes", "anderm", "andern", "anderr", "anders", "au", "auch", "auf", "aus", "ausser", "ausserdem", "außer", "außerdem", "b", "bald", "bei", "beide", "beiden", "beim", "beispiel", "bekannt", "bereits", "besonders", "besser", "besten", "bin", "bis", "bisher", "bist", "c", "d", "d.h", "da", "dabei", "dadurch", "dafür", "dagegen", "daher", "dahin", "dahinter", "damals", "damit", "danach", "daneben", "dank", "dann", "daran", "darauf", "daraus", "darf", "darfst", "darin", "darum", "darunter", "darüber", "das", "dasein", "daselbst", "dass", "dasselbe", "davon", "davor", "dazu", "dazwischen", "daß", "dein", "deine", "deinem", "deinen", "deiner", "deines", "dem", "dementsprechend", "demgegenüber", "demgemäss", "demgemäß", "demselben", "demzufolge", "den", "denen", "denn", "denselben", "der", "deren", "derer", "derjenige", "derjenigen", "dermassen", "dermaßen", "derselbe", "derselben", "des", "deshalb", "desselben", "dessen", "deswegen", "dich", "die", "diejenige", "diejenigen", "dies", "diese", "dieselbe", "dieselben", "diesem", "diesen", "dieser", "dieses", "dir", "doch", "dort", "drei", "drin", "dritte", "dritten", "dritter", "drittes", "du", "durch", "durchaus", "durfte", "durften", "dürfen", "dürft", "e", "eben", "ebenso", "ehrlich", "ei", "ei,", "eigen", "eigene", "eigenen", "eigener", "eigenes", "ein", "einander", "eine", "einem", "einen", "einer", "eines", "einig", "einige", "einigem", "einigen", "einiger", "einiges", "einmal", "eins", "elf", "en", "ende", "endlich", "entweder", "er", "ernst", "erst", "erste", "ersten", "erster", "erstes", "es", "etwa", "etwas", "euch", "euer", "eure", "eurem", "euren", "eurer", "eures", "f", "folgende", "früher", "fünf", "fünfte", "fünften", "fünfter", "fünftes", "für", "g", "gab", "ganz", "ganze", "ganzen", "ganzer", "ganzes", "gar", "gedurft", "gegen", "gegenüber", "gehabt", "gehen", "geht", "gekannt", "gekonnt", "gemacht", "gemocht", "gemusst", "genug", "gerade", "gern", "gesagt", "geschweige", "gewesen", "gewollt", "geworden", "gibt", "ging", "gleich", "gott", "gross", "grosse", "grossen", "grosser", "grosses", "groß", "große", "großen", "großer", "großes", "gut", "gute", "guter", "gutes", "h", "hab", "habe", "haben", "habt", "hast", "hat", "hatte", "hatten", "hattest", "hattet", "heisst", "her", "heute", "hier", "hin", "hinter", "hoch", "hätte", "hätten", "i", "ich", "ihm", "ihn", "ihnen", "ihr", "ihre", "ihrem", "ihren", "ihrer", "ihres", "im", "immer", "in", "indem", "infolgedessen", "ins", "irgend", "ist", "j", "ja", "jahr", "jahre", "jahren", "je", "jede", "jedem", "jeden", "jeder", "jedermann", "jedermanns", "jedes", "jedoch", "jemand", "jemandem", "jemanden", "jene", "jenem", "jenen", "jener", "jenes", "jetzt", "k", "kam", "kann", "kannst", "kaum", "kein", "keine", "keinem", "keinen", "keiner", "keines", "kleine", "kleinen", "kleiner", "kleines", "kommen", "kommt", "konnte", "konnten", "kurz", "können", "könnt", "könnte", "l", "lang", "lange", "leicht", "leide", "lieber", "los", "m", "machen", "macht", "machte", "mag", "magst", "mahn", "mal", "man", "manche", "manchem", "manchen", "mancher", "manches", "mann", "mehr", "mein", "meine", "meinem", "meinen", "meiner", "meines", "mensch", "menschen", "mich", "mir", "mit", "mittel", "mochte", "mochten", "morgen", "muss", "musst", "musste", "mussten", "muß", "mußt", "möchte", "mögen", "möglich", "mögt", "müssen", "müsst", "müßt", "n", "na", "nach", "nachdem", "nahm", "natürlich", "neben", "nein", "neue", "neuen", "neun", "neunte", "neunten", "neunter", "neuntes", "nicht", "nichts", "nie", "niemand", "niemandem", "niemanden", "noch", "nun", "nur", "o", "ob", "oben", "oder", "offen", "oft", "ohne", "ordnung", "p", "q", "r", "recht", "rechte", "rechten", "rechter", "rechtes", "richtig", "rund", "s", "sa", "sache", "sagt", "sagte", "sah", "satt", "schlecht", "schluss", "schon", "sechs", "sechste", "sechsten", "sechster", "sechstes", "sehr", "sei", "seid", "seien", "sein", "seine", "seinem", "seinen", "seiner", "seines", "seit", "seitdem", "selbst", "sich", "sie", "sieben", "siebente", "siebenten", "siebenter", "siebentes", "sind", "so", "solang", "solche", "solchem", "solchen", "solcher", "solches", "soll", "sollen", "sollst", "sollt", "sollte", "sollten", "sondern", "sonst", "soweit", "sowie", "später", "startseite", "statt", "steht", "suche", "t", "tag", "tage", "tagen", "tat", "teil", "tel", "tritt", "trotzdem", "tun", "u", "uhr", "um", "und", "uns", "unse", "unsem", "unsen", "unser", "unsere", "unserer", "unses", "unter", "v", "vergangenen", "viel", "viele", "vielem", "vielen", "vielleicht", "vier", "vierte", "vierten", "vierter", "viertes", "vom", "von", "vor", "w", "wahr", "wann", "war", "waren", "warst", "wart", "warum", "was", "weg", "wegen", "weil", "weit", "weiter", "weitere", "weiteren", "weiteres", "welche", "welchem", "welchen", "welcher", "welches", "wem", "wen", "wenig", "wenige", "weniger", "weniges", "wenigstens", "wenn", "wer", "werde", "werden", "werdet", "weshalb", "wessen", "wie", "wieder", "wieso", "will", "willst", "wir", "wird", "wirklich", "wirst", "wissen", "wo", "woher", "wohin", "wohl", "wollen", "wollt", "wollte", "wollten", "worden", "wurde", "wurden", "während", "währenddem", "währenddessen", "wäre", "würde", "würden", "x", "y", "z", "z.b", "zehn", "zehnte", "zehnten", "zehnter", "zehntes", "zeit", "zu", "zuerst", "zugleich", "zum", "zunächst", "zur", "zurück", "zusammen", "zwanzig", "zwar", "zwei", "zweite", "zweiten", "zweiter", "zweites", "zwischen", "zwölf", "über", "überhaupt", "übrigens"];
        for (let i = 0; i < words.length; i++) {
            if (stopWords.indexOf(words[i].toLowerCase()) === -1 && isNaN(words[i])) {
                nonStopWords.push(words[i].toLowerCase());
            }
        }
        let keywords = {};
        for (let i = 0; i < nonStopWords.length; i++) {
            if (nonStopWords[i] in keywords) {
                keywords[nonStopWords[i]] += 1;
            } else {
                keywords[nonStopWords[i]] = 1;
            }
        }
        let sortedKeywords = [];
        for (let keyword in keywords) {
            sortedKeywords.push([keyword, keywords[keyword]])
        }
        sortedKeywords.sort(function (a, b) {
            return b[1] - a[1]
        });

        this.setState({topKeywords: sortedKeywords.slice(0, 4)});

        topKeywords.innerHTML = "";
        for (let i = 0; i < sortedKeywords.length && i < 4; i++) {
            let li = document.createElement('li');
            li.innerHTML = "<b>" + sortedKeywords[i][0] + "</b>: " + sortedKeywords[i][1];

            topKeywords.appendChild(li);
        }

        topKeywords.style.display = "block";
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
                () => submitMessage(text, this.state.chatGPTColor, this.updateChatBoxContent))
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
         * Shows the dashboard
         *      - only callable once the dashboard has been computed and the user has returned to the chat (with the button in the header bar)
         */
        const showDashboardButtonClick = () => {
            hideChat();
            document.getElementById("help").style.display = 'none';
            document.getElementById("Detail").style.display = 'none';
            document.getElementById("feedback").style.display = 'none';

            document.getElementById("close-feedback-button").style.display = 'none';
            document.getElementById("close-help-button").style.display = 'none';
            document.getElementById("close-Detail-button").style.display = 'none';
            document.getElementById("show-dashboard-button").style.display = 'none';
            document.getElementById("close-dashboard-button").style.display = '';
            document.getElementById("dashboard").style.display = 'inline-block';
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
         * Handles close help button click
         */
        const closeHelpButtonClick = () => {
            hideHelp();
        }

        /**
         * Handles close Dashboard button click
         */
        const closeDashboardButtonClick = () => {
            showChat()
            closeDetailButtonClick();
            closeHelpButtonClick();
            closeFeedbackButtonClick();

            document.getElementById("dashboard").style.display = 'none';
            document.getElementById("open-essay-page").style.display = 'none';
            document.getElementById("close-dashboard-button").style.display = 'none';

            if (this.state.dashboardIsComputed) {
                document.getElementById("show-dashboard-button").style.display = '';
            }
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
         * handles detail button click (FAQ)
         */
        const detailButtonClick = () => {
            hideChat();

            document.getElementById("close-Detail-button").style.display = '';
            document.getElementById("Detail").style.display = 'inline-block';
        }

        /**
         * handels close Detail (FAQ) button click
         */
        const closeDetailButtonClick = () => {
            hideDetail();
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
         * reloads the window and resets the chatbot to the beginning
         */
        const refreshPage = () => {
            window.location.reload();
        }

        /**
         * adds restartfunctionality to the reload button
         */
        const addOnClickToReloadPage = () => {
            document.getElementById("reload-page").addEventListener('click',
                () => refreshPage());
        }

        /**
         * Sends evaluation request to the backend and then displays the corresponding Dashboard with the results
         */
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
                }, 25000); // Timeout after 25 seconds
            });

            Promise.race([fetch(CHATBOT_URL + "/texttransfer", {
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
                this.setState({dashboardIsComputed: true, dashboardText: adaptedText, ascPolSentences: sent_polarities, ascSubSentences: sent_subjectivities});
                showDashboardStats(adaptedText);
                computeDashboard(subjectivity, polarity, adaptedText, sentences, addOnClickToReloadPage, this.state);

                let botHtml =
                    `<div class="message">
                        <div class="message-botname">WritingTutor</div>
                        <div class="botText">
                            <div class="avatar-wrapper">
                                <img class="avatar" src="/img/ArgueTutor.png" alt="avatar">
                            </div>
                            <div class="data-wrapper">Your essay has been evaluated. You can view the results again by clicking on the dashboard button.</div>
                        </div>
                        <div class="message-time">` + getTime() + `</div>
                    </div>
                    `;
                this.updateChatBoxContent(botHtml)
                document.getElementById("loadingEvaluationAnimation").style.display = "none";

                //     timeout and error handling
            }).catch(() => {
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
         * Sets the value of the lowest star to the rating selected
         */
        const adaptFeedbackStars = (idx) => {
            document.getElementById("rating-1").value = idx;
        }

        return (
            <div>
                {/* Version 3.0 */}
                <meta charSet="utf-8"/>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, user-scalable=no"
                />
                <meta name="apple-mobile-web-app-capable" content="yes"/>

                <title>WritingTutor</title>
                <div className="chatbot">
                    <div className="header">
                        <div className="header-logo"/>
                        <div className="header-botname">WritingTutor</div>
                        <div className="header-button-bar">


                            <button className="header-button" id="chatgpt" onClick={this.chatGPT}>
                                <i className="fa fa-robot"/>
                                <span>GPT</span>
                            </button>

                            <button className="header-button" id="open-help-button" onClick={helpButtonClick}>
                                <i className="fa fa-question-circle"/>
                                <span>Help</span>
                            </button>
                            <button className="header-button" id="open-Detail-button" onClick={detailButtonClick}>
                                <i className="fa fa-comments"/>
                                <span>FAQ</span>
                            </button>
                            <button
                                className="header-button"
                                id="close-Detail-button"
                                style={{display: "none"}}
                                onClick={closeDetailButtonClick}
                            >
                                <i className="fa fa-times"/>
                                <span>FAQ</span>
                            </button>
                            <button className="header-button" id="open-feedback-button" onClick={feedbackButtonClick}>
                                <i className="fa fa-pencil-square-o"/>
                                <span>Feedback</span>
                            </button>
                            <button
                                className="header-button"
                                id="close-feedback-button"
                                style={{display: "none"}}
                                onClick={closeFeedbackButtonClick}
                            >
                                <i className="fa fa-times"/>
                                <span>Feedback</span>
                            </button>
                            <button
                                className="header-button"
                                id="close-help-button"
                                style={{display: "none"}}
                                onClick={closeHelpButtonClick}
                            >
                                <i className="fa fa-times"/>
                                <span>Help</span>
                            </button>
                            <button
                                className="header-button"
                                id="close-dashboard-button"
                                style={{display: "none"}}
                                onClick={closeDashboardButtonClick}
                            >
                                <i className="fa fa-times"/>
                                <span>Dashboard</span>
                            </button>
                            <button
                                className="header-button"
                                id="show-dashboard-button"
                                style={{display: "none"}}
                                onClick={showDashboardButtonClick}
                            >
                                <i className="fas fa-chart-pie"/>
                                <span>Dashboard</span>
                            </button>
                            <button
                                className="header-button"
                                id="close-essay-field-button"
                                style={{display: "none"}}
                                onClick={closeEssayButtonClick}
                            >
                                <i className="fa fa-times"/>
                                Text field
                            </button>


                            <button
                                className="header-button"
                                id="open-essay-page"
                                style={{display: "none"}}
                                onClick={() => this.showEssayField(this.state.dashboardIsComputed)}
                            >
                                <i className="far fa-file-alt"/>
                                <span>Text field</span>
                            </button>
                        </div>
                    </div>
                    <div id="scrollbox">
                        <div className="messagecontainer">
                            <div id="chatbox" dangerouslySetInnerHTML={this.state.chatBoxContent}/>
                        </div>
                    </div>

                    {/* DASHBOARD including the evaluation */}
                    <div id="dashboard">
                        <div className="col-md-12">
                            <div className="rounded border">
                                <div className="container-fluid text-center mt-3">
                                    <h1
                                        className="m-0"
                                        style={{
                                            borderBottomStyle: "solid",
                                            marginBottom: "15px!important",
                                        }}
                                    >
                                        Dashboard
                                    </h1>
                                </div>
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="p-2">
                                            {/* STRUCTURE-GRAPH */}
                                            <div
                                                className="container-fluid text-center"
                                                style={{fontSize: "1.5em", fontWeight: 600}}
                                            >
                                                Here is you text
                                            </div>
                                        </div>
                                    </div>
                                    {/* Implementation of the text in the dashboard, including the wordcount table*/}
                                    <div
                                        className="col-md-12 card"
                                        style={{
                                            maxWidth: "80%",
                                            marginLeft: "auto",
                                            marginRight: "auto",
                                        }}
                                    >
                                        <div
                                            className="p-2 border p-4"
                                            id="userDashboardText"
                                            style={{
                                                marginTop: 10,
                                                marginBottom: 20,
                                                backgroundColor: "azure",
                                            }}
                                        />
                                        {/* Wordcount section whithin the dashboard */}
                                        <section className="container" style={{maxWidth: 1000}}>
                                            <div
                                                className="left-half"
                                                style={{display: "inline-block", width: "50%"}}
                                            >
                                                <div className="output row" style={{marginLeft: "-1rem"}}>
                                                    <div>
                                                        Characters: <span id="characterCountDB">0</span>
                                                    </div>
                                                    <div>
                                                        Words: <span id="wordCountDashboard">0</span>
                                                    </div>
                                                </div>
                                                <div className="output row" style={{marginLeft: "-1rem"}}>
                                                    <div>
                                                        Sentences: <span id="sentenceCountDB">0</span>
                                                    </div>
                                                    <div>
                                                        Paragraphs: <span id="paragraphCountDB">0</span>
                                                    </div>
                                                </div>
                                                <div className="output row" style={{marginLeft: "-1rem"}}>
                                                    <div>
                                                        Lesezeit: <span id="readingTimeDB">0</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                className="right-half"
                                                style={{display: "inline-block", width: "49%"}}
                                            >
                                                <div className="keywords" style={{marginRight: "-1rem"}}>
                                                    <h3>Top Keywords</h3>
                                                    (Click on the words to highlight them in the text)
                                                    <ul id="topKeywordsDB"></ul>
                                                </div>
                                            </div>
                                        </section>
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
                                                    <div
                                                        className="container my-3"
                                                        style={{alignItems: "flex-start"}}
                                                    >
                                                        <h4 className={"my-2"}>Generated summary</h4>
                                                        <div id={"summary"}></div>

                                                        <h4 className="my-2"> Subjectivity/Objectivity </h4>
                                                        <progress className={"progress"} id="subjectivityBar"
                                                                  title={"On a scale from very objective (0%) to very subjective (100%), this text is: "}
                                                                  max="100" value="90">
                                                        </progress>
                                                        <div
                                                            className="row w-100 text-center mx-auto mt-2"
                                                            style={{marginBottom: 15}}
                                                        >
                                                            <div
                                                                id="s1"
                                                                className="col-md-2 border mx-auto"
                                                                style={{borderRadius: 10, textAlign: "center"}}
                                                            >
                                                                Very Objective
                                                            </div>
                                                            <div
                                                                id="s2"
                                                                className="col-md-2 border mx-auto"
                                                                style={{borderRadius: 10, textAlign: "center"}}
                                                            >
                                                                Objective
                                                            </div>
                                                            <div
                                                                id="s3"
                                                                className="col-md-2 border mx-auto"
                                                                style={{borderRadius: 10, textAlign: "center"}}
                                                            >
                                                                Neutral
                                                            </div>
                                                            <div
                                                                id="s4"
                                                                className="col-md-2 border mx-auto"
                                                                style={{borderRadius: 10, textAlign: "center"}}
                                                            >
                                                                Subjective
                                                            </div>
                                                            <div
                                                                id="s5"
                                                                className="col-md-2 border mx-auto"
                                                                style={{borderRadius: 10, textAlign: "center"}}
                                                            >
                                                                Very subjective
                                                            </div>
                                                        </div>
                                                        <a href={"javascript:void(0)"}
                                                           onClick={showSubjectivitySources}> Most influential sentences for the
                                                            Subjectivity decision? </a>

                                                        <h4 className="my-2"> Polarity </h4>
                                                        <progress className={"progress"} id="polarityBar"
                                                                  title={"On a scale from very negative (0%) to very positive (100%), this text is: "}
                                                                  max="100" value="90">
                                                        </progress>
                                                        <div
                                                            className="row w-100 text-center mx-auto mt-2"
                                                            style={{marginBottom: 20}}
                                                        >
                                                            <div
                                                                id="p1"
                                                                className="col-md-2 border mx-auto"
                                                                style={{borderRadius: 10, textAlign: "center"}}
                                                            >
                                                                Very Negative
                                                            </div>
                                                            <div
                                                                id="p2"
                                                                className="col-md-2 border mx-auto"
                                                                style={{borderRadius: 10, textAlign: "center"}}
                                                            >
                                                                Negative
                                                            </div>
                                                            <div
                                                                id="p3"
                                                                className="col-md-2 border mx-auto"
                                                                style={{borderRadius: 10, textAlign: "center"}}
                                                            >
                                                                Neutral
                                                            </div>
                                                            <div
                                                                id="p4"
                                                                className="col-md-2 border mx-auto"
                                                                style={{borderRadius: 10, textAlign: "center"}}
                                                            >
                                                                Positive
                                                            </div>
                                                            <div
                                                                id="p5"
                                                                className="col-md-2 border mx-auto"
                                                                style={{borderRadius: 10, textAlign: "center"}}
                                                            >
                                                                Very positive
                                                            </div>
                                                        </div>
                                                        <a href={"javascript:void(0)"} onClick={showPolaritySources}> Most influential sentences for the polarity decision? </a>

                                                        <h4>Emotionen</h4>
                                                        <progress className={"progress"} id="neutral"
                                                                  title={"On a scale from not applicable at all (0%) to very applicable (100%), this text is:"}
                                                                  max="100" value="90"
                                                                  style={{content:"hello"}}>
                                                        </progress>
                                                        <div className="progressbarText">{"Neutral"}</div>

                                                        <progress className={"progress"} id="disgust"
                                                                  title={"On a scale from not applicable at all (0%) to very applicable (100%), this text is:"}
                                                                  max="100" value="90">
                                                        </progress>
                                                        <div className="progressbarText">{"Disgust"}</div>

                                                        <progress className={"progress"} id="sadness"
                                                                  title={"On a scale from not applicable at all (0%) to very applicable (100%), this text is: "}
                                                                  max="100" value="90">
                                                        </progress>
                                                        <div className="progressbarText">{"Sadness"}</div>

                                                        <progress className={"progress"} id="fear"
                                                                  title={"On a scale from not applicable at all (0%) to very applicable (100%), this text is: "}
                                                                  max="100" value="90">
                                                        </progress>
                                                        <div className="progressbarText">{"Fear"}</div>

                                                        <progress className={"progress"} id="anger"
                                                                  title={"On a scale from not applicable at all (0%) to very applicable (100%), this text is: "}
                                                                  max="100" value="90">
                                                        </progress>
                                                        <div className="progressbarText">{"Anger"}</div>

                                                        <progress className={"progress"} id="surprise"
                                                                  title={"On a scale from not applicable at all (0%) to very applicable (100%), this text is: "}
                                                                  max="100" value="90">
                                                        </progress>
                                                        <div className="progressbarText">{"Surprise"}</div>

                                                        <progress className={"progress"} id="joy"
                                                                  title={"On a scale from not applicable at all (0%) to very applicable (100%), this text is: "}
                                                                  max="100" value="90">
                                                        </progress>
                                                        <div className="progressbarText">{"Joy"}</div>
                                                    </div>
                                                    {/* Feedback on the text */}
                                                    <div className="container-fluid text-center cardtwo my-4">
                                                        <div
                                                            id="dashboard-h2 my-2"
                                                            style={{fontSize: "x-large"}}
                                                        >
                                                            Subjectivity/Objectivity{" "}
                                                        </div>
                                                        <div
                                                            className="text-black-50"
                                                            style={{fontSize: "large"}}
                                                            id="writtenSubjectivity"
                                                        />
                                                        <div
                                                            id="dashboard-h2 my-2"
                                                            style={{fontSize: "x-large"}}
                                                        >
                                                            {" "}
                                                            Polarity{" "}
                                                        </div>
                                                        <div
                                                            className="text-black-50"
                                                            style={{fontSize: "large", marginBottom: 30}}
                                                            id="writtenPolarity"
                                                        />
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
                                                        <button
                                                            type={"button"}
                                                            className="buttonTest"
                                                            id="reload-page"
                                                            onClick={refreshPage}
                                                        >
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
                    {/* DASHBOARD END */}

                    {/*scrollbox end*/}
                    <div id="privacy">
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
                            <button
                                type="button"
                                id="privacy-accept"
                                className="button button-primary"
                                onClick={() => {
                                    hidePrivacy();
                                    initializeBot(this.updateChatBoxContent, this.state.chatGPTColor);
                                }}
                            >
                                I consent.
                            </button>
                        </p>
                    </div>
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
                                    <label htmlFor="rating-5"></label>
                                    <input
                                        type="radio"
                                        id="rating-4"
                                        name="feedback-rating"
                                        onClick={() => adaptFeedbackStars(4)}
                                    />
                                    <label htmlFor="rating-4"></label>
                                    <input
                                        type="radio"
                                        id="rating-3"
                                        name="feedback-rating"
                                        onClick={() => adaptFeedbackStars(3)}
                                    />
                                    <label htmlFor="rating-3"></label>
                                    <input
                                        type="radio"
                                        id="rating-2"
                                        name="feedback-rating"
                                        onClick={() => adaptFeedbackStars(2)}
                                    />
                                    <label htmlFor="rating-2"></label>
                                    <input
                                        type="radio"
                                        id="rating-1"
                                        name="feedback-rating"
                                        onClick={() => adaptFeedbackStars(1)}
                                    />
                                    <label htmlFor="rating-1"></label>
                                </fieldset>
                            </div>
                            <div>
                                <p>
                                    {" "}
                                    What do you think of WritingTutor? Is it a useful tool to
                                    clarify questions?{" "}
                                </p>
                                <p>
                        <textarea
                            type="text"
                            id="feedback-text"
                            placeholder="Write at least two short sentences, please."
                            defaultValue={""}
                        />
                                </p>
                            </div>
                            <div>
                                <p> What could still be improved? (Optional)</p>
                                <p>
                        <textarea
                            type="text"
                            id="feedback-improve"
                            placeholder="Write here your suggestions for the improvement..."
                            defaultValue={""}
                        />
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



                    {/*Essay Writing Part*/}
                    <div id="ELEAIframeTemplate">
                        <form method="post" >
                            <label style={{display: "block", fontSize: "x-large"}}>
                                Evaluations-Text box
                            </label>
                            <div className="w3-display-left">
                                <div className="ehi-wordcount-container">
                                    <label htmlFor="evalution_textarea"/>

                                    <div id={"loadingEvaluationAnimation"}
                                         style={{
                                             display: "none",
                                             position: 'fixed',
                                             top: '50%',
                                             left: '50%',
                                             transform: 'translate(-50%, -50%)',
                                             background: 'white',
                                             padding: '20px',}}>
                                        <ClapSpinner size={40} color="#686769" loading={true}/>
                                    </div>
                                    <textarea
                                        spellCheck={true}
                                        className="text"
                                        rows={25}
                                        cols={25}
                                        name="evaluationText"
                                        id="evalution_textarea"
                                        placeholder="Enter your text here..."
                                        onKeyUp={this.updateEssayStats}
                                        style={{
                                            resize: "none",
                                            borderRadius: 10,
                                            boxShadow: "none",
                                            borderWidth: 0,
                                            backgroundColor: "#f4f4f4",
                                            height: 350,
                                            marginBottom: "1rem",
                                            padding: "0.5rem"
                                        }}
                                        defaultValue={""}
                                    />
                                    <section className="container" style={{maxWidth: 1000}}>
                                        <div
                                            className="left-half"
                                            style={{display: "inline-block", width: "50%"}}
                                        >
                                            <div className="output row" style={{marginLeft: "-1rem"}}>
                                                <div>
                                                    Characters: <span id="characterCount">0</span>
                                                </div>
                                                <div>
                                                    Words: <span id="wordCount">0</span>
                                                </div>
                                            </div>
                                            <div className="output row" style={{marginLeft: "-1rem"}}>
                                                <div>
                                                    Sentences: <span id="sentenceCount">0</span>
                                                </div>
                                                <div>
                                                    Paragraphs: <span id="paragraphCount">0</span>
                                                </div>
                                            </div>
                                            <div className="output row" style={{marginLeft: "-1rem"}}>
                                                <div>
                                                    Reading time: <span id="readingTime">0</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className="right-half"
                                            style={{display: "inline-block", width: "49%"}}
                                        >
                                            <div className="keywords" style={{marginRight: "-1rem"}}>
                                                Top keywords
                                                <ul id="topKeywords"></ul>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </form>
                        <button
                            className="buttonEval"
                            id="button-eval"
                            onClick={evaluationChatSuggest}
                        >
                            Text bewerten
                        </button>
                    </div>

                    {/* Header Buttons END */}
                    <div id="userInput">
                        <input
                            id="textInput"
                            type="text"
                            name="msg"
                            placeholder="Type your question here..."
                            autoFocus
                            onKeyUp={keyUpTextInput}
                        />
                        <button id="buttonInput" onClick={sendText}>
                            <i className="fa fa-arrow-right"/>
                        </button>
                    </div>
                </div>

                <link
                    rel="stylesheet"
                    href="https://cdn.jsdelivr.net/gh/mdbassit/Coloris@latest/dist/coloris.min.css"
                />
            </div>

        );
    }
}

export {MainFrameEn}