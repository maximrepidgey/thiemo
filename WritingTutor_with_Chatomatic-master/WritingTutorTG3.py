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
    gpt = data.get("gpt")  # boolean if chatGPT is active
    global EVALUATION_STARTED
    topics = ["structure of the argument", "objectivity and subjectivity of the argumentation", "the importance of counterarguments in persuasive writing", "an argument", "evidence and Credibility", "strength of the opinion", "different parts of the argumentative essay", "the use of evidence and sources to support an argument", "sentiment analysis", "counterargument and refutation", "polarity"]

    # if initialization or evaluation do not send text to chatgpt
    if gpt and "StartGPT" not in text and "evaluation process" not in text:

        botReply = openai.ChatCompletion.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "Act as writing tutor that helps students to write an argumentative essay. Provide concise answers."},
                {"role": "user", "content": "can you give me some suggestions about the theory of argumentative writing"},
                {"role": "assistant", "content": "I can suggest learning these topics: " + ", ".join(topics)},
                {"role": "user", "content": text},
                # {"role": "user", "content": userText + ". Moreover, propose 2 suggestions how to improve argumentative theory"},
                # experiment above returns always two suggestions with many text
            ],
            temperature=0.5, # default 1, higher more random, lower --> more deterministic
            frequency_penalty=0.4,  # default 0 [-2,2], penalize repetition in explanation of theory
        )
        botReply = botReply['choices'][0]['message']['content']
        botReply = "<p>"+botReply+"</p>"
        suggestions = random.sample(topics, 2)  # list of 2 random suggestions
        botReply += "<h4 class=\"subtitles\"> Some suggestions for theory </h4>" \
        "<button class =\"chatSuggest\" onclick=\"chatSuggest('What is " + suggestions[0] + "and how can I improve it?');\">What is "+suggestions[0]+" and how can I improve it?</button>" \
        "<button class =\"chatSuggest\" onclick=\"chatSuggest('What is "+ suggestions[1] +" and how can I improve it?');\">What is "+ suggestions[1] +" and how can I improve it?</button>"
        # randomly assign theory button if the user is lost, maybe not the best choice
        # append evaluation button everytime, except when the evaluation have started
        if not EVALUATION_STARTED:
            botReply += "<h4 class=\"subtitles\"> Evaluation </h4>" \
            "<button class =\"chatSuggest\" onclick=\"chatSuggest('Start evaluation process');\">Are you ready? Start evaluation</button>"

    else:
        if "evaluation process" in text:
            EVALUATION_STARTED = True

        try:
            # todo get language from request and use correspoing chatbot
            bot = switch_chatbot("")
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
    # todo remove print
    text = info["text"]
    detail = info["eval"]  # evaluation metric, e.g. readability

    query = "evaluate the {} of the text from 1 to 5, where 1 is the worst and 5 is the best. Return only the " \
            "number, no text. You can use also fractions and entire numbers. \nText: {}".format(detail, text)
    score_iter = 8
    scores = gpt_reply(query, temperature=0.6, n=score_iter)

    res = 0
    for i in range(score_iter):
        res += float(scores['choices'][i]['message']['content'])

    res /= score_iter  # average score of the score
    res = round(res, 2)  # round to 2 decimanls
    # print("score: {}".format(res))

    query = "you rated this text with {} out of 5 for {}, explain why. Also provide concrete examples from the text. " \
            "Write not more than a paragraph. \nText: {}".format(res, detail, text)

    reason = gpt_reply(query, 1.1, 0.2, 0.6)
    reason = reason['choices'][0]['message']['content']
    # print("reason: {}".format(reason))

    # produce many tokes
    query = "how can you improve this text in terms of {}. Provide three concrete examples. \nText: {}".format(detail, text)
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
    text = text.replace("\\n", "\n")

    # feedback request
    evaluations = ["readability", "objectivity", "conciseness", "argumentative structure"]
    info = []
    for el in evaluations:
        info.append(gpt_reply_evaluation.s({"eval": el, "text": text}))

    jobs = group(info)
    result = jobs.delay()

    res = result.get()  # a list of objects
    final = {}
    for el in res:
        final[el["info"]] = el


    general = gpt_reply("Provide a feedback for the text. write only one paragraph. \n Text: {}".format(text), 0.8, 0.3, 0.4)
    general = general['choices'][0]['message']['content']
    final.update({"general": general})  # add general feedback to the reply

    return jsonify(final)

@application.route("/tev", methods=["POST"])
def route_test():

    data ={'readability': {'info': 'readability', 'score': 2.5625,
                     'reason': 'The text has a low readability score because of its language, style and tone. The author uses exaggeration to emphasize their point of view but the over-the-top language detracts from it. For example, in the introduction, the author claims that broccoli is the worst vegetable ever, which is an extreme assertion and not supported by facts. Moreover, the essay lacks coherence and logical flow. The main points outlined in each body paragraph are not well-connected, causing the argument to come across as disjointed. For instance, paragraph three abruptly switches topics from the resource drain on society to health concerns over consuming broccoli. In short, the essay would benefit from clearer argumentation and more persuasive language that presents harder evidence to support its claims.',
                     'improvement': "To improve the readability of this text, the following are three concrete examples:\n\n1. Change the tone: The author uses an aggressive and negative tone throughout the essay which can be off-putting to some readers. Instead, the author could adopt a more persuasive tone by presenting evidence that supports their claims in a more measured way. This will make the essay sound less like a rant and more like a well-reasoned argument.\n\n2. Use shorter paragraphs: The author's paragraphs are quite long and this can make it difficult for readers to follow their train of thought. Breaking up the text into smaller paragraphs would make it easier for readers to digest the information presented and help them stay engaged with the argument.\n\n3. Provide evidence: While the author makes many claims about broccoli, they don't provide any evidence to support these claims. Adding statistics or scientific studies that back up their arguments will make the essay more convincing and credible to readers. This would also strengthen their position as an authority on the topic."},
     'objectivity': {'info': 'objectivity', 'score': 1.25,
                     'reason': 'The text is extremely subjective and lacks objectivity. The writer starts with a statement that broccoli is the worst vegetable that exists, which suggests a preconceived bias. There is no evidence provided to present a more balanced perspective on the topic. Moreover, in each paragraph, the writer uses exaggeration and appeals to emotion to support their claim. For instance, describing the taste of broccoli as "terrible," and using phrases such as "no amount" and "never be consumed" present an extreme, biased view of the vegetable. The writer also fails to acknowledge any counterarguments or alternative perspectives, making the argument less persuasive.',
                     'improvement': 'To improve this text in terms of objectivity, here are three concrete examples:\n\n1. Replace subjective language with factual information: Instead of stating that broccoli has a terrible taste, provide objective evidence to support this claim such as data from taste tests or surveys. This will help to establish the argument without using exaggerated language.\n\n2. Provide counter-arguments and evidence: Objectivity requires acknowledging opposing arguments and providing evidence to refute them. In this case, the writer can acknowledge that some people enjoy eating broccoli and provide evidence for its health benefits.\n\n3. Avoid generalizations: The language used in the essay is sweeping and generalized. To be more objective, it is important to avoid making broad statements such as "no one wants to eat" broccoli and instead use more precise language like "some people find it difficult to enjoy."'},
     'conciseness': {'info': 'conciseness', 'score': 4.5,
                     'reason': "The text scores high in conciseness because it serves its purpose without wasting any words or beating around the bush. Each paragraph has a clear and definitive argument, adding value to the overall message and not repeating unnecessary information. For example, Body Paragraph 2 stresses that broccoli is a burden on the environment and offers evidence for why this is so. It mentions the resources that go into cultivating broccoli only to have most of it thrown away, further burdening the environment, making a strong counterpoint to those who might suggest that broccoli's health benefits outweigh any drawbacks. Overall, concise writing helps to get the point across more effectively and makes the text more convincing.",
                     'improvement': 'To improve the conciseness of this text, here are three examples:\n\n1. In the introduction, instead of saying "In this essay, I will argue that broccoli is overrated and should never be consumed," you can simply say "Broccoli is overrated and should never be consumed."\n\n2. In Body Paragraph 2, instead of saying "This makes it a burden on the environment and a waste of resources that could be used for more delicious and valuable crops," you can say "It\'s a burden on the environment and wasted resources."\n\n3. In the conclusion, instead of saying "It should be removed from our diets and replaced with better, more enjoyable vegetables," you can say "Replace it with other enjoyable vegetables."'},
     'structure': {'info': 'structure', 'score': 2.5,
                   'reason': 'The text has many flaws in its argumentative structure. Firstly, the author makes a sweeping statement in the introduction that broccoli is the worst vegetable without providing any rationale or evidence to support their claim. In addition, the author presents claims that are subjective and not universally proven. For instance, tastes differ from person to person, and it is not factual to state that "broccoli has a terrible taste." Another problem is that the author does not acknowledge any counter-arguments or provide evidence to refute opposing views. The entire essay relies heavily on personal opinions and lacks actual studies or data to support them. To make this essay more persuasive, the author must back up their arguments with verified data and avoid unsubstantiated generalizations.',
                   'improvement': '1. The introduction could be improved by providing more context on why broccoli is usually praised for its health benefits, and then introducing the contrasting argument that it is actually overrated. This would help set up the argument more effectively and engage the reader’s interest.\n\n2. Each body paragraph could be strengthened by including evidence to support the claims being made. For example, in paragraph 1, the author could include a survey or study showing that many people find broccoli unpalatable. In paragraph 2, the author could provide data on the environmental impact of growing and transporting broccoli compared to other crops. In paragraph 3, the author could cite research on the digestive effects of broccoli.\n\n3. The conclusion should summarize the main points of the essay and reiterate the argumentative stance taken by the author. However, it should also leave room for potential counterarguments or alternative perspectives. Instead of stating unequivocally that broccoli should be removed from our diets, the author could acknowledge that some people may still choose to eat it despite its drawbacks or argue that it could be consumed in moderation alongside other vegetables.'},
     'general': "The argumentative text makes a bold and controversial claim that broccoli is the worst vegetable ever. However, the author fails to provide any credible evidence to support this claim. The text is subjective and lacks objectivity, making it difficult to convince readers who may have a different perspective on broccoli. Furthermore, the author's tone is overly aggressive and dismissive towards those who enjoy eating broccoli, which may turn off some readers from engaging with the argument. Therefore, the author needs to include more concrete evidence and adopt a more persuasive tone if they want to convince readers of their claim."}

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
    # todo receive the language on backend
    lang = ""

    # create evaluation mechanism and run it
    evaluation_handler = switch(lang, received_text)
    data = evaluation_handler.run()

    return jsonify(data)


def switch(lang, text):
    if lang == "en":
        return EnglishEvaluation.EnglishEvaluation(text)
    elif lang == "de":
        return GermanEvaluation.GermanEvaluation(text)


def switch_chatbot(lang):
    if lang == "en":
        return chatomaticEN
    elif lang == "de":
        return chatomaticDE

if __name__ == "__main__":
    # using debug=True makes GPT unavailable
    application.run(host=SERVER_IP, port=FLASK_PORT, threaded=True)
