import {hidePrivacy, initializeBot} from "../static/javascript/ArgueTutor";
import React, {useState} from "react";

const Privacy = () => {

    const [privacy, setPrivacy] = useState(true);

    /**
     * hide privacy window
     */
    function hidePrivacy() {
        document.getElementById("privacy").style.display = 'none';

        document.querySelectorAll("#open-feedback-button, #open-help-button, #open-Detail-button")
            .forEach(e => e.style.display = '');
        document.getElementById("scrollbox").style.display = '';
        document.getElementById("userInput").style.display = '';
    }
    export {hidePrivacy}

    return (
        <div id="privacy">
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
            <p>
                <button
                    type="button"
                    id="privacy-accept"
                    className="button button-primary"
                    onClick={() => {
                        hidePrivacy();
                        initializeBot(this.updateChatBoxContent);
                    }}
                >
                    I consent.
                </button>
            </p>
        </div>
    )
}

export default Privacy