import React, { useState } from 'react';
import {showDetail} from "../static/javascript/ArgueTutor";



const Dashboard = () => {


    /**
     * adds restart functionality to the reload button
     */
    const addOnClickToReloadPage = () => {
        document.getElementById("reload-page").addEventListener('click',
            () =>  window.location.reload());
    }

    return(
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
                                    Hier ist Ihr Text
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
                                            Absätze: <span id="paragraphCountDB">0</span>
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
                                        <h3>Top Schlüsselwörter</h3>
                                        (Klicke auf die Wörter, um sie im Text hervorzuheben)
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
                                    Haben Sie Fragen zur Analyse? (
                                    <a href="javascript:void(0);" onClick={() => {
                                        closeDashboardButtonClick();
                                        showDetail();
                                    }}>
                                        Wie wurde mein Text analysiert?
                                    </a>
                                    )
                                </div>
                                <div className="row text-center" style={{height: "auto"}}>
                                    <div className="col-md-12 text-center my-5">
                                        {/* Evaluation section within the Dashboard */}
                                        <h1 style={{borderTopStyle: "solid"}}>
                                            Feedback zur Bewertung
                                        </h1>
                                        <div
                                            className="container my-3"
                                            style={{alignItems: "flex-start"}}
                                        >
                                            <h4 className={"my-2"}>Generierte Zusammenfassung</h4>
                                            <div id={"summary"}></div>

                                            <h4 className="my-2"> Subjektivität/Objektivität</h4>
                                            <progress className={"progress"} id="subjectivityBar"
                                                      title={"Auf einer Skala von sehr objektiv (0%) bis sehr subjektiv (100%) ist dieser Text: "}
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
                                                    Sehr objektiv
                                                </div>
                                                <div
                                                    id="s2"
                                                    className="col-md-2 border mx-auto"
                                                    style={{borderRadius: 10, textAlign: "center"}}
                                                >
                                                    Objektiv
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
                                                    Subjektiv
                                                </div>
                                                <div
                                                    id="s5"
                                                    className="col-md-2 border mx-auto"
                                                    style={{borderRadius: 10, textAlign: "center"}}
                                                >
                                                    Sehr subjektiv
                                                </div>
                                            </div>
                                            <a href={"javascript:void(0)"}
                                               onClick={showSubjectivitySources}> Einflussreichste Sätze für den
                                                Subjektivitätsentscheid? </a>

                                            <h4 className="my-2"> Polarität </h4>
                                            <progress className={"progress"} id="polarityBar"
                                                      title={"Auf einer Skala von sehr negativ (0%) bis sehr positiv (100%) ist dieser Text: "}
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
                                                    Sehr Negativ
                                                </div>
                                                <div
                                                    id="p2"
                                                    className="col-md-2 border mx-auto"
                                                    style={{borderRadius: 10, textAlign: "center"}}
                                                >
                                                    Negativ
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
                                                    Positiv
                                                </div>
                                                <div
                                                    id="p5"
                                                    className="col-md-2 border mx-auto"
                                                    style={{borderRadius: 10, textAlign: "center"}}
                                                >
                                                    Sehr positiv
                                                </div>
                                            </div>
                                            <a href={"javascript:void(0)"} onClick={showPolaritySources}> Einflussreichste Sätze für den Polaritätsentscheid? </a>

                                            <h4>Emotionen</h4>
                                            <progress className={"progress"} id="neutral"
                                                      title={"Auf einer Skala von sehr nicht zutreffend (0%) bis sehr zutreffend (100%) ist dieser Text: "}
                                                      max="100" value="90"
                                                      style={{content:"hello"}}>
                                            </progress>
                                            <div className="progressbarText">{"Neutral"}</div>

                                            <progress className={"progress"} id="disgust"
                                                      title={"Auf einer Skala von sehr nicht zutreffend (0%) bis sehr zutreffend (100%) ist dieser Text: "}
                                                      max="100" value="90">
                                            </progress>
                                            <div className="progressbarText">{"Ekel"}</div>

                                            <progress className={"progress"} id="sadness"
                                                      title={"Auf einer Skala von sehr nicht zutreffend (0%) bis sehr zutreffend (100%) ist dieser Text: "}
                                                      max="100" value="90">
                                            </progress>
                                            <div className="progressbarText">{"Traurigkeit"}</div>

                                            <progress className={"progress"} id="fear"
                                                      title={"Auf einer Skala von sehr nicht zutreffend (0%) bis sehr zutreffend (100%) ist dieser Text: "}
                                                      max="100" value="90">
                                            </progress>
                                            <div className="progressbarText">{"Angst"}</div>

                                            <progress className={"progress"} id="anger"
                                                      title={"Auf einer Skala von sehr nicht zutreffend (0%) bis sehr zutreffend (100%) ist dieser Text: "}
                                                      max="100" value="90">
                                            </progress>
                                            <div className="progressbarText">{"Wut"}</div>

                                            <progress className={"progress"} id="surprise"
                                                      title={"Auf einer Skala von sehr nicht zutreffend (0%) bis sehr zutreffend (100%) ist dieser Text: "}
                                                      max="100" value="90">
                                            </progress>
                                            <div className="progressbarText">{"Überraschung"}</div>

                                            <progress className={"progress"} id="joy"
                                                      title={"Auf einer Skala von sehr nicht zutreffend (0%) bis sehr zutreffend (100%) ist dieser Text: "}
                                                      max="100" value="90">
                                            </progress>
                                            <div className="progressbarText">{"Freude"}</div>
                                        </div>
                                        {/* Feedback on the text */}
                                        <div className="container-fluid text-center cardtwo my-4">
                                            <div
                                                id="dashboard-h2 my-2"
                                                style={{fontSize: "x-large"}}
                                            >
                                                Subjektivität/Objektivität{" "}
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
                                                Polarität{" "}
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
                                                Kontaktieren Sie{" "}
                                                <a href="mailto:thiemo.wambsganss@epfl.ch">
                                                    thiemo.wambsganss@epfl.ch
                                                </a>
                                                , wenn Sie weitere Hilfe benötigen.
                                            </div>
                                            <button
                                                type={"button"}
                                                className="buttonTest"
                                                id="reload-page"
                                                onClick={refreshPage}
                                            >
                                                <span>Neu starten</span>
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
    )
}

export default Dashboard