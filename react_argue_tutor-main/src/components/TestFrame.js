import React from "react";

import {CHATBOT_URL, ready} from "../static/javascript/ArgueTutorEn";

import {Evaluation} from "./Evaluation";
import {Chat} from "./Chat";

class TestFrame extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            chatGPT: false,
            showPrivacy: true,
            showTutor: false,
            showEvaluationSelection: false,
            evaluationDynamic: false,
            test1: false,
            test2: false
        };

        /**
         * Startup of the Chatbot
         */
        // todo create method for code verification
        ready(() => {
            // The following is meant for the login:
            let userName = "";
            // while (!(new RegExp('[a-zA-Z0-9\b]{4}-rdexp$')).test(userName)) {
            //     userName = prompt("Please enter your code :");
            // }
        });
    }

    test = () => {
        let query = document.getElementById("query").value;
        let temperature = document.getElementById("temperature").value;
        let frequencyPenalty = document.getElementById("frequencyPenalty").value;
        let presencePenalty = document.getElementById("presencePenalty").value;
        let n = document.getElementById("n").value;

        /*query += "\n Essay: Travelling to the United States can be a life-changing experience that offers numerous benefits to individuals. From exploring diverse cultures, learning new skills, and expanding one's worldview, the benefits of traveling to the US are numerous.\n" +
            "Firstly, travelling to the US can offer exposure to different cultures, which is an enriching experience that broadens one's perspective. The US is a melting pot of diverse ethnicities, religions, and lifestyles, providing visitors with a unique opportunity to interact with people from different backgrounds\n" +
            "Secondly, traveling to the US offers opportunities to learn new skills and gain knowledge that can be applied in various areakills and enhance their career prospects.\n" +
            "Thirdly, traveling to the US can help individuals to improve their language skills, particularly English, which is a global language of business, education, and communication. Visitors can immerse themselves in the language and culture by interacting with locals, attending language schools, and participating in language exchange programs, which can help to improve their communication skills.\n" +
            "Finally, traveling to the US can be a source of inspiration and motivation, helping individuals to recharge and gain  new places, meeting new people, and experiencing new cultures can be a source of excitement and adventure, which can help to reduce stress and improve mental health.\n" +
            "In conclusion, the benefits of the opportunity to travel to the US to gain new experiences and enhance their personal and professional lives."*/

        query += "\n Text: Broccoli is a vegetable that is often praised for its health benefits. However, in reality, it is the worst vegetable that exists. In this essay, I will argue that broccoli is overrated and should never be consumed.\n" +
            "First and foremost, broccoli has a terrible taste. Its bitter and earthy flavor is enough to make anyone gag. No amount of seasoning or cooking can make it taste good. Therefore, it is not worth consuming.\n" +
            "Additionally, broccoli is a waste of resources. It requires a lot of water and energy to grow and transport, and the result is a flavorless vegetable that no one wants to eat. This makes it a burden on the environment and a waste of resources that could be used for more delicious and valuable crops.\n" +
            "Lastly, broccoli is a dangerous vegetable. It is known to cause gas, bloating, and stomach pain, which can be uncomfortable and even dangerous in some cases. This is because broccoli contains compounds that are hard to digest and can cause digestive problems for many people. Therefore, it should be avoided at all costs.\n" +
            "In conclusion, broccoli is the worst vegetable ever. It tastes terrible, wastes valuable resources, and can be dangerous to consume. It should be removed from our diets and replaced with better, more enjoyable vegetables."
        let text = {
            query: query,
            temperature: temperature,
            frequencyPenalty: frequencyPenalty,
            presencePenalty: presencePenalty,
            n: n
        }

        text = "Broccoli is a vegetable that is often praised for its health benefits. However, in reality, it is the worst vegetable that exists. In this essay, I will argue that broccoli is overrated and should never be consumed.\n" +
            "First and foremost, broccoli has a terrible taste. Its bitter and earthy flavor is enough to make anyone gag. No amount of seasoning or cooking can make it taste good. Therefore, it is not worth consuming.\n" +
            "Additionally, broccoli is a waste of resources. It requires a lot of water and energy to grow and transport, and the result is a flavorless vegetable that no one wants to eat. This makes it a burden on the environment and a waste of resources that could be used for more delicious and valuable crops.\n" +
            "Lastly, broccoli is a dangerous vegetable. It is known to cause gas, bloating, and stomach pain, which can be uncomfortable and even dangerous in some cases. This is because broccoli contains compounds that are hard to digest and can cause digestive problems for many people. Therefore, it should be avoided at all costs.\n" +
            "In conclusion, broccoli is the worst vegetable ever. It tastes terrible, wastes valuable resources, and can be dangerous to consume. It should be removed from our diets and replaced with better, more enjoyable vegetables."

        fetch(CHATBOT_URL + "/evaluate", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({text: text})
        }).then(response => response.json()
        ).then(data => {
            console.log(data)
        })
    }

    render() {
        const showText1 = () => {
            this.setState({test1: !this.state.test1} , () => {
                console.log(this.state.test)
            })
        }
        const showText2 = () => {
            this.setState({test2: !this.state.test2} , () => {
                console.log(this.state.test)
            })
        }

        // render privacy window
        if (this.state.showPrivacy) return (
            <div className={"chatbot"} id="privacy">
                <h3>Declaration of consent</h3>
                <p>Please read the consent form carefully.</p>
                <p>
                    I consent that the content of my messages with the chatbot will be  sent to university
                    servers for the purpose of the speech processing. I also agree that my anonymize data
                    may be used for scientific purposes. I am aware that I can revoke my consent at any time.
                </p>
                <p>
                    We assure full anonymity - an allocation of the collected data points to individual participants is not possible.
                </p>
                <p>
                    If you have any questions about the use of your data, you can contact the organisers of the
                    survey at the following contact details:
                </p>
                <p>
                    <a href="mailto:thiemo.wambsganss@epfl.ch">thiemo.wambsganss@epfl.ch</a>
                </p>
                    <button type="button" id="privacy-accept" className="button button-primary"
                            onClick={() => {// hide privacy and show introduction screen
                                this.setState({showPrivacy: false, showTutor: true})}}>
                        I consent.
                    </button>
                    <div>
                        <label>
                            query:
                            <textarea id={"query"}/>
                        </label>
                        <input type={"text"} id={"temperature"}/>
                        <input type={"text"} id={"frequencyPenalty"}/>
                        <input type={"text"} id={"presencePenalty"}/>
                        <input type={"text"} id={"n"}/>
                        <button type={"button"} id={"testb"} onClick={this.test}>
                            submit
                        </button>
                        <div id={"res"}>

                        </div>
                    </div>
                <a id="show-text-btn" className={"show-text-btn"} onClick={showText1}>Show Hidden Text</a>
                <div id="hidden-text"  className={this.state.test1 ? " hidden-text show": "hidden-text hide" }>
                    <p>This is the hidden text that will appear with animation when the button is clicked. This is the hidden text that will appear with animation when the button is clicked. This is the hidden text that will appear with animation when the button is clicked. This is the hidden text that will appear with animation when the button is clicked. This is the hidden text that will appear with animation when the button is clicked. </p>
                </div><br/>
                <a id="show-text-btn" className={"show-text-btn"} onClick={showText2}>Show Hidden Text</a>
                <div id="hidden-text"  className={this.state.test2 ? " hidden-text show": "hidden-text hide" }>
                    <p>This is the hidden text that will appear with animation when the button is clicked. This is the hidden text that will appear with animation when the button is clicked. This is the hidden text that will appear with animation when the button is clicked. This is the hidden text that will appear with animation when the button is clicked. This is the hidden text that will appear with animation when the button is clicked. </p>
                </div>
            </div>)
        // render introduction screen
        else if (this.state.showTutor) return (
            <div className={"chatbot"} id={"tutor"}>
                <h3>Choose the chatbot modality</h3>
                <p>Choose the chatbot modality that you have been assigned</p>
                <button type={"button"} className={"button button-primary"}
                        onClick={() => this.setState({showTutor: false, chatGPT: false, showEvaluationSelection: true})}>
                    Static
                </button>
                <button type={"button"} className={"button button-sec"}
                        onClick={() => this.setState({showTutor: false, chatGPT: true, showEvaluationSelection: true})}>
                    Dynamic
                </button>

            </div>
        )
        else if (this.state.showEvaluationSelection) return (
            <div className={"chatbot"} id={"tutor"}>
                <h3>Choose the evaluation method</h3>
                Choose the evaluation that you have been assigned <br/>
                If you have made a mistake, just reload the page <br/>
                <button type={"button"} className={"button button-primary"}
                        onClick={() => this.setState({showEvaluationSelection: false, evaluationDynamic: false})}>
                    Static
                </button>
                <button type={"button"} className={"button button-sec"}
                        onClick={() => this.setState({showEvaluationSelection: false, evaluationDynamic: true})}>
                    Dynamic
                </button>
            </div>
        )
        // render the main chatbot
        else return (
            <div>
                <div className={"columns"}>
                    <Chat chatGPT={this.state.chatGPT}/>
                    <Evaluation dynamic={this.state.evaluationDynamic}/>
                </div>
            </div>
        );
    }
}

export {TestFrame}