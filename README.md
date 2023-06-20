# Run WritingTutor (06.06.2023)

### Front-End
1. Inside the *react_argue_tutor-main* folder, run
    1. `npm install`  wait for the dependencies to download
    2. `npm start`
2. Type in 1234-rdexp00 for static version of 1234-rdexp11 for dynamic, when the code is asked

### Back-end
Inside the WritingTutor_with_Chatomatic-master folder do:
1. Create a new environment (*python version 3.8 recommended*)
2. Activate the new environment
3. run `python requirements_installer.py` to install all the dependencies
4. run `python WritingTutorTG3.py` to start the server

### Celery and Redis
Backed server instance uses celery and redis to make parallel requests. 
You are required to instantiate the two services.
* [Install and activate](https://redis.io/docs/getting-started/installation/) 
Redis database
* Celery get already installed as pip dependency, you need to configure it properly (if needed)
   * inside *WritingTutor_with_Chatomatic-master* folder run `python3 -m celery -A WritingTutorTG3 worker` to start Celery


#### Troubleshooting
In case of error installing `de-core-news-sm` or `en-core-web-sm`, do the following:
1. comment out in the file `requirements.txt` the packages that cause problems
2. run the `python requirements_installer.py`
3. install manually by running the command `python -m spacy download de_core_news_sm` and `python -m spacy download en_core_web_sm`  

In case of other errors with dependencies, you can reference `chatbot-requirements.txt` file of the previous WritingTutor version.
