import nltk
# from googletrans import Translator
from transformers import pipeline
from abc import abstractmethod, ABC
import deepl
import os

# for google translate:
# from google_trans_new import google_translator
# Translator = google_translator()

emotion_classifier = pipeline("text-classification", model="j-hartmann/emotion-english-distilroberta-base", top_k=None)
# translator = Translator()
# AUTH_KEY = os.getenv("DEEPL")
AUTH_KEY = "5059a476-d954-7276-e1f3-3bd7f3da166a:fx"
translator = deepl.Translator(AUTH_KEY)


class EvaluationHandler(ABC):
    def __init__(self, text, language):
        self.text = text
        self.language = language
        self.nlp = None  # to be initialized in subclass

    def define_nlp(self, way):
        self.nlp = way

    def get_text(self):
        return self.text

    @abstractmethod
    def _sentences(self):
        pass

    @abstractmethod
    def _get_summary(self):
        pass

    def _get_subjective(self):  # returns float in  [0.0, 1.0] objective to subjective
        # uses translated text
        doc = self.nlp(self.text)
        return doc._.blob.subjectivity

    def _get_polarity(self):  # returns float in  [-1.0, 1.0]
        doc = self.nlp(self.text)
        return doc._.blob.sentiment.polarity

    def _translate_to_english(self, text):
        # Google translate:
        # translated_text = translator.translate(text.replace("\n", "\n"), lang_tgt='en')
        print("text to translate")
        print(text)
        # translated_text = translator.translate(text, src=self.language, dest='en').text
        translated_text = translator.translate_text(text, target_lang="EN-US", source_lang=self.language.upper()).text
        print("translated")
        print(translated_text)
        return translated_text

    def _get_asc_subjectivity_per_sentence(self, sentences):
        # used in every language different from
        subjectivities = set()
        # text = self.text
        # text = self._translate_to_english(text)
        # sentences = nltk.tokenize.sent_tokenize(text)
        for sentence in sentences:
            subjectivities.add((sentence.string, self.nlp(sentence.string)._.blob.subjectivity))

            # if self.language == "en":
            #     subjectivities.add((sentence.string, self.nlp(sentence.string)._.blob.subjectivity))
            # else:
                # subjectivities.add((sentence.string, self.nlp(sentence.string)._.blob.subjectivity))
                # subjectivities.add((sentence.string, self.nlp(sentence.string)._.blob.subjectivity))

        subjectivities_asc = sorted(subjectivities, key=lambda x: x[1])
        return subjectivities_asc

    def _get_asc_polarity_per_sentence(self, sentences):
        polarities = set()

        for sentence in sentences:
            polarities.add((sentence.string, sentence.polarity))
        polarities_asc = sorted(polarities, key=lambda x: x[1])

        return polarities_asc

    def _get_emotion(self):
        # this method uses translated text
        text = self.text
        if self.language != "en":
            text = self._translate_to_english(self.text)

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

    def run(self):
        """
        Execute complete static evaluation of the text.
        :return dict: a dict with all the relevant evaluation results.
        """
        sentences = self._sentences()
        final = {
            "subjectivity": self._get_subjective(),
            "polarity": self._get_polarity(),
            "summary": self._get_summary(),
            "pol_per_sentence": self._get_asc_polarity_per_sentence(sentences),
            "sub_per_sentence": self._get_asc_subjectivity_per_sentence(sentences),
            "emotions": self._get_emotion(),
            "text": self.text
        }
        return final
