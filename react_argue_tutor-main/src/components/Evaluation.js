import {ClapSpinner} from "react-spinners-kit";
import React from "react";
import Swal from "sweetalert";

import {
    CHATBOT_URL,
    computeDashboard,
    getTime, getTopSentences,
    highlightKeyword, highlightTopNPolaritySentences, highlightTopNSubjectivitySentences,
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

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log("loading---------")
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
            topKeywords: [],
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
        this.setState({dashboardIsComputed: isDbComputed});
    }

    /**
     * Scrolls to the top of the essay displayed in the dashboard
     */
    scrollUpDashboard = () => {
        let options = {top: 90, left: 0, behavior: 'smooth'};
        document.getElementById("dashboard-static").scroll(options);
        document.getElementById("dashboard-dynamic").scroll(options);
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
                body: JSON.stringify({text: text})
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
            console.log("adapre--=-=-")
            console.log(adaptedText)
            console.log("adapre--=-=-")

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

            this.showDashboardStats(adaptedText);
            console.log("checkpoint 3")

            computeDashboard(subjectivity, polarity, adaptedText, sentences, this.addOnClickToReloadPage, this.state);
            console.log("checkpoint 4")

            this.setState({loading: false, showDashboard: true, dashboardIsComputed: true})

            //     timeout and error handling
        }).catch(() => {
            // todo handle error, pop up a message
            this.setState({dashboardIsComputed: false, loading: false})
        });

    }

    /**
     * Computes the essay stats based on the given input
     *
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



    /**
     * Shows the Dashboard after already having evaluated the essay
     *
     * @param text Essay text
     */
    showDashboardStats = (text) => {
        let characterCount = document.getElementById("characterCountDB");
        let wordCount = document.getElementById("wordCountDashboard");
        let sentenceCount = document.getElementById("sentenceCountDB");
        let paragraphCount = document.getElementById("paragraphCountDB");
        let readingTime = document.getElementById("readingTimeDB");
        let topKeywords = document.getElementById("topKeywordsDB");

        this.computeEssayStats(characterCount, text, wordCount, sentenceCount, paragraphCount, readingTime, topKeywords);
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

                    {/*use awful style reference to avoid unmounting of the component*/}
                    <span style={{display: this.state.showDashboard && this.state.dashboardIsComputed? "": "none"}}>
                        {this.state.dynamic? <DashboardDynamic text={this.state.text}/> :  <DashboardStatic showSubjectivitySources={this.showSubjectivitySources} showPolaritySources={this.showPolaritySources} text={this.state.text}/>}
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
                    {/*{this.state.showDashboard && this.state.dashboardIsComputed ? // renders evaluation dashboard otherwise renders the text box
                        this.state.dynamic ?
                            <DashboardDynamic text={this.state.text}/> :
                            <DashboardStatic text={this.state.text}/>
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
                            <button className="buttonEval" id="button-eval" onClick={this.evaluationChatSuggest}>
                                Evaluate the text
                            </button>
                        </div>
                    }*/}


                </div>
            </div>
        )
    }
}

export {Evaluation}