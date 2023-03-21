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
} from "../static/javascript/ArgueTutor";
import {useEffect, useState} from "react";
import Button from "./Button";
import Dashboard from "./Dashboard";


const mainFrame = () => {

    // todo set correctly initial state
    // every variable must be interpreted as <variable>isHidden?
    const [openFeedbackButton, setOpenFeedbackButton] = useState(false);
    const [openDetailButton, setOpenDetailButton] = useState(false);
    const [openHelpButton, setOpenHelpButton] = useState(false);
    const [closeFeedbackButton, setCloseFeedbackButton] = useState(false);
    const [closeDetailButton, setCloseDetailButton] = useState(false);
    const [closeHelpButton, setCloseHelpButton] = useState(false);
    const [showDashboardButton, setShowDashboardButton] = useState(false);
    const [closeDashboardButton, setCloseDashboardButton] = useState(false);
    const [openEssayPage, setOpenEssayPage] = useState(false);
    const [scrollBox, setScrollBox] = useState(false);
    const [dashboard, setDashboard] = useState(false);
    const [feedback, setFeedback] = useState(false);
    const [help, setHelp] = useState(false);
    const [detail, setDetail] = useState(false);
    const [userInput, setUserInput] = useState(false);

    // states from mainframe
    const [stringChatBotContent, setStringChatBotContent] = useState('');
    const [chatBoxContent, setChatBoxContent] = useState({__html: ''});
    const [scrollHeight, setScrollHeight] = useState(0);
    const [wasQuestion, setWasQuestion] = useState(false);
    const [dashboardIsComputed, setDashboardIsComputed] = useState(false);
    const [topKeywords, setTopKeywords] = useState([]);
    const [dashboardText, setDashboardText] = useState('');
    const [ascPolSentences, setAscPolSentences] = useState([[]]);
    const [ascSubSentences, setAscSubSentences] = useState([[]]);

    useEffect(() => {


        // Start-up of the chatbot: the following is meant for the login:
        let userName = "";
        // while (!(new RegExp('[a-zA-Z0-9\b]{4}-rdexp$')).test(userName)) {
        //     userName = prompt("Please enter your code :");
        // }

        // showPrivacy()


        const that = this;

        /**
         * Handles Chatbot button clicks
         *
         * @param text
         *          Message for the backend
         */
        window.chatSuggest = function (text) {
            that.setState({wasQuestion: true},

                () => chatSuggestCall(that, text)
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

        // component will unmount
        return () => {
            window.chatSuggest = undefined;
            window.displayELEA = undefined;
            window.playVideo = undefined;
            window.displayWebsite = undefined;
            window.highlightTopKeywordsWindow = undefined;
        }
    }, [])

    /**
     * Sends the question from the textInput to the backend
     */
    const sendText = () => {
        let text = document.getElementById("textInput").value;

        // added this, so that the scrollbox height is adjusted to the correct spot since the last one is still at the height of the
        // last question if we clicked on "textfeld öffnen"
        this.setState({wasQuestion: true},
            () => submitMessage(text, this.updateChatBoxContent))
    }

    /**
     * Displays the essay writing interface
     *
     * @param isDbComputed
     *          whether dashboard is computed or not
     */
    const showEssayField = (isDbComputed) => {
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
    const scrollUpDashboard = () => {
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
    const scrollChatBox = () => {
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
    const deletedTypingMessage = () => {
        return this.state.stringChatBotContent.replaceAll(`<div class="message typing"><div class="message-botname">WritingTutor</div><div class="botText"><div class="avatar-wrapper"><img class="avatar" src="/img/ArgueTutorClosed.png"></div><div class="data-wrapper"><img src="/img/typing3.gif"></div></div></div>`, "");
    }

    /**
     * Adds the given argument to the chatbox
     *
     * @param newContent
     *          content to be added to the chat
     */
    const updateChatBoxContent = (newContent) => {
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
    const updateEssayStats = () => {
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
    const computeEssayStats = (characterCount, text, wordCount, sentenceCount, paragraphCount, readingTime, topKeywords) => {
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
        setOpenFeedbackButton(true)
        setOpenDetailButton(true)
        setOpenHelpButton(true)
        setScrollBox(true)
        setUserInput(true)
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
                title: 'Leerer Text!',
                text: 'Schreiben Sie bitte ein Feedback in das vorgesehene Textfeld',
                icon: 'error',
                confirmButtonText: 'Weiter',
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
                title: 'Erledigt!',
                text: 'Vielen Dank für Ihr Feedback! 🤩',
                icon: 'success',
                confirmButtonText: 'Weiter',
                confirmButtonColor: '#00762C'
            })
            closeFeedbackButtonClick();
        });
    }


    /**
     * adds restart functionality to the reload button
     */
    const addOnClickToReloadPage = () => {
        document.getElementById("reload-page").addEventListener('click',
            () =>  window.location.reload());
    }

    /**
     * Sends evaluation request to the backend and then displays the corresponding Dashboard with the results
     */
    const evaluationChatSuggest = () => {
        let submittedText = document.getElementById("evalution_textarea").value;

        if (submittedText.trim().length === 0) {
            Swal({
                title: 'Leerer Text!',
                text: 'Schreiben Sie bitte einen Text mit etwa 200 Wörtern',
                icon: 'error',
                confirmButtonText: 'Weiter',
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
                document.getElementById(emotions[i].label).title = "Auf einer Skala von gar nicht zutreffend (0%) bis sehr zutreffend (100%) ist dieser Text: " + score + "%";
            }
            let adaptedText = text.replaceAll("\\n", "\n");

            let sentences = text.split(/[.!?]+/g)

            const subj = subjectivity * 100;
            const pol = ((polarity / 2.0) + 0.5) * 100;
            document.getElementById("subjectivityBar").value = subj;
            document.getElementById("subjectivityBar").title = "Auf einer Skala von sehr objektiv (0%) bis sehr subjektiv (100%) ist dieser Text: " + subj.toFixed(2) + "%";
            document.getElementById("polarityBar").value = pol;
            document.getElementById("polarityBar").title = "Auf einer Skala von sehr negativ (0%) bis sehr positiv (100%) ist dieser Text: " + pol.toFixed(2) + "%";
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
                        <div class="data-wrapper">Dein Essay wurde evaluiert. Du kannst die Ergebnisse nochmals ansehen, indem du auf den Dashboardknopf klickst.</div>
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
                        <div class="data-wrapper">Bei der Evaluation deines Essays gab es einen Fehler, ich bitte um Entschuldigung. Bitte versuche es noch einmal, indem du oben auf den "Textfeld öffnen"-Knopf klickst.</div>
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
                            <button className="header-button" id="open-help-button" onClick={helpButtonClick}>
                                <i className="fa fa-question-circle"/>
                                <span>Hilfe</span>
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

                            <Button text={"Feedback"} state={closeFeedbackButton} onClick={closeFeedbackButtonClick}/>
                            <Button text={"Hilfe"} state={closeHelpButton} onClick={closeHelpButtonClick}/>
                            <Button text={"Dashboard"} state={closeDashboardButton} onClick={closeDashboardButtonClick}/>

                            <button
                                className="header-button"
                                id="show-dashboard-button"
                                style={{display: "none"}}
                                onClick={showDashboardButtonClick}
                            >
                                <i className="fas fa-chart-pie"/>
                                <span>Dashboard</span>
                            </button>

                            <Button text={"Textfeld"} state={}/>
                            <button
                                className="header-button"
                                id="close-essay-field-button"
                                style={{display: "none"}}
                                onClick={closeEssayButtonClick}
                            >
                                <i className="fa fa-times"/>
                                Textfeld
                            </button>


                            <button
                                className="header-button"
                                id="open-essay-page"
                                style={{display: "none"}}
                                onClick={() => this.showEssayField(this.state.dashboardIsComputed)}
                            >
                                <i className="far fa-file-alt"/>
                                <span>Textfeld</span>
                            </button>
                        </div>
                    </div>

                    <div id="scrollbox">
                        <div className="messagecontainer">
                            <div id="chatbox" dangerouslySetInnerHTML={this.state.chatBoxContent}></div>
                        </div>
                    </div>

                    {/* DASHBOARD including the evaluation */}
                    <Dashboard/>
                    {/* DASHBOARD END */}

                    {/*scrollbox end*/}
                    <div id="privacy">
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
                        <p>
                            <button
                                type="button"
                                id="privacy-accept"
                                className="button button-primary"
                                onClick={() => {
                                    hidePrivacy();
                                    initializeBot(this.updateChatBoxContent);
                                }}
                            >
                                Ich bin damit einverstanden.
                            </button>
                        </p>
                    </div>
                    <div id="feedback">
                        <h3> Der WritingTutor würde sich über ein Feedback freuen!</h3>
                        <form id="feedback-form">
                            <div>
                                <p> Wie zufrieden waren Sie mit der Nutzung? </p>
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
                                    Was halten Sie von WritingTutor? Ist es ein nützliches Werkzeug, um
                                    Fragen zu klären?{" "}
                                </p>
                                <p>
                        <textarea
                            type="text"
                            id="feedback-text"
                            placeholder="Bitte schreiben Sie mindestens 2 kurze Sätze."
                            defaultValue={""}
                        />
                                </p>
                            </div>
                            <div>
                                <p> Was könnte noch verbessert werden? (Fakultativ)</p>
                                <p>
                        <textarea
                            type="text"
                            id="feedback-improve"
                            placeholder="Schreiben Sie hier Ihre Verbesserungsvorschläge..."
                            defaultValue={""}
                        />
                                </p>
                            </div>
                            <p>
                                <button type={"button"} className="button button-primary" id="feedback-submit"
                                        onClick={feedbackSubmitButtonClick}>
                                    <i className="fa fa-check"/>
                                    <span>Feedback abgeben</span>
                                </button>
                            </p>
                        </form>
                    </div>
                    <div id="help">
                        <h1>Hilfe</h1>
                        <div>
                            <h4>Probleme mit dem WritingTutor?</h4>
                            <p>
                                {" "}
                                Wenn Sie nicht weiterkommen oder das Gefühl haben, dass WritingTutor
                                nicht antwortet, versuchen Sie, ''Einführung'' in das Chat-Feld
                                einzugeben. Alternativ können Sie auch die Seite mit WritingTutor neu
                                laden.
                            </p>
                            <p>Benötigen Sie weitere Unterstützung? </p>
                            <p>
                                {" "}
                                Wenn ja, wenden Sie sich an Thiemo Wambsganss unter der folgenden
                                E-Mail-Adresse:
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
                            <h4>Was kann der WritingTutor tun?</h4>
                            <p>
                                {" "}
                                Ab sofort ist WritingTutor darauf geschult, Sie beim argumentativen
                                Schreiben zu unterstützen und Ihre strukturierten Argumente auf ihre
                                Stimmigkeit hin zu analysieren. Mit den zur Verfügung gestellten
                                Theorien werden Sie in die Lage versetzt, die Grundlagen des
                                argumentativen Schreibens zu erlernen, während die Textanalyse Ihnen
                                ein direkt zugängliches Feedback gibt, das Sie an Ihre eigenen
                                Vorlieben anpassen können.
                            </p>
                            <h4>Wie sollte ich WritingTutor verwenden?</h4>
                            <p>
                                {" "}
                                WritingTutor bietet Ihnen die Möglichkeit, in Ihrem eigenen Tempo zu
                                lernen. Sie können sich die Theorien so oft ansehen, wie Sie möchten,
                                und wenn Sie sich bereit fühlen, können Sie Ihren Text analysieren
                                Ihren Text analysieren und ihn so oft wiederholen, wie Sie möchten.
                                WritingTutor schreibt Ihnen keinen Lernprozess vor, sondern gibt Ihnen
                                die Möglichkeit, Ihren Lernprozess nach Ihren Wünschen anzupassen. Die
                                vordefinierten Buttons ermöglichen es Ihnen zudem, einfach durch die
                                verschiedenen Lerneinheiten zu navigieren. So können Sie den
                                WritingTutor so nutzen, wie es Ihnen am besten passt. Wenn Sie noch
                                weitere Unterstützung benötigen, können Sie jederzeit den Hilfebereich
                                aufsuchen, um weitere Hilfe zu erhalten.{" "}
                            </p>
                            <h4>Wie funktioniert der WritingTutor?</h4>
                            <p>
                                {" "}
                                WritingTutor verwendet eine vordefinierte Bibliothek von textlichen
                                und visuellen Inhalten, um Ihnen Wissen über argumentatives Schreiben
                                zu vermitteln. Darüber hinaus wird die Analyse Ihres Textes mit Hilfe
                                der TextBlob-Bibliothek durchgeführt. TextBlob ist ein beliebtes
                                Werkzeug für die Verarbeitung natürlicher Sprache. WritingTutor wurde
                                im Rahmen einer Masterarbeit von Jiir Awdir entwickelt und die
                                Dokumentation sowie der Code sind in der Masterarbeit zu finden.{" "}
                            </p>
                            <h4>Was ist eine Stimmungsanalyse?</h4>
                            <p>
                                {" "}
                                Eine Stimmungsanalyse (z. B. auch Emotion AI genannt) verwendet
                                natürliche Sprachverarbeitung, Textanalyse und weitere linguistische
                                Werkzeuge, um einen Text zu identifizieren, zu analysieren, zu
                                strukturieren und einen gegebenen Text in seinen Gefühlszustand zu
                                kategorisieren. Dies beinhaltet die Kategorisierung der Polarität und
                                der Subjektivität, die beide den den Gefühlszustand Ihres Textes
                                ausmachen. Mit diesen Informationen können Sie Ihren Text nach Ihren
                                Vorlieben anpassen.{" "}
                            </p>
                            <h4>Wurden Ihre Fragen beantwortet? </h4>

                            <p>
                                <a href="mailto:thiemo.wambsganss@epfl.ch">
                                    Wenn nicht, kontaktieren Sie Thiemo Wambsgans, um weitere
                                    Informationen zu erhalten:
                                </a>
                            </p>
                        </div>
                    </div>



                    {/*Essay Writing Part*/}
                    <div id="ELEAIframeTemplate">
                        <form method="post" >
                            <label style={{display: "block", fontSize: "x-large"}}>
                                Evaluations-Textfeld
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
                                        placeholder="Text hier eingeben..."
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
                                                    Zeichen: <span id="characterCount">0</span>
                                                </div>
                                                <div>
                                                    Wörter: <span id="wordCount">0</span>
                                                </div>
                                            </div>
                                            <div className="output row" style={{marginLeft: "-1rem"}}>
                                                <div>
                                                    Sätze: <span id="sentenceCount">0</span>
                                                </div>
                                                <div>
                                                    Paragraphen: <span id="paragraphCount">0</span>
                                                </div>
                                            </div>
                                            <div className="output row" style={{marginLeft: "-1rem"}}>
                                                <div>
                                                    Lesezeit: <span id="readingTime">0</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className="right-half"
                                            style={{display: "inline-block", width: "49%"}}
                                        >
                                            <div className="keywords" style={{marginRight: "-1rem"}}>
                                                Top Schlüsselwörter
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
                            placeholder="Geben Sie Ihre Frage hier ein..."
                            autoFocus
                            onKeyUp={keyUpTextInput}
                        />
                        <button id="buttonInput" onClick={sendText}>
                            <i className="fa fa-arrow-right"/>
                        </button>
                    </div>
                </div>

                <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/mdbassit/Coloris@latest/dist/coloris.min.css"/>
        </div>
    )
}

export default mainFrame