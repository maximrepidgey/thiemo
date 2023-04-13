import {showDetail} from "../static/javascript/ArgueTutorEn";
import {ClapSpinner} from "react-spinners-kit";
import React from "react";
import Swal from "sweetalert";

import {
    CHATBOT_URL,
    computeDashboard,
    getTime, getTopSentences,
    hideEssayField,
    highlightKeyword,
    highlightTopNPolaritySentences,
    highlightTopNSubjectivitySentences,
    showChat,
} from "../static/javascript/ArgueTutorEn";

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
            wasQuestion: false,
            dashboardIsComputed: false,
            topKeywords: [],
            dashboardText: '',
            ascPolSentences: [[]],
            ascSubSentences: [[]],
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
                    }, 25000); // Timeout after 25 seconds
                });
                // use race method in order to check what happens first, response from the bot or timeout
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
                    this.setState({
                        dashboardIsComputed: true,
                        dashboardText: adaptedText,
                        ascPolSentences: sent_polarities,
                        ascSubSentences: sent_subjectivities
                    });
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



        return (
            <div className={"column"}>
                <div className="chatbot">
                    <div className="header">
                        <div className="header-button-bar">
                            <button className="header-button" id="close-dashboard-button" style={{display: "none"}}
                                onClick={closeDashboardButtonClick}>
                                <i className="fa fa-times"/>
                                <span>Dashboard</span>
                            </button>
                            <button className="header-button" id="show-dashboard-button" style={{display: "none"}}
                                    onClick={showDashboardButtonClick}>
                                <i className="fas fa-chart-pie"/>
                                <span>Dashboard</span>
                            </button>
                            <button className="header-button" id="close-essay-field-button" style={{display: "none"}}
                                onClick={closeEssayButtonClick}>
                                <i className="fa fa-times"/>
                                Text field
                            </button>
                            <button className="header-button" id="open-essay-page" style={{display: "none"}}
                                onClick={() => this.showEssayField(this.state.dashboardIsComputed)}>
                                <i className="far fa-file-alt"/>
                                <span>Text field</span>
                            </button>
                        </div>
                    </div>

                    {/* DASHBOARD shows the final evaluation */}
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
                                                           onClick={showSubjectivitySources}> Most influential sentences
                                                            for the
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
                                                        <a href={"javascript:void(0)"}
                                                           onClick={showPolaritySources}> Most influential sentences for
                                                            the polarity decision? </a>

                                                        <h4>Emotionen</h4>
                                                        <progress className={"progress"} id="neutral"
                                                                  title={"On a scale from not applicable at all (0%) to very applicable (100%), this text is:"}
                                                                  max="100" value="90"
                                                                  style={{content: "hello"}}>
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

                    {/*Essay Writing Part*/}
                    <div id="ELEAIframeTemplate">
                        <form method="post">
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
                                             padding: '20px',
                                         }}>
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
                                        <div className="right-half" style={{display: "inline-block", width: "49%"}}>
                                            <div className="keywords" style={{marginRight: "-1rem", display: "inline-block"}}>
                                                Top keywords
                                                <ul id="topKeywords"></ul>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </form>
                        <button className="buttonEval" id="button-eval" onClick={evaluationChatSuggest}>
                            Evaluate the text
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}

export {Evaluation}