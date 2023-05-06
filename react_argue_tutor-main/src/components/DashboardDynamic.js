import React from "react";

class DashboardDynamic extends React.Component {

    constructor(props) {
        super(props);

        const ratingsObjectivity = [
            {low: -1, high: 20, text: "Very subjective"},
            {low: 20, high: 40, text: "subjective"},
            {low: 40, high: 60, text: "Neutral"},
            {low: 60, high: 80, text: "Objective"},
            {low: 80, high: 110, text: "Very objective"},
        ]

        const ratingsReadability = [
            {low: -1, high: 20, text: "Very unreadable"},
            {low: 20, high: 40, text: "Unreadable"},
            {low: 40, high: 60, text: "Neutral"},
            {low: 60, high: 80, text: "Readable"},
            {low: 80, high: 110, text: "Very readable"},
        ]

        const ratingsStructure = [
            {low: -1, high: 20, text: "Very unstructured"},
            {low: 20, high: 40, text: "unstructured"},
            {low: 40, high: 60, text: "Neutral"},
            {low: 60, high: 80, text: "well structured"},
            {low: 80, high: 110, text: "Very well structured"},
        ]

        const ratingsConciseness = [
            {low: -1, high: 20, text: "Not concise at all"},
            {low: 20, high: 40, text: "Not concise"},
            {low: 40, high: 60, text: "Neutral"},
            {low: 60, high: 80, text: "concise"},
            {low: 80, high: 110, text: "Very concise"},
        ]

        this.state = {
            text: props.text,
            general: props.general,
            readability: props.readability, // is an object {"info": readability, "score": 1.5, "reason": "<text>", "improvement": "<text>"}
            structure: props.structure,
            objectivity: props.objectivity,
            conciseness: props.conciseness,
            infoShow: {
                readability: {reason: false, improvement: false, ratings: ratingsReadability},
                structure: {reason: false, improvement: false, ratings: ratingsStructure},
                objectivity: {reason: false, improvement: false, ratings: ratingsObjectivity},
                conciseness: {reason: false, improvement: false, ratings: ratingsConciseness},
            }
        };
    }

    handleReason = (el) => {
        // if close the reason, close also improvement
        this.setState(prevState => ({
            ...prevState,
            infoShow: {
                ...prevState.infoShow,
                [el]: {reason: !this.state.infoShow[el].reason, improvement: this.state.infoShow[el].improvement}
            }
        }))
    }

    handleImprovement = (el) => {
        // if close the reason, close also improvement
        this.setState(prevState => ({
            ...prevState,
            infoShow: {
                ...prevState.infoShow,
                [el]: {reason: this.state.infoShow[el].reason, improvement: !this.state.infoShow[el].improvement}
            }
        }))
    }

    computeScore = (scoreAssigned, scoreLow, scoreHigh) => {
        let score = parseInt(scoreAssigned)
        score = score*2*10 // make it like percentage
        return scoreLow <= score && score < scoreHigh;
    }


    render() {

        const evaluations = [this.state.readability, this.state.structure, this.state.objectivity, this.state.conciseness]

        // const ratingsObjectivity = ["Very subjective", "Subjective", "Neutral", "Objective", "Very objective",]

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
                                                            {this.state.infoShow[el.info].ratings.map(({low, high, text}) => (
                                                                <div key={text} className="col-md-2 border mx-auto rating" style={{backgroundColor: this.computeScore(el.score, low, high) ? "rgba(0,255, 0, 0.75)" : "rgba(255, 255, 255, 0.75)"}}>
                                                                    {text}
                                                                </div>
                                                            ))}
                                                        </div>
                                                            {/*create a link that open explanation*/}
                                                        <a id={"button-reason-" + el.info} onClick={() => this.handleReason(el.info)} className={"show-text-btn"}>
                                                            {this.state.infoShow[el.info].reason ? "close": "click for explanations"}
                                                        </a>
                                                        <div id={"text-reason-"+el.info} className={this.state.infoShow[el.info].reason ? "hidden-text show": "hidden-text hide" }>
                                                            <p>{el.reason}</p>
                                                        </div>

                                                        <a id={"button-improvement-" + el.info} onClick={() => this.handleImprovement(el.info)} className={this.state.infoShow[el.info].reason ? "show-text-btn": "show-text-btn hide" }>
                                                            {this.state.infoShow[el.info].improvement ? "close": "click to see the improvements that you can make"}
                                                        </a>
                                                        <div id={"text-improvement-"+el.info} className={this.state.infoShow[el.info].improvement &&  this.state.infoShow[el.info].reason? "hidden-text show": "hidden-text hide" }>
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
    }
}

export {DashboardDynamic}