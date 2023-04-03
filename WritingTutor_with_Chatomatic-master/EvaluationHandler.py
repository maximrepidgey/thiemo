import spacy
import torch
import nltk
from spacytextblob.spacytextblob import SpacyTextBlob
from textblob_de import TextBlobDE
from textblob import TextBlob

from googletrans import Translator

from transformers import pipeline
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM


# @spacy.registry.misc("spacytextblob.de_blob")
# def create_de_blob():
#     return TextBlobDE



# config = {
#     "blob_only": True,
#     "custom_blob": {"@misc": "spacytextblob.de_blob"}
# }
# NLP for german text
# nlp_de = spacy.load("de_core_news_sm")
# nlp_de.add_pipe("spacytextblob", config=config)

# for google translate:
translator = Translator()
# from google_trans_new import google_translator
# translator = google_translator()

nlp_en = spacy.load('en_core_web_sm')
nlp_en.add_pipe('spacytextblob')

emotion_classifier = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base", top_k=None)


def __sentences(text):
    return TextBlob(text).sentences


def __get_summary(text):
    # todo switch between languages, create default one in english
    tokenizer = AutoTokenizer.from_pretrained("Einmalumdiewelt/T5-Base_GNAD")
    model = AutoModelForSeq2SeqLM.from_pretrained("Einmalumdiewelt/T5-Base_GNAD")

    input_ids = torch.tensor(tokenizer.encode(text)).unsqueeze(0)  # Batch size 1

    # Run the text through the model to get the summary
    output = model.generate(input_ids, max_length=512)
    summary = tokenizer.decode(output[0], skip_special_tokens=True)

    return summary


def __translate_to_english(text):
    # Google translate:
    # translated_text = translator.translate(text.replace("\n", "\n"), lang_tgt='en')
    translated_text = translator.translate(text=text.replace("\n", "\n"), src='de', dest='en').text
    return translated_text


def __get_emotion(text):
    sentences = nltk.sent_tokenize(text)
    split_text = []

    current_text = ""

    # create shorter texts so the nlp can handle the length (< 512)
    for sentence in sentences:
        if len(current_text) + len(sentence) < 512:
            current_text += sentence
        else:
            split_text.append(current_text)
            current_text = sentence

    split_text.append(current_text)

    emotion_averages = {}
    for text in split_text:
        result = emotion_classifier(text, truncation=True)

        if len(emotion_averages) == 0:
            emotion_averages = result
        else:
            for new_classification in result:
                for avg, curr in zip(emotion_averages[0], new_classification):
                    avg["score"] = (avg["score"] + curr["score"]) / 2

    return emotion_averages[0]


def __get_subjective(text):  # returns float in  [0.0, 1.0] objective to subjective
    doc = nlp_en(text)
    return doc._.blob.subjectivity


def __get_asc_polarity_per_sentence(sentences):
    polarities = set()

    for sentence in sentences:
        polarities.add((sentence.string, sentence.polarity))
    polarities_asc = sorted(polarities, key=lambda x: x[1])

    return polarities_asc


def __get_asc_subjectivity_per_sentence(sentences):
    subjectivities = set()
    for sentence in sentences:
        subjectivities.add((sentence.string, nlp_en(sentence.string)._.blob.subjectivity))
        # subjectivities.add((sentence.string, nlp_en(__translate_to_english(sentence.string))._.blob.subjectivity))

    subjectivities_asc = sorted(subjectivities, key=lambda x: x[1])
    return subjectivities_asc


def __get_polarity(text):  # returns float in  [-1.0, 1.0]
    doc = nlp_en(text)
    return doc._.blob.sentiment.polarity
