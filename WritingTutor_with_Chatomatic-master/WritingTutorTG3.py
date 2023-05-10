#! /usr/bin/python3
# -*- coding: utf-8 -*-

import csv
import os
from flask import Flask, render_template, request, jsonify
from datetime import datetime
from dateTime import getTime, getDate
from time import localtime, strftime
import pytz
import nltk
import openai
from chatomatic import *
from flask_cors import *
from celery import Celery, group
# import evaluation
from evaluation import EnglishEvaluation, GermanEvaluation

nltk.download("punkt")

# chatGPT configuration
OPENAIKEY = os.getenv("OPENAIKEY")
openai.api_key = OPENAIKEY
MODEL = "gpt-3.5-turbo"

# Initialize Flask for webapp
application = Flask(__name__)
application.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0
FLASK_PORT = 8006  # use 8080 for local setup
SERVER_IP = os.getenv("FLASK")
# configure redis and Celery
application.config['CELERY_BROKER_URL'] = 'redis://localhost:6379'
application.config['CELERY_RESULT_BACKEND'] = 'redis://localhost:6379'

celery = Celery(application.name, broker=application.config['CELERY_BROKER_URL'])
celery.conf.update(application.config)

CORS(application)

# create an instance of the chatbot of different languages
chatomaticEN = Chatomatic("data/DialoguesEN.yml", language="en")
chatomaticDE = Chatomatic("data/Dialogues.yml", language="de")

# Application settings
# currentPath = os.path.dirname(os.path.abspath(__file__))  # Current absolute file path

# Chatbot settings
useGoogle = "no"  # Yes - Bei nicht wissen durchsucht der Bot google nach dem unbekannten Begriff und gibt einen Link. No - Google wird nicht zur Hilfe gezogen
confidenceLevel = 0.70  # Bot confidence level - Muss zwischen 0 und 1 liegen. Je höher der Wert, desto sicherer muss sich der Bot seiner Antwort sein
EVALUATION_STARTED = False

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
    language = data.get("language")
    gpt = data.get("gpt")  # boolean if chatGPT is active
    global EVALUATION_STARTED
    topicsEn = ["structure of the argument", "objectivity and subjectivity of the argumentation", "the importance of counterarguments in persuasive writing", "an argument", "evidence and Credibility", "strength of the opinion", "different parts of the argumentative essay", "the use of evidence and sources to support an argument", "sentiment analysis", "counterargument and refutation", "polarity"]
    topicsDe = ["Struktur des Arguments", "Objektivität und Subjektivität der Argumentation", "die Bedeutung von Gegenargumenten beim überzeugenden Schreiben", "ein Argument", "Beweise und Glaubwürdigkeit", "Stärke der Meinung", "verschiedene Teile des argumentativen Essays", "die Verwendung von Beweisen und Quellen zur Unterstützung eines Arguments", "Gefühlsanalyse", "Gegenargument und Widerlegung", "Polarität"]

    # if initialization or evaluation do not send text to chatgpt
    if gpt and "StartGPT" not in text and "evaluation process" not in text:

        system_string = "Act as writing tutor that helps students to write an argumentative essay. Provide concise answers, not longer than 120 words."
        botReply = openai.ChatCompletion.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": system_string},
                {"role": "user", "content": "can you give me some suggestions about the theory of argumentative writing"},
                {"role": "assistant", "content": "I can suggest learning these topics: " + ", ".join(topicsEn)},
                {"role": "user", "content": text + "\n" + language_gpt(language)},
                # {"role": "user", "content": userText + ". Moreover, propose 2 suggestions how to improve argumentative theory"},
                # experiment above returns always two suggestions with many text
            ],
            temperature=0.5, # default 1, higher more random, lower --> more deterministic
            frequency_penalty=0.4,  # default 0 [-2,2], penalize repetition in explanation of theory
        )
        botReply = botReply['choices'][0]['message']['content']
        botReply = "<p>"+botReply+"</p>"
        # change language here
        if language == "en":
            suggestions = random.sample(topicsEn, 2)  # list of 2 random suggestions
            botReply += "<h4 class=\"subtitles\"> Some suggestions for theory </h4>" \
            "<button class =\"chatSuggest\" onclick=\"chatSuggest('What is " + suggestions[0] + " and how can I improve it?');\">What is "+suggestions[0]+" and how can I improve it?</button>" \
            "<button class =\"chatSuggest\" onclick=\"chatSuggest('What is "+ suggestions[1] +" and how can I improve it?');\">What is "+ suggestions[1] +" and how can I improve it?</button>"
        elif language == "de":
            suggestions = random.sample(topicsDe, 2)  # list of 2 random suggestions
            botReply += "<h4 class=\"subtitles\"> Einige Vorschläge für die Theorie </h4>" \
            "<button class =\"chatSuggest\" onclick=\"chatSuggest('Was ist " + suggestions[0] + " und wie kann ich sie verbessern?');\">Was ist " + suggestions[0] + " und wie kann ich sie verbessern?</button>" \
            "<button class =\"chatSuggest\" onclick=\"chatSuggest('Was ist " + suggestions[1] + " und wie kann ich sie verbessern?');\">Was ist " + suggestions[1] + " und wie kann ich sie verbessern?</button>"
        # randomly assign theory button if the user is lost, maybe not the best choice
        # append evaluation button everytime, except when the evaluation have started
        if not EVALUATION_STARTED:
            if language == "en":
                botReply += "<h4 class=\"subtitles\"> Evaluation </h4>" \
                "<button class =\"chatSuggest\" onclick=\"chatSuggest('Start evaluation process');\">Are you ready? Start evaluation</button>"
            elif language == "de":
                botReply += "<h4 class=\"subtitles\"> Bewertung </h4>" \
                "<button class =\"chatSuggest\" onclick=\"chatSuggest('Start evaluation process');\">Sind Sie bereit? Bewertung beginnen</button>"

    else:
        if "evaluation process" in text:
            EVALUATION_STARTED = True

        try:
            bot = switch(language)["chatbot"]
            botReply = str(bot.answer(text))
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

    # writeCsv(currentPath + "/log/botLog.csv", [text, botReply])
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

    # writeCsv(
    #     currentPath + "/log/evaluationFeedback.csv",
    #     [bot, rating, text, improvement],
    # )

    return jsonify({"success": True}, 200, {"ContentType": "application/json"})


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


@celery.task
def gpt_reply_evaluation(info):
    text = info["text"]
    detail = info["eval"]  # evaluation metric, e.g. readability
    language = info["language"]

    query = "evaluate the {} of the text from 1 to 5, where 1 is the worst and 5 is the best. Return only the " \
            "number, no text. You can use also fractions and entire numbers. The following text is in {}. \nText: {}".format(detail, switch(language)["language"], text)
    score_iter = 8
    scores = gpt_reply(query, temperature=0.6, n=score_iter)

    res = 0
    for i in range(score_iter):
        res += float(scores['choices'][i]['message']['content'])

    res /= score_iter  # average score of the score
    res = round(res, 2)  # round to 2 decimanls
    # print("score: {}".format(res))

    query = "you rated this text with {} out of 5 for {}, explain why. Also provide concrete examples from the text. " \
            "Write not more than a paragraph. {} \nText: {}".format(res, detail, language_gpt(language), text)

    reason = gpt_reply(query, 1.1, 0.2, 0.6)
    reason = reason['choices'][0]['message']['content']
    # print("reason: {}".format(reason))

    # produce many tokes
    query = "how can you improve this text in terms of {}. Provide three concrete examples. {} \nText: {}".format(detail, language_gpt(language), text)
    improvement = gpt_reply(query, 0.8, 0.4, 0.6)
    improvement = improvement['choices'][0]['message']['content']
    # print("improvement: {}".format(improvement))
    if detail == "argumentative structure": # rename argumentative structure to structure to facilitate variable passing to frontend
        detail = "structure"

    return {"info": detail, "score": res, "reason": reason, "improvement": improvement}

# todo multi language: if lang==de, add to chatgpt: "please answer in german" use switch to map de to german

@application.route("/evaluate", methods=["POST"])
def evaluate():
    """
    Provides feedback of the argumentative essay using chatGPT.
    """
    text = request.get_json().get("text")
    language = request.get_json().get("language")
    text = text.replace("\\n", "\n")

    # feedback request
    evaluations = ["readability", "objectivity", "conciseness", "argumentative structure"]
    info = []
    for el in evaluations:
        info.append(gpt_reply_evaluation.s({"eval": el, "text": text, "language": language}))

    jobs = group(info)
    result = jobs.delay()

    res = result.get()  # a list of objects
    final = {}
    for el in res:
        final[el["info"]] = el


    general = gpt_reply("Provide a feedback for the text. write only one paragraph. \n Text: {}".format(text) + language_gpt(language), 0.8, 0.3, 0.4)
    general = general['choices'][0]['message']['content']
    final.update({"general": general})  # add general feedback to the reply

    return jsonify(final)


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
    language = request.get_json().get("language")

    # create evaluation mechanism and run it
    evaluation_handler = switch(language, received_text)["evaluation"]
    data = evaluation_handler.run()

    return jsonify(data)


def switch(lang, text=""):
    if lang == "en":
        return {"language": "English", "chatbot": chatomaticEN, "evaluation": EnglishEvaluation.EnglishEvaluation(text)}
    elif lang == "de":
        return {"language": "German", "chatbot": chatomaticDE, "evaluation": GermanEvaluation.GermanEvaluation(text)}


def language_gpt(lang):
    return "Please, answer in " + switch(lang)["language"] + "."


if __name__ == "__main__":
    # using debug=True makes GPT unavailable
    application.run(host=SERVER_IP, port=FLASK_PORT, threaded=True)
