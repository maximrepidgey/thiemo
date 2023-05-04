import React from "react";

class DashboardDynamic extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            text: props.text,
            general: props.general,
            readability: props.readability, // is an object {"info": readability, "score": 1.5, "reason": "<text>", "improvement": "<text>"}
            structure: props.structure,
            objectivity: props.objectivity,
            conciseness: props.conciseness,
            infoShow: {
                readability: {reason: false, improvement: false},
                structure: {reason: false, improvement: false},
                objectivity: {reason: false, improvement: false},
                conciseness: {reason: false, improvement: false},
            }
        };
    }

    /*handleReason = (el) => {
        // if close the reason, close also improvement
        if (document.getElementById("text-reason-"+el).className === "show") {
            document.getElementById("text-reason-"+el).className = "hide"
            document.getElementById("button-improvement-"+el).className = "hide"
            document.getElementById("text-improvement-"+el).className = "hide"
        } else {
            document.getElementById("text-reason-"+el).className = "show"
            document.getElementById("button-improvement-"+el).className = "show"
        }
    }*/

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

    // handle the improvement section
    /*handleImprovement = (el) => {
        if (document.getElementById("text-improvement-"+el).className === "show") {
            document.getElementById("text-improvement-"+el).className = "hide"
        } else {
            document.getElementById("text-improvement-"+el).className = "show"
        }
    }*/



    render() {

        const evaluations = [this.state.readability, this.state.structure, this.state.objectivity, this.state.conciseness]

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
                                                        <h6 className="my-2"> {el.info} </h6>
                                                        <progress className={"progress"} id={el.info.toLowerCase()} max="100" value={el.score*2*10}
                                                        title={"On a scale from 1 (bad) to 5 (good), the " +el.info + " is:"}
                                                        style={{content:"hello"}}>
                                                        </progress>
                                                        <div className="progressbarText">{el.score}</div>
                                                            {/*create a link that open explanation*/}
                                                        <a id={"button-reason-" + el.info} onClick={() => this.handleReason(el.info)} className={"show-text-btn"}>
                                                            click to see the reason behind the score
                                                        </a>
                                                        <div id={"text-reason-"+el.info} className={this.state.infoShow[el.info].reason ? "hidden-text show": "hidden-text hide" }>
                                                            <p>{el.reason}</p>
                                                        </div>

                                                        <a id={"button-improvement-" + el.info} onClick={() => this.handleImprovement(el.info)} className={this.state.infoShow[el.info].reason ? "show-text-btn": "show-text-btn hide" }>
                                                            click to see the improvements that you can make
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