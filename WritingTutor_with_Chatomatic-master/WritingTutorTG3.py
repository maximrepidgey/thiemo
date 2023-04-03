#! /usr/bin/python3
# -*- coding: utf-8 -*-

import csv
import logging
import os
from time import gmtime, strftime
import requests
from flask import Flask, render_template, request, jsonify
from datetime import datetime
from dateTime import getTime, getDate
from time import localtime, strftime
import pytz
import nltk
import openai
from time import time
from chatomatic import *
from flask_cors import *
import EvaluationHandler

# chatGPT configuration
OPENAIKEY = "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"
openai.api_key = OPENAIKEY
MODEL = "gpt-3.5-turbo"


nltk.download("punkt")

# Initialize Flask for webapp
application = Flask(__name__)
application.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0
FLASK_PORT = 8006  # use 8080 for local setup

CORS(application)

# Application settings
# logging.basicConfig(level=logging.DEBUG)
currentPath = os.path.dirname(os.path.abspath(__file__))  # Current absolute file path
# logging.debug("Current path: " + currentPath)

# Chatbot settings
useGoogle = "no"  # Yes - Bei nicht wissen durchsucht der Bot google nach dem unbekannten Begriff und gibt einen Link. No - Google wird nicht zur Hilfe gezogen
confidenceLevel = 0.70  # Bot confidence level - Muss zwischen 0 und 1 liegen. Je höher der Wert, desto sicherer muss sich der Bot seiner Antwort sein

# Initialize dateTime util
now = datetime.now(pytz.timezone("Europe/Berlin"))
mm = str(now.month)
dd = str(now.day)
yyyy = str(now.year)
hour = str(now.hour)
minute = str(now.minute)
if now.minute < 10:
    minute = "0" + str(now.minute)
chatBotDate = strftime("%d.%m.%Y, %H:%M", localtime())
chatBotTime = strftime("%H:%M", localtime())

# create an instance of the chatbot
chatomatic = Chatomatic("data/DialoguesEN.yml", language="en")

# Google fallback if response == IDKresponse
def tryGoogle(myQuery):
    return (
            "<br><br>Gerne kannst du die Hilfe meines Freundes Google in Anspruch nehmen: <a target='_blank' href='https://www.google.com/search?q="
            + myQuery
            + "'>"
            + myQuery
            + "</a>"
    )


# CSV writer
def writeCsv(filePath, data):
    with open(filePath, "a", newline="", encoding="utf-8") as logfile:
        csvWriter = csv.writer(logfile, delimiter=";")
        csvWriter.writerow(data)


# Flask route for Emma
@application.route("/", methods=["GET", "POST"])
def home_emma():
    return render_template("index.html")


# Flask route for getting bot responses
@application.route("/getResponse", methods=["POST"])
def get_bot_response():
    """
    Basic communication with the chatbot. Uses this route to send text and return reply from the chatbot. Uses
    static chatbot or chatGPT.
    """
    data = request.get_json()
    text = data.get("text")
    gpt = data.get("gpt")  # boolean if chatGPT is active

    # if initialization do not send text to chatgpt
    if gpt and "StartGPT" not in text:

        botReply = openai.ChatCompletion.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "Act as writing tutor that helps students to write an argumentative essay. Highlight import terms with html bold tag"},
                {"role": "user", "content": "can you give me some suggestions about the theory of argumentative writing"},
                {"role": "assistant", "content": "I can suggest learning these topics: structure of the argument, "
                                                 "strength of the opinion, objectivity of the essay, sentiment measure,"
                                                 " and importance of the argumentation"},
                {"role": "user", "content": text},
                # {"role": "user", "content": userText + ". Moreover, propose 2 suggestions how to improve argumentative theory"},
                # experiment above returns always two suggestions with many text
            ],
            temperature=0.5,
            frequency_penalty=0.4,  # default 0 [-2,2], penalize repetition in explanation of theory
        )
        # todo a system for suggestion; create a set of possible suggestions and propose them to user
        botReply = botReply['choices'][0]['message']['content']
        botReply = "<p>"+botReply+"</p>"
        botReply += "<h4> Some suggestions for theory </h4>" \
        "<button class =\"chatSuggest\" onclick=\"chatSuggest('What is polarity and how can I improve it?');\">What is polarity and how can I improve it?</button>" \
        "<button class =\"chatSuggest\" onclick=\"chatSuggest('What is subjectivity/objectivity and how can I improve it?');\">What is subjectivity/objectivity and how can I improve it?</button>"

        botReply += "<h4> Evaluation </h4>" \
        "<button class =\"chatSuggest\" onclick=\"chatSuggest('Start evaluation process');\">Are you ready? Start evaluation</button>"
        # "<button class=\"chatSuggest\" onclick=\"displayELEA('5001/');return false;\">Open the textfield</button>"

    else:
        try:
            botReply = str(chatomatic.answer(text))
        except Exception as e:
            print("Exception---------------")
            print(e)

        if botReply == "IDKresponse":
            if useGoogle == "yes":
                botReply = botReply + tryGoogle(text)
        elif botReply == "getTIME":
            botReply = getTime()
        elif botReply == "getDATE":
            botReply = getDate()

    writeCsv(currentPath + "/log/botLog.csv", [text, botReply])
    data = {"botReply": botReply}
    return jsonify(data)


## Flask route for posting feedback
@application.route("/feedback", methods=["POST"])
def send_feedback():
    data = request.get_json()
    bot = data.get("bot")
    rating = data.get("rating")
    # ux = data.get("ux")
    text = data.get("text")
    improvement = data.get("improve")

    writeCsv(
        currentPath + "/log/evaluationFeedback.csv",
        [bot, rating, text, improvement],
    )

    return jsonify({"success": True}, 200, {"ContentType": "application/json"})


@application.route("/evaluate", methods=["POST"])
def evaluate():
    """
    Provides feedback of the argumentative essay using chatGPT.
    """
    text = request.get_json().get("text")

    return

# Added to implement the file transfer for reading the pdf and giving corresponding answer
#  GET AND POST are required - otherwise : method not allowed error
@application.route("/texttransfer", methods=["POST"])
def receive_text():
    """
    Provides feedback of the argumentative essay using nltk and spacy library. Used for static chatbot.
    """
    # receive text from front-end
    received_text = request.get_json().get("text")
    received_text = received_text.replace("\\n", "\n")

    # used for not english text
    # translated_text = EvaluationHandler.__translate_to_english(received_text)

    sentences = EvaluationHandler.__sentences(received_text)

    sub = EvaluationHandler.__get_subjective(received_text)  # examines sub and pol
    pol = EvaluationHandler.__get_polarity(received_text)
    summary = EvaluationHandler.__get_summary(received_text)
    ascending_sentence_polarities = EvaluationHandler.__get_asc_polarity_per_sentence(sentences)
    ascending_sentence_subjectivities = EvaluationHandler.__get_asc_subjectivity_per_sentence(sentences)
    emotions = EvaluationHandler.__get_emotion(received_text)

    data = {
        "subjectivity": sub,
        "polarity": pol,
        "summary": summary,
        "text": received_text,
        "pol_per_sentence": ascending_sentence_polarities,
        "sub_per_sentence": ascending_sentence_subjectivities,
        "emotions": emotions
    }

    return jsonify(data)


if __name__ == "__main__":
    # using debug=True makes GPT unavailable
    application.run(host="127.0.0.1", port=FLASK_PORT)
