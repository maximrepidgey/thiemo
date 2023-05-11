import React from 'react';
import {
    highlightKeyword
} from "../static/javascript/ArgueTutorEn";

class DashboardStatic extends React.Component{

    componentDidMount() {
        const that = this;

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
            dashboardText: '',
            text: props.text,
            language: props.language
        };
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
        document.getElementById("dashboard-static").scroll(options);
    }


    render() {

        const ratingsObjectivityDe = [
            {id: "s1", text: "Sehr objektiv"},
            {id: "s2", text: "Objektiv"},
            {id: "s3", text: "Neutral"},
            {id: "s4", text: "Subjektiv"},
            {id: "s5", text: "Sehr subjektiv"},
        ]
        const ratingsObjectivityEn = [
            {id: "s1", text: "Very objective"},
            {id: "s2", text: "Objective"},
            {id: "s3", text: "Neutral"},
            {id: "s4", text: "Subjective"},
            {id: "s5", text: "Very subjective"},
        ]

        const ratingsEmotionsEn = [
            {id: "p1", text: "Very Negative"},
            {id: "p2", text: "Negative"},
            {id: "p3", text: "Neutral"},
            {id: "p4", text: "Positive"},
            {id: "p5", text: "Very Positive"},
        ]

        const ratingsEmotionsDe = [
            {id: "p1", text: "Sehr Negativ"},
            {id: "p2", text: "Negativ"},
            {id: "p3", text: "Neutral"},
            {id: "p4", text: "Positiv"},
            {id: "p5", text: "Sehr Positiv"},
        ]

        if (this.state.language === "en") {
            return (
                <div id="dashboard-static">
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
                                                    Reading time: <span id="readingTimeDB">0</span>
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
                                                <ul id="topKeywordsDB"/>
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
                                        <div className="row text-center" style={{height: "auto"}}>
                                            <div className="col-md-12 text-center my-5">
                                                {/* Evaluation section within the Dashboard */}
                                                <h1 style={{borderTopStyle: "solid"}}>
                                                    Evaluation feedback
                                                </h1>
                                                <div className="container my-3" style={{alignItems: "flex-start"}}>
                                                    <h4 className={"my-2"}>Generated summary</h4>
                                                    <div id={"summary"}>
                                                        {this.state.text}
                                                    </div>

                                                    <h4 className="my-2"> Subjectivity/Objectivity </h4>
                                                    <progress className={"progress"} id="subjectivityBar" max="100" value="90"
                                                              title={"On a scale from very objective (0%) to very subjective (100%), this text is: "}>
                                                    </progress>
                                                    <div className="row w-100 text-center mx-auto mt-2" style={{marginBottom: 15}}>
                                                        {ratingsObjectivityEn.map(({id, text})=> (
                                                            <div key={id} id={id} className="col-md-2 border mx-auto rating">{text}</div>
                                                        ))}
                                                    </div>
                                                    <a onClick={this.props.showSubjectivitySources} className={"sentences"}>
                                                        Most influential sentences for the subjectivity decision?
                                                    </a>

                                                    <h4 className="my-2"> Polarity </h4>
                                                    <progress className={"progress"} id="polarityBar" max="100" value="90"
                                                              title={"On a scale from very negative (0%) to very positive (100%), this text is: "}>
                                                    </progress>
                                                    <div className="row w-100 text-center mx-auto mt-2" style={{marginBottom: 20}}>
                                                        {ratingsEmotionsEn.map(({id, text})=> (
                                                            <div id={id} key={id} className="col-md-2 border mx-auto rating">{text}</div>
                                                        ))}
                                                    </div>
                                                    <a onClick={this.props.showPolaritySources} className={"sentences"}>
                                                        Most influential sentences for the polarity decision?
                                                    </a>

                                                    <h4>Emotions</h4>
                                                    {["Neutral", "Disgust", "Sadness", "Fear", "Anger", "Surprise", "Joy"].map((text) => (
                                                        <React.Fragment key={text}>
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
                                                    <div id="writtenSubjectivity" className="text-black-50" style={{fontSize: "16px"}} />
                                                    <div id="dashboard-h2 my-2" style={{fontSize: "x-large"}}>
                                                        {" "}
                                                        Polarity{" "}
                                                    </div>
                                                    <div id="writtenPolarity" className="text-black-50" style={{fontSize: "16px", marginBottom: 30}}/>
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
                                                    {/*<button type={"button"} className="buttonTest" id="reload-page">
                                                <button type={"button"} className="buttonTest" id="reload-page" onClick={refreshPage}>
                                                    <span>Start again</span>
                                                </button>*/}
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
        } else if (this.state.language === "de") {
            return (
                <div id="dashboard-static">
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
                                            Hier ist Ihr Text
                                        </div>
                                    </div>
                                </div>
                                {/* Implementation of the text in the dashboard, including the wordcount table*/}
                                <div className="col-md-12 card" style={{maxWidth: "80%", marginLeft: "auto", marginRight: "auto"}}>
                                    <div className="p-2 border p-4" id="userDashboardText"
                                         style={{marginTop: 10, marginBottom: 20, backgroundColor: "azure"}}/>
                                    {/* Wordcount section whithin the dashboard */}
                                    <section className="container" style={{maxWidth: 1000}}>
                                        <div
                                            className="left-half"
                                            style={{display: "inline-block", width: "50%"}}
                                        >
                                            <div className="output row" style={{marginLeft: "-1rem"}}>
                                                <div>
                                                    Zeichen: <span id="characterCountDB">0</span>
                                                </div>
                                                <div>
                                                    Wörter: <span id="wordCountDashboard">0</span>
                                                </div>
                                            </div>
                                            <div className="output row" style={{marginLeft: "-1rem"}}>
                                                <div>
                                                    Sätze: <span id="sentenceCountDB">0</span>
                                                </div>
                                                <div>
                                                    Paragraphen: <span id="paragraphCountDB">0</span>
                                                </div>
                                            </div>
                                            <div className="output row" style={{marginLeft: "-1rem"}}>
                                                <div>
                                                    Lesezeit: <span id="readingTimeDB">0</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="right-half" style={{display: "inline-block", width: "49%"}}>
                                            <div className="keywords" style={{marginRight: "-1rem"}}>
                                                <h3>Top Schlüsselw</h3>
                                                (Klicke auf die Wörter, um sie im Text hervorzuheben)
                                                <ul id="topKeywordsDB"/>
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
                                        <div className="row text-center" style={{height: "auto"}}>
                                            <div className="col-md-12 text-center my-5">
                                                {/* Evaluation section within the Dashboard */}
                                                <h1 style={{borderTopStyle: "solid"}}>
                                                    Feedback zur Bewertung
                                                </h1>
                                                <div className="container my-3" style={{alignItems: "flex-start"}}>
                                                    <h4 className={"my-2"}> Generierte Zusammenfassung </h4>
                                                    <div id={"summary"}>
                                                        {this.state.text}
                                                    </div>

                                                    <h4 className="my-2"> Subjektivität/Objektivität </h4>
                                                    <progress className={"progress"} id="subjectivityBar" max="100" value="90"
                                                              title={"Auf einer Skala von sehr objektiv (0%) bis sehr subjektiv (100%) ist dieser Text: "}>
                                                    </progress>
                                                    <div className="row w-100 text-center mx-auto mt-2" style={{marginBottom: 15}}>
                                                        {ratingsObjectivityDe.map(({id, text})=> (
                                                            <div key={id} id={id} className="col-md-2 border mx-auto rating">{text}</div>
                                                        ))}
                                                    </div>
                                                    <a onClick={this.props.showSubjectivitySources} className={"sentences"}>
                                                        Einflussreichste Sätze für den Subjektivitätsentscheid?
                                                    </a>

                                                    <h4 className="my-2"> Polarität </h4>
                                                    <progress className={"progress"} id="polarityBar" max="100" value="90"
                                                              title={"Auf einer Skala von sehr negativ (0%) bis sehr positiv (100%) ist dieser Text: "}>
                                                    </progress>
                                                    <div className="row w-100 text-center mx-auto mt-2" style={{marginBottom: 20}}>
                                                        {ratingsEmotionsDe.map(({id, text})=> (
                                                            <div id={id} key={id} className="col-md-2 border mx-auto rating">{text}</div>
                                                        ))}
                                                    </div>
                                                    <a onClick={this.props.showPolaritySources} className={"sentences"}>
                                                        Einflussreichste Sätze für den Polaritätsentscheid?
                                                    </a>

                                                    <h4>Emotionen</h4>
                                                    {[{id: "Neutral", emotion: "Neutral"},{id: "Disgust", emotion: "Ekel"}, {id: "Sadness", emotion: "Traurigkeit"}, {id: "Fear", emotion: "Angst"}, {id: "Anger", emotion: "Wut"}, {id: "Joy", emotion: "Überraschung"} ,{id: "Surprise", emotion: "Freude"}].map(({ id, emotion}) => (
                                                        <React.Fragment key={id}>
                                                            <progress className={"progress"} id={id.toLowerCase()} max="100" value="90"
                                                                      title={"Auf einer Skala von sehr nicht zutreffend (0%) bis sehr zutreffend (100%) ist dieser Text: "}
                                                                      style={{content:"hello"}}>
                                                            </progress>
                                                            <div className="progressbarText">{emotion}</div>
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                                {/* Feedback on the text */}
                                                <div className="container-fluid text-center cardtwo my-4">
                                                    <div id="dashboard-h2 my-2" style={{fontSize: "x-large"}}>
                                                        Subjektivität/Objektivität{" "}
                                                    </div>
                                                    <div id="writtenSubjectivity" className="text-black-50" style={{fontSize: "16px"}} />
                                                    <div id="dashboard-h2 my-2" style={{fontSize: "x-large"}}>
                                                        {" "}
                                                        Polarität{" "}
                                                    </div>
                                                    <div id="writtenPolarity" className="text-black-50" style={{fontSize: "16px", marginBottom: 30}}/>
                                                </div>
                                                {/* Reload page function - getting back to the introduction.  */}
                                                <div className="container-fluid text-center">
                                                    <div className="display-8">
                                                        {" "}
                                                        Kontaktieren Sie {" "}
                                                        <a href="mailto:thiemo.wambsganss@epfl.ch">
                                                            thiemo.wambsganss@epfl.ch
                                                        </a>
                                                        , wenn Sie weitere Hilfe benötigen.
                                                    </div>
                                                    {/*<button type={"button"} className="buttonTest" id="reload-page">
                                                <button type={"button"} className="buttonTest" id="reload-page" onClick={refreshPage}>
                                                    <span>Start again</span>
                                                </button>*/}
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
}

export {DashboardStatic}