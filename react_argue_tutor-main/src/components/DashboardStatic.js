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

    shouldComponentUpdate(nextProps, nextState, nextContext) {
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
            text: props.text,
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
                                                    {ratingsObjectivity.map(({id, text})=> (
                                                        <div id={id} className="col-md-2 border mx-auto rating">{text}</div>
                                                    ))}
                                                </div>
                                                <a href={"javascript:void(0)"}
                                                   onClick={this.props.showSubjectivitySources}> Most influential sentences for the
                                                   {/*> Most influential sentences for the*/}
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
                                                {/*<a href={"javascript:void(0)"}> Most influential sentences for the polarity decision? </a>*/}
                                                <a href={"javascript:void(0)"} onClick={this.props.showPolaritySources}> Most influential sentences for the polarity decision? </a>

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
// use memo to memorize the component data
// export const DashboardStatic = React.memo(DashboardStaticE)


export {DashboardStatic}