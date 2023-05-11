import Swal from "sweetalert";

import stopWordsEn from "../stop_words_english.json"
import stopWordsDe from "../stop_words_german.json"
const CHATBOT_URL = "http://127.0.0.1:8006";
export {CHATBOT_URL}


/**
 * start up function
 *
 * @param fn
 *          is called when the document is ready
 */
function ready(fn) {
    if (document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}
export {ready}

/**
 * Get current time
 *
 * @returns {string} current time
 */
function getTime() {
    let date = new Date(Date.now());
    let hours = date.getHours();
    let minutes = date.getMinutes();
    return hours + ":" + ((minutes < 10) ? "0" : "") + minutes;
}

export {getTime}


/**
 * Computes the essay stats based on the given input
 *
 */
const computeEssayStats = (text, language) => {
    let characterCount = document.getElementById("characterCountDB");
    let wordCount = document.getElementById("wordCountDashboard");
    let sentenceCount = document.getElementById("sentenceCountDB");
    let paragraphCount = document.getElementById("paragraphCountDB");
    let readingTime = document.getElementById("readingTimeDB");
    let topKeywords = document.getElementById("topKeywordsDB");

    characterCount.innerHTML = text.length;

    let words = text.match(/[-?(\w+)äöüÄÖÜß]+/gi);

    if (words === null) {
        wordCount.innerHTML = 0;
        sentenceCount.innerHTML = 0;
        paragraphCount.innerHTML = 0;
        readingTime.innerHTML = "0s";
        topKeywords.style.display = "none";

        return;
    }

    wordCount.innerHTML = words.length;
    sentenceCount.innerHTML = text.split(/[.!?]+/g).length - 1;
    paragraphCount.innerHTML = text.replace(/\n$/gm, '').split(/\n/).length;

    const seconds = Math.ceil(words.length * 60 / 275);
    if (seconds > 59) {
        let minutes = Math.floor(seconds / 60);
        const actualSeconds = seconds - minutes * 60;
        readingTime.innerHTML = minutes + "m " + actualSeconds + "s";
    } else {
        readingTime.innerHTML = seconds + "s";
    }

    let nonStopWords = [];

    let stopWords;
    if (language === "en") stopWords = stopWordsEn
    else if (language === "de") stopWords = stopWordsDe
    for (let i = 0; i < words.length; i++) {
        if (stopWords.indexOf(words[i].toLowerCase()) === -1 && isNaN(words[i])) {
            nonStopWords.push(words[i].toLowerCase());
        }
    }
    let keywords = {};
    for (let i = 0; i < nonStopWords.length; i++) {
        if (nonStopWords[i] in keywords) {
            keywords[nonStopWords[i]] += 1;
        } else {
            keywords[nonStopWords[i]] = 1;
        }
    }
    let sortedKeywords = [];
    for (let keyword in keywords) {
        sortedKeywords.push([keyword, keywords[keyword]])
    }
    sortedKeywords.sort(function (a, b) {
        return b[1] - a[1]
    });

    // this.setState({topKeywords: sortedKeywords.slice(0, 4)});
    topKeywords.innerHTML = "";
    for (let i = 0; i < sortedKeywords.length && i < 4; i++) {
        let li = document.createElement('li');
        li.innerHTML = "<b>" + sortedKeywords[i][0] + "</b>: " + sortedKeywords[i][1];

        topKeywords.appendChild(li);
    }

    topKeywords.style.display = "block";

    return sortedKeywords.slice(0, 4)
}

export {computeEssayStats}



/**
 * clears the background colors of the boxes for subjectivity and polarity in the dashboard
 */
function clearDashboardBoxes() {
    //subjectivity
    document.getElementById("s1").style.backgroundColor = "";
    document.getElementById("s2").style.backgroundColor = "";
    document.getElementById("s3").style.backgroundColor = "";
    document.getElementById("s4").style.backgroundColor = "";
    document.getElementById("s5").style.backgroundColor = "";

    //polarity
    document.getElementById("p1").style.backgroundColor = "";
    document.getElementById("p2").style.backgroundColor = "";
    document.getElementById("p3").style.backgroundColor = "";
    document.getElementById("p4").style.backgroundColor = "";
    document.getElementById("p5").style.backgroundColor = "";
}


/**
 * Highlights the top 'n' sentences of 'sentsToHighlight' or all if it contains fewer than n elements
 *
 * @param text
 *          essay text
 * @param sentsToHighlight
 *          sentences to highlight
 * @param n
 *          number of sentences to highlight
 * @param title
 * @returns {string} html string containing the highlighted sentences
 */
function highlightTopNSentences(text, sentsToHighlight, n, title) {
    let html = "<span>" + text + "</span>";
    html = html.replaceAll('\n', '<br/>');

    let posIdx = 0;
    let negIdx = 0;
    let neutIdx = 0;
    for (let i = 0; i < Math.min(sentsToHighlight.length, n); i++) {
        let word = sentsToHighlight[i][0];
        let polarity = title + sentsToHighlight[i][1].toFixed(2);

        let posNeg = "";
        if (sentsToHighlight[i][1] >= 0.1) {
            posNeg = posIdx + "pos";
            posIdx++;
        } else if (sentsToHighlight[i][1] <= -0.1) {
            posNeg = negIdx + "neg";
            negIdx++;
        } else {
            posNeg = neutIdx + "neut";
            neutIdx++;
        }

        html = html.replace(word, '</span><span class=\"annotation-' + posNeg + '\" title=' + polarity + '>' + word + '</span>');
    }
    return html;
}


/**
 * Highlights the top 'n' polar sentences of 'sentsToHighlight' or all if it contains fewer than n elements
 *
 * @param text
 *          essay text
 * @param sentsToHighlight
 *          sentences to highlight
 * @param n
 *          number of sentences to highlight
 * @param language
 * @returns {string} html string containing the highlighted sentences
 */
function highlightTopNPolaritySentences(text, sentsToHighlight, n, language) {
    let title;
    if (language === "en") title = 'On&nbsp;a&nbsp;scale&nbsp;from&nbsp;very&nbsp;negative&nbsp;(-1)&nbsp;to&nbsp;very&nbsp;positive&nbsp;(1)&nbsp;this&nbsp;sentence&nbsp;is:&nbsp;';
    else if (language === "de") title = 'Auf&nbsp;einer&nbsp;Skala&nbsp;von&nbsp;sehr&nbsp;negativ&nbsp;(-1)&nbsp;bis&nbsp;sehr&nbsp;positiv&nbsp;(1)&nbsp;ist&nbsp;dieser&nbsp;Satz:&nbsp;';

    return highlightTopNSentences(text, sentsToHighlight, n, title);
}
export {highlightTopNPolaritySentences}


/**
 * Highlights the top 'n' subjective sentences of 'sentsToHighlight' or all if it contains fewer than n elements
 *
 * @param text
 *          essay text
 * @param sentsToHighlight
 *          sentences to highlight
 * @param n
 *          number of sentences to highlight
 * @param language
 * @returns {string} html string containing the highlighted sentences
 */
function highlightTopNSubjectivitySentences(text, sentsToHighlight, n, language) {
    // to also display a value between -1 and 1
    let subjAdapted = sentsToHighlight.map(x => [x[0], 2*x[1] - 1]);
    let title;
    if (language === "en") title = 'On&nbsp;a&nbsp;scale&nbsp;from&nbsp;very&nbsp;objective&nbsp;(-1)&nbsp;to&nbsp;very&nbsp;subjective&nbsp;(1)&nbsp;this&nbsp;sentence&nbsp;is:&nbsp;';
    else if (language === "de") title = 'Auf&nbsp;einer&nbsp;Skala&nbsp;von&nbsp;sehr&nbsp;objektiv&nbsp;(-1)&nbsp;bis&nbsp;sehr&nbsp;subjektiv&nbsp;(1)&nbsp;ist&nbsp;dieser&nbsp;Satz:&nbsp;';

    return highlightTopNSentences(text, subjAdapted, n, title);
}

export {highlightTopNSubjectivitySentences}


/**
 * Extracts the top sentences in the list based on the value (used for polarity and subjectivity sources)
 *
 * @param value
 *          value on which to base the extraction
 * @param ascendingSentences
 *          ordered array
 * @returns {*[]|*} top sentences
 */
function getTopSentences(value, ascendingSentences) {
    let sentencesToHighlight;
    let length = ascendingSentences.length;
    if (value > 60) {
        sentencesToHighlight = ascendingSentences.slice(-2).reverse();
        if (value < 80 && length > 2) {
            sentencesToHighlight.push(ascendingSentences[0])
        }
    } else if (value < 40) {
        sentencesToHighlight = ascendingSentences.slice(0, 2);
        if (value > 20 && length > 2) {
            sentencesToHighlight.push(ascendingSentences[length - 1])
        }
    } else {
        sentencesToHighlight = length > 2
            ? [ascendingSentences[length - 1], ascendingSentences[0]]
            : ascendingSentences;
    }
    return sentencesToHighlight;
}
export {getTopSentences}

/**
 * highlights all words in the text that are contained in 'wordsToHighlight'
 *
 * @param text
 *          text in which to highlight
 * @param keyword
 *          words to be highlighted in the text
 * @returns {string}
 *          html string with the given highlights
 */
function highlightKeyword(text, keyword) {
    let html = "<span>" + text + "</span>";
    html = html.replaceAll('\n', '<br/>');

    // removes potential special characters in the beginning or at the end of the word
    let word = keyword.replace(/[.,!?]/g, "");


    // removes the first letter of the word and joins it in the end
    // words beginning with Umlauts cannot use the \b property in the RegExp since that doesn't support utf-8 characters
    if (word[0] === "ö" || word[0] === "Ö" || word[0] === "ä" || word[0] === "Ä" || word[0] === "ü" || word[0] === "Ü") {
        html = html.replace(new RegExp(word[0].toUpperCase() + word.slice(1), 'gu'), '</span><span class=\"annotation-0\">' + word[0].toUpperCase() + word.slice(1) + '</span>')
        html = html.replace(new RegExp(word[0].toLowerCase() + word.slice(1), 'gu'), '</span><span class=\"annotation-0\">' + word[0].toLowerCase() + word.slice(1) + '</span>')
    } else {
        html = html.replace(new RegExp("\\b" + word[0].toUpperCase() + word.slice(1) + "\\b", 'gu'), '</span><span class=\"annotation-0\">' + word[0].toUpperCase() + word.slice(1) + '</span>')
        html = html.replace(new RegExp("\\b" + word[0].toLowerCase() + word.slice(1) + "\\b", 'gu'), '</span><span class=\"annotation-0\">' + word[0].toLowerCase() + word.slice(1) + '</span>')
    }
    return html;
}

export {highlightKeyword}

/**
 * makes clickable links out the of the top keywords that enable highlighting them in the essay text
 *
 * @param text
 *          essay text
 * @param topKeywords
 *          current react state
 * @returns {string} adapted html string
 */
function addHighlighFunctionalityToTopKeywords(text, topKeywords) {
    topKeywords = topKeywords.map(arr => arr[0]);

    for (let i = 0; i < topKeywords.length; i++) {
        let html = document.getElementById("topKeywordsDB").innerHTML;
        let replacement = '<a href="javascript:void(0);" onclick="highlightTopKeywordsWindow(\'' + topKeywords[i] + '\');">' + topKeywords[i] + '</a>';

        if (topKeywords[i][0] === "ö" || topKeywords[i][0] === "Ö" || topKeywords[i][0] === "ä" || topKeywords[i][0] === "Ä" || topKeywords[i][0] === "ü" || topKeywords[i][0] === "Ü") {
            html = html.replaceAll(new RegExp(topKeywords[i], 'gu'), replacement)
        } else {
            html = html.replaceAll(new RegExp("\\b" + topKeywords[i] + "\\b", 'gu'), replacement);
        }


        document.getElementById("topKeywordsDB").innerHTML = html;
    }

    let html = "<span>" + text + "</span>";
    return html.replaceAll('\n', '<br/>');
}


/**
 * computes the dashboard elements based on the given arguments
 *
 * @param subjectivity
 * @param polarity
 * @param userText
 * @param sentences
 * @param addOnClickToReloadPage
 * @param topKeywords
 * @param language
 */
function computeDashboard(subjectivity, polarity, userText, sentences, addOnClickToReloadPage, topKeywords, language) {
    let box = "s";
    let box2 = "p";

    clearDashboardBoxes();
    console.log("check 1")

    // addOnClickToReloadPage()


    document.getElementById('userDashboardText').innerHTML = addHighlighFunctionalityToTopKeywords(userText, topKeywords);
    console.log("check 2")


    if (0.0 <= subjectivity && subjectivity <= 0.2) box += "1";
    if (0.2 < subjectivity && subjectivity <= 0.4) box += "2";
    if (0.4 < subjectivity && subjectivity <= 0.6) box += "3";
    if (0.6 < subjectivity && subjectivity <= 0.8) box += "4";
    if (0.8 < subjectivity && subjectivity <= 1.0) box += "5";
    document.getElementById(box).style.backgroundColor = "rgba(0,255, 0, 0.75)";
    console.log("check 3")

    if (-1.0 <= polarity && polarity <= -0.6) box2 += "1";
    if (-0.6 < polarity && polarity <= -0.2) box2 += "2";
    if (-0.2 < polarity && polarity <= 0.2) box2 += "3";
    if (0.2 < polarity && polarity <= 0.6) box2 += "4";
    if (0.6 < polarity && polarity <= 1.0) box2 += "5";
    console.log("check 4")

    document.getElementById(box2).style.backgroundColor = "rgba(0,255, 0, 0.75)";
    if (language === "en") {
        writtenPolarity(polarity);
        writtenSubjectivity(subjectivity);
        console.log("check 5")
        Swal({
            title: 'Your Dashboard is ready!',
            text: 'You can now view the analysis results. This is the last screen. To start the process again, you can scroll down and return to the introduction!',
            icon: 'success',
            confirmButtonText: 'Show results',
            confirmButtonColor: '#00762C'
        })
    } else if (language === "de") {
        writtenPolarityDE(polarity)
        writtenSubjectivityDE(subjectivity)
        Swal({
            title: 'Ihr Dashboard ist fertig!',
            text: 'Sie können sich nun die Analyseergebnisse ansehen. Dies ist der letzte Bildschirm. Um den Prozess erneut zu starten, können Sie nach unten scrollen und zur Einleitung zurückkehren!',
            icon: 'success',
            confirmButtonText: 'Ergebnisse anzeigen',
            confirmButtonColor: '#00762C'
        })
    }
}

export {computeDashboard}

/**
 * Computes the displayed text based on the polarity of the essay
 *
 * @param polarity
 *          polarity of the essay
 */
function writtenPolarity(polarity) {
    let result;
    if (-1.0 <= polarity && polarity <= -0.6) {
        result = "Your text is written in a very negative way. It seems that your text contains many negative terms and is therefore placed in this section."
    }
    if (-0.6 < polarity && polarity <= -0.2) {
        result = "Your text is written in a negative way. It seems that your text contains some negative terms and is therefore placed in this section."
    }
    if (-0.2 < polarity && polarity <= 0.2) {
        result = "Your text is written in a neutral way. There are no extremes in terms of positivity or negativity."
    }
    if (0.2 < polarity && polarity <= 0.6) {
        result = "Your text is written in a positive way. It seems that your text contains some positive terms and is therefore classified in this area."
    }
    if (0.6 < polarity && polarity <= 1.0) {
        result = "Your text is written in a very positive way. It seems as if your text contains many positive terms and is therefore placed in this section."
    }
    document.getElementById("writtenPolarity").innerText = result;
}

/**
 * Computes the displayed text based on the subjectivity of the essay
 *
 * @param subjectivity
 *          subjectivity of the essay
 */
function writtenSubjectivity(subjectivity) {
    let result; //0 very objective/1 very subjective
    if (0.0 <= subjectivity && subjectivity <= 0.2) {
        result = "Your text is written very objectively. This means that you have written a text that contains almost no personal opinions, but a lot of fact-based information."
    }
    if (0.2 < subjectivity && subjectivity <= 0.4) {
        result = "Your text is written objectively. This means that you have written a text that contains few personal opinions but more factual information."
    }
    if (0.4 < subjectivity && subjectivity <= 0.6) {
        result = "Your text contains some subjective elements. This means that you have written a text that contains some personal opinions but also some factual information."
    }
    if (0.6 < subjectivity && subjectivity <= 0.8) {
        result = "Your text contains some strongly subjective elements, i.e. you have included a certain amount of subjective opinion and less fact-based information in your text."
    }
    if (0.8 < subjectivity && subjectivity <= 1.0) {
        result = "Your text contains a lot of subjective elements. This means that you have included a lot of subjective opinions in your text and almost no fact-based information."
    }
    document.getElementById("writtenSubjectivity").innerText = result;
}


function writtenPolarityDE(polarity) {
    let result;
    if (-1.0 <= polarity && polarity <= -0.6) {
        result = "Ihr Text ist sehr negativ geschrieben. Es scheint so, als ob Ihr Text viele negative Begriffe enthält und deshalb in diesen Abschnitt eingeordnet wird."
    }
    if (-0.6 < polarity && polarity <= -0.2) {
        result = "Ihr Text ist negativ geschrieben. Es scheint, als ob Ihr Text einige negative Begriffe enthält und deshalb in diesen Abschnitt eingeordnet wird."
    }
    if (-0.2 < polarity && polarity <= 0.2) {
        result = "Ihr Text ist neutral geschrieben. Es gibt keine Extreme in Bezug auf Positivität oder Negativität."
    }
    if (0.2 < polarity && polarity <= 0.6) {
        result = "Ihr Text ist positiv geschrieben. Es scheint, dass Ihr Text einige positive Begriffe enthält und daher in diesen Bereich eingeordnet wird."
    }
    if (0.6 < polarity && polarity <= 1.0) {
        result = "Ihr Text ist sehr positiv geschrieben. Es scheint, als ob Ihr Text viele positive Begriffe enthält und deshalb in diesen Abschnitt eingeordnet wird."
    }
    document.getElementById("writtenPolarity").innerText = result;
}

function writtenSubjectivityDE(subjectivity) {
    let result; //0 very objective/1 very subjective
    if (0.0 <= subjectivity && subjectivity <= 0.2) {
        result = "Ihr Text ist sehr objektiv geschrieben. Das bedeutet, dass Sie einen Text verfasst haben, der fast keine persönlichen Meinungen enthält, sondern viele faktenbasierte Informationen."
    }
    if (0.2 < subjectivity && subjectivity <= 0.4) {
        result = "Ihr Text ist objektiv geschrieben. Das bedeutet, dass Sie einen Text verfasst haben, der wenige persönliche Meinungen, aber mehr sachliche Informationen enthält."
    }
    if (0.4 < subjectivity && subjectivity <= 0.6) {
        result = "Ihr Text enthält einige subjektive Elemente. Das bedeutet, dass Sie einen Text geschrieben haben, der einige persönliche Meinungen, aber auch einige sachliche Informationen enthält."
    }
    if (0.6 < subjectivity && subjectivity <= 0.8) {
        result = "Ihr Text enthält einige stark subjektive Elemente, d.h. Sie haben ein gewisses Maß an subjektiver Meinung und weniger faktenbasierte Informationen in Ihren Text eingebaut."
    }
    if (0.8 < subjectivity && subjectivity <= 1.0) {
        result = "Ihr Text enthält eine Menge subjektiver Elemente. Das bedeutet, dass Sie eine Menge subjektiver Meinungen in Ihren Text eingebaut haben und fast keine faktenbasierten Informationen."
    }
    document.getElementById("writtenSubjectivity").innerText = result;
}