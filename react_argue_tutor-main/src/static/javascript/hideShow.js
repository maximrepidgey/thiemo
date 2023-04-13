/**
 * show privacy window
 */
function showPrivacy() {
    // document.querySelectorAll("#open-feedback-button, #open-help-button, #open-Detail-button").forEach(e => e.style.display = 'none');
    // document.getElementById("feedback").style.display = 'none';
    // document.getElementById("scrollbox").style.display = 'none';
    // document.getElementById("userInput").style.display = 'none';
    // document.getElementById("chatgpt").style.display = 'none'; activate maybe later
    document.getElementById("privacy").style.display = 'inline-block';
}
export {showPrivacy}



/**
 * displays open feedback button
 */
function showOpenFeedbackButton() {
    document.getElementById("close-feedback-button").style.display = 'none';
    document.getElementById("open-feedback-button").style.display = '';
}
export {showOpenFeedbackButton}


/**
 * displays close feedback button
 */
function showCloseFeedbackButton() {
    document.getElementById("close-feedback-button").style.display = '';
    document.getElementById("open-feedback-button").style.display = 'none';
}
export {showCloseFeedbackButton}

/**
 * hides feedback interface
 */
function hideFeedback() {
    document.getElementById("close-feedback-button").style.display = 'none';
    document.getElementById("feedback").style.display = 'none';

    document.getElementById("scrollbox").style.display = '';
    document.getElementById("userInput").style.display = '';
    document.getElementById("open-feedback-button").style.display = '';
    document.getElementById("open-help-button").style.display = '';
    document.getElementById("open-Detail-button").style.display = '';
}

export {hideFeedback}



/**
 * displays show detail (FAQ) interface
 */
function showDetail() {
    document.getElementById("open-feedback-button").style.display = 'none';
    document.getElementById("open-help-button").style.display = 'none';
    document.getElementById("open-Detail-button").style.display = 'none';
    document.getElementById("scrollbox").style.display = 'none';
    document.getElementById("userInput").style.display = 'none';
    document.getElementById("dashboard").style.display = 'none';
    document.getElementById("close-dashboard-button").style.display = 'none';

    document.getElementById("close-Detail-button").style.display = '';
    document.getElementById("Detail").style.display = 'inline-block';
}

export {showDetail}

/**
 * hides detail (FAQ) interface
 */
function hideDetail() {
    document.getElementById("Detail").style.display = 'none';
    document.getElementById("close-Detail-button").style.display = 'none';

    document.getElementById("open-feedback-button").style.display = '';
    document.getElementById("open-help-button").style.display = '';
    document.getElementById("open-Detail-button").style.display = '';
    document.getElementById("scrollbox").style.display = '';
    document.getElementById("userInput").style.display = '';
}

export {hideDetail}

/**
 * hides essay interface
 */
function hideEssayField() {
    document.getElementById("ELEAIframeTemplate").style.display = 'none';
    document.getElementById("close-essay-field-button").style.display = 'none';
}

export {hideEssayField}

/**
 * shows chat interface
 */
function showChat() {
    document.getElementById("open-feedback-button").style.display = '';
    document.getElementById("open-Detail-button").style.display = '';
    document.getElementById("open-help-button").style.display = '';
    document.getElementById("scrollbox").style.display = '';
    document.getElementById("userInput").style.display = '';
    document.getElementById("open-essay-page").style.display = '';
}
export {showChat}


/**
 * hides help window interface
 */
function hideHelp() {
    document.getElementById("help").style.display = 'none';
    document.getElementById("close-help-button").style.display = 'none';

    document.getElementById("open-feedback-button").style.display = '';
    document.getElementById("open-Detail-button").style.display = '';
    document.getElementById("open-help-button").style.display = '';
    document.getElementById("scrollbox").style.display = '';
    document.getElementById("userInput").style.display = '';
}

export {hideHelp}