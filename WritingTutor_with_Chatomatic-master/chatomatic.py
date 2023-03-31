# Case is not important in the questions

from qa_database import *
import random
from rank_bm25 import *
import numpy as np
import json
import yaml
from sentence_transformers import SentenceTransformer, util
from transformers import AutoTokenizer, AutoModel
import torch

sent_sim_model = SentenceTransformer('sentence-transformers/msmarco-distilbert-base-tas-b')


class Chatomatic:
    random_generator = random.Random()
    cache = {}
    language = ""
    questions = []

    def _load_from_yaml(self, file_name):
        with open(file_name, 'r', encoding="utf-8") as f:
            conversations = yaml.safe_load(f)['conversations']
            new_questions = []
            for conversation in conversations:
                print("conversation---------")
                print(conversation)
                print("---------")
                answers = []
                # first term of conversation is the question
                for i in range(1, len(conversation), 2):
                    answers.append(conversation[i])
                new_questions.append(Question(conversation[0].lower(), answers))
                # new_questions.append({conversation[0].lower(): answers})
            self.questions = new_questions

    def _load_from_json(self, file_name):
        with open(file_name, 'r', encoding="utf-8") as f:
            conversations = json.load(f)['conversations']
            new_questions = []
            for conversation in conversations:
                all_answers = []
                for answer in conversation['answers']:
                    all_answers.append(answer)
                new_questions.append(Question(conversation['question'].lower(), all_answers))
                # new_questions.append({conversation['question'].lower(): all_answers})
            self.questions = new_questions

    def load_from_dataset(self, file_path):
        if file_path.endswith('.yml') or file_path.endswith('.yaml'):
            self._load_from_yaml(file_path)
        elif file_path.endswith('.json'):
            self._load_from_json(file_path)

    def __init__(self, file_path, language="en"):
        self.language = language
        self.load_from_dataset(file_path)

        f = open(file_path, 'r', encoding="utf-8")
        content = f.read()
        f.close()

    # def add_dataset(self, file_path, language="en"):
    #     if not language in self.qa_databases:
    #         self.qa_databases[language] = QADatabase()
    #     self.load_from_dataset(file_path, self.qa_databases[language])

    def find_answer_to_question(self, question):
        """
        Finds an exact match to the question prompted by the user. Used for buttons especially. If fails to find
        an exact match, return None and uses a model to find the most similar question.
        """
        answer = None
        for qa in self.questions:
            if qa.title == question:
                # output a random answer from possible answer to a question
                answer = self.random_generator.choice(qa.answers)
        return answer

    def _find_most_similar_question_transformers(self, question):
        """
        Uses transformer model to find the similarity between the question of the user and predefined possible questions

        :param question: question of the user
        :return:
            String, the bot's response
        """
        corpus = [doc.title for doc in self.questions]
        print(corpus)
        # encode the question from the user and possible asked questions
        corpus_embeddings = sent_sim_model.encode(corpus, convert_to_tensor=True)
        sentence_embedding = sent_sim_model.encode(question, convert_to_tensor=True)
        # compute the similarity and find the best match
        cos_scores = util.pytorch_cos_sim(sentence_embedding, corpus_embeddings)[0]
        top_result = np.argpartition(-cos_scores, range(1))[0]
        print("best result")
        print(self.questions[top_result])
        return self.questions[top_result]

    def _find_most_similar_question_bm25(self, question):
        """
        Uses bm25 model to find the similarity between the question of the user and predefined possible questions

        :param question: question of the user
        :return:
            String, the bot's response
        """
        tokenized_corpus = [doc.title.split(" ") for doc in self.questions]
        bm25 = BM25Okapi(tokenized_corpus)
        tokenized_query = question.split(" ")
        doc_scores = bm25.get_scores(tokenized_query)
        doc_scores = list(doc_scores)
        return self.questions[doc_scores.index(max(doc_scores))]

    def find_most_similar_question(self, question, language="en", method="transformers"):  # bm25 / transformers
        # From https://www.analyticsvidhya.com/blog/2021/05/build-your-own-nlp-based-search-engine-using-bm25/
        # todo: should we use cache? Using cache will generate the same answer, not okay for chatGPT
        # if language not in self.cache:
        #     self.cache[language] = {}
        # if question in self.cache[language]:
        #     return self.cache[language][question]
        result = ""
        if method == "bm25":
            result = self._find_most_similar_question_bm25(question)
        elif method == "transformers":
            result = self._find_most_similar_question_transformers(question)
        # self.cache[language][question] = result
        return result

    def answer(self, question, language="en", method_for_similarity="transformers"):
        """
        Tries to find the exact question
        """
        question = question.lower()
        answer = self.find_answer_to_question(question)
        # if no exact answer is found, ask neural model to find the most similar one
        if answer is None:
            answer = self.random_generator.choice(
                self.find_most_similar_question(question, language, method_for_similarity).answers)
        return answer
