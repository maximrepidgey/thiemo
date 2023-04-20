import React from "react";

class DashboardDynamic extends React.Component {


    render() {

        return (
            <div id="dashboard">
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
                            {/* Implementation of the text in the dashboard, including the wordcount table*/}
                            <div className="col-md-12 card"
                                 style={{
                                     maxWidth: "80%",
                                     marginLeft: "auto",
                                     marginRight: "auto",
                                 }}>
                                <div className="p-2 border p-4" id="userDashboardText"
                                     style={{
                                         marginTop: 10,
                                         marginBottom: 20,
                                         backgroundColor: "azure",
                                     }}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export {DashboardDynamic}