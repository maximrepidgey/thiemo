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
from chatomatic import *
from flask_cors import *
from multiprocessing import Pool
from celery import Celery, group


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

application.config['CELERY_BROKER_URL'] = 'redis://localhost:6379/0'
application.config['CELERY_RESULT_BACKEND'] = 'redis://localhost:6379/0'

celery = Celery(application.name, broker=application.config['CELERY_BROKER_URL'])
celery.conf.update(application.config)


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

# todo when the person is ready for evaluation, pass the question to the static mechanism to describe the essay
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
                {"role": "system", "content": "Act as writing tutor that helps students to write an argumentative essay. Please, asnwer using HTML to highlight important terms"},
                {"role": "user", "content": "can you give me some suggestions about the theory of argumentative writing"},
                {"role": "assistant", "content": "I can suggest learning these topics: structure of the argument, "
                                                 "strength of the opinion, objectivity of the essay, sentiment measure,"
                                                 " and importance of the argumentation"},
                {"role": "user", "content": text},
                # {"role": "user", "content": userText + ". Moreover, propose 2 suggestions how to improve argumentative theory"},
                # experiment above returns always two suggestions with many text
            ],
            temperature=0.5, # default 1, higher more random, lower --> more deterministic
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


@application.route("/test", methods=["POST"])
def test():
    """
    Provides feedback of the argumentative essay using chatGPT.
    """
    text = request.get_json().get("text")

    query = text["query"]
    temperature = float(text["temperature"])
    frequency_penalty = float(text["frequencyPenalty"])
    presence_penalty = float(text["presencePenalty"])
    n = int(text["n"])

    botReply = openai.ChatCompletion.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": "You provide feedback for argumentative text."},
            {"role": "user", "content": query},
        ],
        temperature=temperature,
        frequency_penalty=frequency_penalty,
        presence_penalty=presence_penalty,
        n=n,
    )
    print(botReply)

    botReply = botReply['choices'][0]['message']['content']

    data = {"botReply": botReply}
    return jsonify(data)


def gpt_reply(query, temperature=1.0, frequency_penalty=0.0, presence_penalty=0.0, n=1, system="You provide feedback for argumentative text."):
    # default for evaluation
    return openai.ChatCompletion.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": query},
        ],
        temperature=temperature,  # default 1, higher more random, lower --> more deterministic
        frequency_penalty=frequency_penalty,  # default 0 [-2,2], penalize repetition in the generated text
        presence_penalty=presence_penalty,  # default 0 [-2,2], high value increase model probability to talk about new topics
        n=n,  # number of generated answers
    )


@celery.task(trail=True)
def task1(info):
    print(info)
    return info + " slave"


@celery.task
def gpt_reply_evaluation(info):
    text = info["text"]
    detail = info["eval"]  # evaluation metric, e.g. readability

    query = "evaluate the {} of the text from 1 to 5, where 1 is the worst and 5 is the best. Return only the " \
            "number, no text. You can use also fractions and entire numbers. \nText: {}".format(detail, text)
    score_iter = 8
    scores = gpt_reply(query, temperature=0.6, n=score_iter)

    res = 0
    for i in range(score_iter):
        res += float(scores['choices'][i]['message']['content'])

    # todo round the score to some value
    res /= score_iter  # average score of the score
    print("score: {}".format(res))

    query = "you rated this text with {} out of 5 for {}, explain why. Also provide concrete examples from the text. " \
            "Write not more than a paragraph. \nText: {}".format(res, detail, text)

    reason = gpt_reply(query, 1.1, 0.2, 0.6)

    print("reason: {}".format(reason))

    query = "how can you improve this text in terms of {}. Provide three concrete examples. \nText: {}".format(detail, text)
    improvement = gpt_reply(query, 0.8, 0.4, 0.6)
    print("improvement: {}".format(improvement))

    return {"info": detail, "score": res, "reason": reason, "improvement": improvement}


@application.route("/evaluate", methods=["POST"])
def evaluate():
    """
    Provides feedback of the argumentative essay using chatGPT.
    """
    text = request.get_json().get("text")

    # feedback request
    evaluations = ["readability"]
    # evaluations = ["readability", "objectivity", "conciseness", "argumentative structure", "informativeness"]
    info = []
    for el in evaluations:
        # info.append({"eval": el, "text": text})
        # info.append(gpt_reply_evaluation.s({"eval": el, "text": text}))
        info.append(task1.s(el))

    general = gpt_reply("Provide a feedback for the text. write only one paragraph. \n Text: {}".format(text), 0.8, 0.3, 0.4)
    # result = gpt_reply_evaluation.apply_async(args=info)
    jobs = group(info)
    # result = jobs.apply_async()
    result = task1.delay("readability")
    print("------res------")
    print(result)
    print("---------------")
    result = result.get()

    print("------res------")
    print(result)
    print("---------------")

    # with Pool(len(info)) as p:
    #     result = p.map(gpt_reply_evaluation, info)

    reply = {"general": general, "evaluations": result}

    return jsonify(reply)

@application.route("/tev", methods=["POST"])
def route_test():
    received_text = request.get_json().get("text")

    data = {
        "readability": {"info": "readability", "score": 1.5, "reason": "super bad text lalalal la la la lal", "improvement": "just write better lkk ka kd akskd ak da dja djal "},
        "structure": {"info": "structure", "score": 2.3, "reason": "super bad text lalalal la la la lal", "improvement": "just write better lkk ka kd akskd ak da dja djal "},
        "objectivity": {"info": "objectivity", "score": 1.1, "reason": "super bad text lalalal la la la lal", "improvement": "just write better lkk ka kd akskd ak da dja djal "},
        "conciseness": {"info": "conciseness", "score": 4.3, "reason": "super bad text lalalal la la la lal", "improvement": "just write better lkk ka kd akskd ak da dja djal "},
        "general": "some general feedbackmnka dj ajd ajkdal. lakd a",
        # "text": received_text
    }
    return jsonify(data)



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
    application.run(host="127.0.0.1", port=FLASK_PORT, threaded=True)
