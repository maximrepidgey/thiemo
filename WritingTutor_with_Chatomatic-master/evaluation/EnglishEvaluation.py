import spacy
from transformers import T5Tokenizer, T5ForConditionalGeneration
from textblob import TextBlob
from evaluation.EvaluationHandler import EvaluationHandler
from spacytextblob.spacytextblob import SpacyTextBlob


class EnglishEvaluation(EvaluationHandler):
    def __init__(self, text):
        super().__init__(text, "en")
        nlp = spacy.load('en_core_web_sm')
        nlp.add_pipe('spacytextblob')
        super().define_nlp(nlp)

    def _sentences(self):
        return TextBlob(self.text).sentences

    def _get_summary(self):
        model = T5ForConditionalGeneration.from_pretrained('t5-small')
        tokenizer = T5Tokenizer.from_pretrained('t5-small')

        preprocess_text = super().get_text().strip().replace("\n", "")
        t5_prepared_Text = "summarize: " + preprocess_text
        print("original text preprocessed: \n", preprocess_text)

        tokenized_text = tokenizer.encode(t5_prepared_Text, return_tensors="pt")

        # summmarize
        summary_ids = model.generate(tokenized_text,
                                     num_beams=4,
                                     no_repeat_ngram_size=2,
                                     min_length=30,
                                     max_length=200,
                                     early_stopping=True)

        output = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        return output
