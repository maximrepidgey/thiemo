#! /usr/bin/python3
# -*- coding: utf-8 -*-

## Import python libraries
import csv
import logging
import os
from time import gmtime, strftime
import requests
from chatomatic import *
from flask_cors import *

import pytz

import EvaluationHandler

import nltk

nltk.download("punkt")

# import timer

from flask import Flask, render_template, request, jsonify

from datetime import datetime
from dateTime import getTime, getDate
from time import localtime, strftime
from time import time


# from timer import timer

# timer = Timer()
def some_fn():
    print("Python is not JS")


# timer.setTimeout(some_fn, 3.0)
#  Above will execute some_fn call after 3 sec
# timer2 = Timer()
# timer2.setTimeout(some_fn, 3.0)
# timer2.setClearTimer()

# Above line of codes will not execute some_fn call as timer is cleared before 3 seconds

# import logging

# logging.basicConfig(filename="all-interactions.log", level=logging.ERROR)
# logging.getLogger("werkzeug").setLevel(logging.ERROR)

## Initialize Flask for webapp
# app = Flask(__name__)
application = Flask(__name__)
application.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0

CORS(application)

## Application settings
# logging.basicConfig(level=logging.DEBUG)
currentPath = os.path.dirname(os.path.abspath(__file__))  # Current absolute file path
# logging.debug("Current path: " + currentPath)


## Flask settings
FLASK_PORT = 8006  # use 8080 for local setup

## Chatbot settings
useGoogle = "no"  # Yes - Bei nicht wissen durchsucht der Bot google nach dem unbekannten Begriff und gibt einen Link. No - Google wird nicht zur Hilfe gezogen
confidenceLevel = 0.70  # Bot confidence level - Muss zwischen 0 und 1 liegen. Je höher der Wert, desto sicherer muss sich der Bot seiner Antwort sein

## Initialize dateTime util
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

chatomatic = Chatomatic("data/Dialogues.yml", language="de")


## Google fallback if response == IDKresponse
def tryGoogle(myQuery):
    return (
            "<br><br>Gerne kannst du die Hilfe meines Freundes Google in Anspruch nehmen: <a target='_blank' href='https://www.google.com/search?q="
            + myQuery
            + "'>"
            + myQuery
            + "</a>"
    )


## CSV writer
def writeCsv(filePath, data):
    with open(filePath, "a", newline="", encoding="utf-8") as logfile:
        csvWriter = csv.writer(logfile, delimiter=";")
        csvWriter.writerow(data)


## Flask route for Emma
@application.route("/", methods=["GET", "POST"])
def home_emma():
    return render_template("index.html")


## Flask route for getting bot responses
@application.route("/getResponse", methods=["GET"])
def get_bot_response():
    userText = str(request.args.get("msg"))
    try:
        botReply = str(chatomatic.answer(userText, "de", "transformers"))
    except Exception as e:
        print(e)

    if botReply == "IDKresponse":
        if useGoogle == "yes":
            botReply = botReply + tryGoogle(userText)
    elif botReply == "getTIME":
        botReply = getTime()
    elif botReply == "getDATE":
        botReply = getDate()

    writeCsv(currentPath + "/log/botLog.csv", [userText, botReply])

    data = {"botReply": botReply}

    response = jsonify(data)
    return response



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


# Added to implement the file transfer for reading the pdf and giving corresponding answer
#  GET AND POST are required - otherwise : method not allowed error
@application.route("/texttransfer", methods=["POST"])
def receive_text():
    # File which (should) be received from javascript
    received_text = request.get_json().get("text")
    received_text = received_text.replace("\\n", "\n")

    translated_text = EvaluationHandler.__translate_to_english(received_text)

    sentences = EvaluationHandler.__sentences(received_text)

    sub = EvaluationHandler.__get_subjective(translated_text)  # examines sub and pol
    pol = EvaluationHandler.__get_polarity(received_text)
    summary = EvaluationHandler.__get_summary(received_text)
    ascending_sentence_polarities = EvaluationHandler.__get_asc_polarity_per_sentence(sentences)
    ascending_sentence_subjectivities = EvaluationHandler.__get_asc_subjectivity_per_sentence(sentences)
    emotions = EvaluationHandler.__get_emotion(translated_text)

    # jsonify({"success": True}, 200, {"ContentType": "application/json"})

    # return {
    #     "subjectivity": sub,
    #     "polarity": pol,
    #     "summary": summary,
    #     "text": received_text,
    #     "pol_per_sentence": ascending_sentence_polarities,
    #     "sub_per_sentence": ascending_sentence_subjectivities,
    #     "emotions": emotions
    # }

    data = {
        "subjectivity": sub,
        "polarity": pol,
        "summary": summary,
        "text": received_text,
        "pol_per_sentence": ascending_sentence_polarities,
        "sub_per_sentence": ascending_sentence_subjectivities,
        "emotions": emotions
    }

    return jsonify(data)  # wird zurück gesendet auf Ajax umwandelung in json damit es wieder funktioniert auf der website


# rest of the code structure is on the index.html. (JavaScript)

## Python Flask startup
if __name__ == "__main__":
    application.run(host="127.0.0.1", port=FLASK_PORT, debug=True)

    # for i in range(0, 1000000):
    #     time.sleep(1000000)
