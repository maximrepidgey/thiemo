import spacy
import torch
from textblob_de import TextBlobDE
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from evaluation.EvaluationHandler import EvaluationHandler
from spacytextblob.spacytextblob import SpacyTextBlob


@spacy.registry.misc("spacytextblob.de_blob")
def create_de_blob():
    return TextBlobDE


class GermanEvaluation(EvaluationHandler):
    def __init__(self, text):
        super().__init__(text, "de")

        config = {
            "blob_only": True,
            "custom_blob": {"@misc": "spacytextblob.de_blob"}
        }
        # initialize respective NLP pipeline
        nlp = spacy.load("de_core_news_sm")
        nlp.add_pipe("spacytextblob", config=config)
        super().define_nlp(nlp)

    def _sentences(self):
        return TextBlobDE(self.text).sentences

    def _get_summary(self):
        tokenizer = AutoTokenizer.from_pretrained("Einmalumdiewelt/T5-Base_GNAD")
        model = AutoModelForSeq2SeqLM.from_pretrained("Einmalumdiewelt/T5-Base_GNAD")

        input_ids = torch.tensor(tokenizer.encode(self.text)).unsqueeze(0)  # Batch size 1

        # Run the text through the model to get the summary
        output = model.generate(input_ids, max_length=512)
        summary = tokenizer.decode(output[0], skip_special_tokens=True)

        return summary
