import React from "react";

class DashboardDynamic extends React.Component {

    constructor(props) {
        super(props);

        let ratingsObjectivity, ratingsReadability, ratingsStructure, ratingsConciseness;

        const ratingsObjectivityEn = [
            {low: -1, high: 20, text: "Very subjective"},
            {low: 20, high: 40, text: "subjective"},
            {low: 40, high: 60, text: "Neutral"},
            {low: 60, high: 80, text: "Objective"},
            {low: 80, high: 110, text: "Very objective"},
        ]

        const ratingsObjectivityDe = [
            {low: -1, high: 20, text: "Sehr subjektiv"},
            {low: 20, high: 40, text: "subjektiv"},
            {low: 40, high: 60, text: "Neutral"},
            {low: 60, high: 80, text: "Objektiv"},
            {low: 80, high: 110, text: "Sehr objektiv"},
        ]

        const ratingsReadabilityEn = [
            {low: -1, high: 20, text: "Very unreadable"},
            {low: 20, high: 40, text: "Unreadable"},
            {low: 40, high: 60, text: "Neutral"},
            {low: 60, high: 80, text: "Readable"},
            {low: 80, high: 110, text: "Very readable"},
        ]
        const ratingsReadabilityDe = [
            {low: -1, high: 20, text: "Sehr unlesbar"},
            {low: 20, high: 40, text: "unlesbar"},
            {low: 40, high: 60, text: "Neutral"},
            {low: 60, high: 80, text: "Lesbar"},
            {low: 80, high: 110, text: "Sehr Lesbar"},
        ]

        const ratingsStructureEn = [
            {low: -1, high: 20, text: "Very unstructured"},
            {low: 20, high: 40, text: "unstructured"},
            {low: 40, high: 60, text: "Neutral"},
            {low: 60, high: 80, text: "well structured"},
            {low: 80, high: 110, text: "Very well structured"},
        ]

        const ratingsStructureDe = [
            {low: -1, high: 20, text: "Sehr unstrukturiert"},
            {low: 20, high: 40, text: "unstrukturiert"},
            {low: 40, high: 60, text: "Neutral"},
            {low: 60, high: 80, text: "strukturiert gut"},
            {low: 80, high: 110, text: "strukturiert sehr gut"},
        ]

        const ratingsConcisenessEn = [
            {low: -1, high: 20, text: "Not concise"},
            {low: 20, high: 40, text: "Poorly concise"},
            {low: 40, high: 60, text: "Neutral"},
            {low: 60, high: 80, text: "concise"},
            {low: 80, high: 110, text: "Very concise"},
        ]

        const ratingsConcisenessDe = [
            {low: -1, high: 20, text: "Nicht prägnant"},
            {low: 20, high: 40, text: "Wenig prägnant"},
            {low: 40, high: 60, text: "Neutral"},
            {low: 60, high: 80, text: "prägnant"},
            {low: 80, high: 110, text: "Sehr prägnant"},
        ]

        if (props.language === "en") {
            ratingsObjectivity = ratingsObjectivityEn
            ratingsConciseness = ratingsConcisenessEn
            ratingsStructure = ratingsStructureEn
            ratingsReadability = ratingsReadabilityEn
        } else if (props.language === "de") {
            ratingsObjectivity = ratingsObjectivityDe
            ratingsConciseness = ratingsConcisenessDe
            ratingsStructure = ratingsStructureDe
            ratingsReadability = ratingsReadabilityDe
        }


        this.state = {
            text: props.text,
            general: props.general, // attach infoShow to the readability
            // example object {"info": <readability in language>, "score": 1.5, "reason": "<text>", "improvement": "<text>", key: "readability"}
            readability: {...props.readability, ...{reasonShow: false, improvementShow: false, ratings: ratingsReadability}},
            structure: {...props.structure, ...{reasonShow: false, improvementShow: false, ratings: ratingsStructure}},
            objectivity: {...props.objectivity, ...{reasonShow: false, improvementShow: false, ratings: ratingsObjectivity}},
            conciseness: {...props.conciseness, ...{reasonShow: false, improvementShow: false, ratings: ratingsConciseness}},
            language: props.language,
            // infoShow: infoShow,

        };
    }

    /**
     * Handle the reason text. Closes and opens the respective section.
     */
    handleReason = (el) => {
        // if close the reason, close also improvement
        this.setState(prevState => ({
            [el.key]: {...prevState[el.key], reasonShow: !el.reasonShow}
        }))
    }

    /**
     * Handle the improvements text. Closes and opens the respective section.
     */
    handleImprovement = (el) => {
        // if close the reason, close also improvement
        this.setState(prevState => ({
            [el.key]: {...prevState[el.key], improvementShow: !el.improvementShow}
        }))
    }

    /**
     * Return true only for the box within the score falls. Used to highlight the boxes under the score bar.
     */
    computeScore = (scoreAssigned, scoreLow, scoreHigh) => {
        let score = parseInt(scoreAssigned)
        score = score*2*10 // make it like percentage
        return scoreLow <= score && score < scoreHigh;
    }


    render() {

        const evaluations = [this.state.readability, this.state.structure, this.state.objectivity, this.state.conciseness]

        if (this.state.language === "en") {
            return (
                <div id="dashboard-dynamic">
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
                                        <div className="container-fluid text-center"
                                             style={{fontSize: "1.5em", fontWeight: 600}}>
                                            Here is you text
                                        </div>
                                    </div>
                                </div>
                                {/*TEXT*/}
                                <div className="col-md-12 card" style={{maxWidth: "80%", marginLeft: "auto", marginRight: "auto"}}>
                                    <div className="p-2 border p-4" id="userDashboardText"
                                         style={{marginTop: 10, marginBottom: 20, backgroundColor: "azure"}}>
                                        {this.state.text}
                                    </div>
                                </div>
                            </div>
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
                                                    <h4 className={"my-2"}>General feedback</h4>
                                                    <div id={"summary"}>
                                                        {this.state.general}
                                                    </div>

                                                    {evaluations.map(el => (
                                                        <React.Fragment key={el.info}>
                                                            <h6 className="my-2"> {el.info.charAt(0).toUpperCase() + el.info.slice(1)} </h6>
                                                            <progress className={"progress"} id={el.info.toLowerCase()} max="100" value={el.score*2*10}
                                                                      title={"On a scale from 1 (bad) to 5 (good), the " +el.info + " is:"}
                                                                      style={{content:"hello"}}>
                                                            </progress>
                                                            <div className="progressbarText">{el.score}</div>
                                                            <div className="row w-100 text-center mx-auto mt-2" style={{marginBottom: 15}}>
                                                                {el.ratings.map(({low, high, text}) => (
                                                                    <div key={text} className="col-md-2 border mx-auto rating" style={{backgroundColor: this.computeScore(el.score, low, high) ? "rgba(0,255, 0, 0.75)" : "rgba(255, 255, 255, 0.75)"}}>
                                                                        {text}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            {/*create a link that open explanation*/}
                                                            <a id={"button-reason-" + el.key} onClick={() => this.handleReason(el)} className={"show-text-btn"}>
                                                                {el.reasonShow ? "close": "click for explanations"}
                                                            </a>
                                                            <div id={"text-reason-"+el.key} className={el.reasonShow ? "hidden-text show": "hidden-text hide" }>
                                                                <p>{el.reason}</p>
                                                            </div>

                                                            <a id={"button-improvement-" + el.key} onClick={() => this.handleImprovement(el)} className={el.reasonShow ? "show-text-btn": "show-text-btn hide" }>
                                                                {el.improvementShow ? "close": "click to see the improvements that you can make"}
                                                            </a>
                                                            <div id={"text-improvement-"+el.key} className={el.improvementShow &&  el.reasonShow? "hidden-text show": "hidden-text hide" }>
                                                                <p>{el.improvement}</p>
                                                            </div>
                                                        </React.Fragment>
                                                    ))}


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
                <div id="dashboard-dynamic">
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
                                        <div className="container-fluid text-center"
                                             style={{fontSize: "1.5em", fontWeight: 600}}>
                                            Hier ist der Text
                                        </div>
                                    </div>
                                </div>
                                {/*TEXT*/}
                                <div className="col-md-12 card" style={{maxWidth: "80%", marginLeft: "auto", marginRight: "auto"}}>
                                    <div className="p-2 border p-4" id="userDashboardText"
                                         style={{marginTop: 10, marginBottom: 20, backgroundColor: "azure"}}>
                                        {this.state.text}
                                    </div>
                                </div>
                            </div>
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
                                                    <h4 className={"my-2"}>Allgemeines Feedback</h4>
                                                    <div id={"summary"}>
                                                        {this.state.general}
                                                    </div>

                                                    {evaluations.map(el => (
                                                        <React.Fragment key={el.key}>
                                                            <h6 className="my-2"> {el.info.charAt(0).toUpperCase() + el.info.slice(1)} </h6>
                                                            <progress className={"progress"} id={el.info.toLowerCase()} max="100" value={el.score*2*10}
                                                                      title={"Auf einer Skala von 1 (schlecht) bis 5 (gut) die " +el.info + " ist:"}
                                                                      style={{content:"hello"}}>
                                                            </progress>
                                                            <div className="progressbarText">{el.score}</div>
                                                            <div className="row w-100 text-center mx-auto mt-2" style={{marginBottom: 15}}>
                                                                {el.ratings.map(({low, high, text}) => (
                                                                    <div key={text} className="col-md-2 border mx-auto rating" style={{backgroundColor: this.computeScore(el.score, low, high) ? "rgba(0,255, 0, 0.75)" : "rgba(255, 255, 255, 0.75)"}}>
                                                                        {text}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            {/*create a link that open explanation*/}
                                                            <a id={"button-reason-" + el.key} onClick={() => this.handleReason(el)} className={"show-text-btn"}>
                                                                {el.reasonShow ? "schließen": "für Erklärungen anklicken"}
                                                            </a>
                                                            <div id={"text-reason-"+el.key} className={el.reasonShow ? "hidden-text show": "hidden-text hide" }>
                                                                <p>{el.reason}</p>
                                                            </div>

                                                            <a id={"button-improvement-" + el.key} onClick={() => this.handleImprovement(el)} className={el.reasonShow ? "show-text-btn": "show-text-btn hide" }>
                                                                {el.improvementShow ? "schließen": "Klicken Sie, um die Verbesserungen zu sehen, die Sie vornehmen können"}
                                                            </a>
                                                            <div id={"text-improvement-"+el.key} className={el.improvementShow &&  el.reasonShow? "hidden-text show": "hidden-text hide" }>
                                                                <p>{el.improvement}</p>
                                                            </div>
                                                        </React.Fragment>
                                                    ))}


                                                </div>
                                                {/* Reload page function - getting back to the introduction.  */}
                                                <div className="container-fluid text-center">
                                                    <div className="display-8">
                                                        {" "}
                                                        Kontaktieren Sie {" "}
                                                        <a href="mailto:thiemo.wambsganss@epfl.ch">
                                                            thiemo.wambsganss@epfl.ch
                                                        </a>
                                                        , wenn Sie weitere Hilfe benötigen
                                                    </div>
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

export {DashboardDynamic}