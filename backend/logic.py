import pyodbc
import speech_recognition as sr
import smtplib
import re
from datetime import datetime
from fuzzywuzzy import process
import os
import requests
#from openai import OpenAI
#import whisper

# Configuration and setup
key = ""
#client = OpenAI(api_key=key)
time = datetime.now()
RESPONSE = {
    "summary": "",
    "program": "",
    "questions": [],
    "answers": [],
    "email_content": "",
}
#model = whisper.load_model("base")

# MAILERSENDER
MAILERSEND_API_TOKEN = os.getenv("MAILERSEND_API_TOKEN")
MAILERSEND_SENDER = os.getenv("MAILERSEND_SENDER")

class Logic:
    def __init__(self, connection_string) -> None:
        self.conn_str = connection_string
        self.mailersend_token = os.getenv("MAILERSEND_API_TOKEN")
        self.mailersend_sender = os.getenv("MAILERSEND_SENDER")

    def connect(self):
        return pyodbc.connect(self.conn_str)

    def chat(self, message):
        #"""
        #Method to use GPT-4 with a given message string.
        #"""
        #stream = client.chat.completions.create(
        #    model="gpt-3.5-turbo",
        #    messages=[{"role": "user", "content": message}],
        #    stream=True,
        #)
        #s = ""
        #for chunk in stream:
        #    try:
        #        s += chunk.choices[0].delta.content
        #    except TypeError:
        #        return s
        return "GPT-4 is temporarily disabled for testing. No response generated."

    def get_transcript(self, recording_file):
        # """
        # Generates the speech to text from a .wav file. Returns a string.
        # """
        # listener = sr.Recognizer()
        # with sr.AudioFile(recording_file) as source:
        #     audio_data = listener.record(source)
        # transcript = listener.recognize_google(audio_data)
        # return transcript
        return "GPT-4 is temporarily disabled for testing. No response generated."

    def transcribe_audio(self, file_path):
        # """
        # Generates the speech to text from a .wav file using Whisper. Returns a string.
        # """
        # audio = whisper.load_audio(file_path)
        # response = model.transcribe(audio)
        # return response['text']
        return "GPT-4 is temporarily disabled for testing. No response generated."

    def match_programs(self, user_utterance, auth_id):
        """
        Uses fuzzy strings to match user utterances to sample utterances. Returns the best match program as a string.
        """
        try:
            conn = self.connect()
            cursor = conn.cursor()
            cursor.execute("SELECT program_name FROM programs WHERE auth_id = ?", (auth_id,))
            programs = [row[0] for row in cursor.fetchall()]
            best_match = process.extractOne(user_utterance, programs)
            return best_match[0] if best_match and best_match[1] >= 80 else False
        except Exception as e:
            print("Error in match_programs:", e)
            return None
        finally:
            conn.close()

    def find_program_info(self, program, auth_id):
        """
        Returns a string containing the specified program's description.
        """
        try:
            conn = self.connect()
            cursor = conn.cursor()
            cursor.execute(
                "SELECT program_description FROM programs WHERE program_name = ? AND auth_id = ?", (program, auth_id)
            )
            description = cursor.fetchone()
            if description:
                program_info = description[0].replace("Website:", "<br><br>Website: ")
                program_info = program_info.replace("Contact:", "<br><br>Contact: ")
                program_info = program_info.replace("Timeline:", "<br><br>Timeline: ")
                program_info = program_info.split("Cost/Funding: ")
                return {"info": program_info[0], "name": program}
            return None
        except Exception as e:
            print("Error in find_program_info:", e)
            return None
        finally:
            conn.close()

    def get_programs(self, auth_id):
        """
        Returns a dict of programs with key "program_name".
        """
        try:
            conn = self.connect()
            cursor = conn.cursor()
            cursor.execute("SELECT program_name FROM programs WHERE auth_id = ?", (auth_id,))
            programs = [row[0] for row in cursor.fetchall()]
            return {"program_name": programs}
        except Exception as e:
            print("Error in get_programs:", e)
            return None
        finally:
            conn.close()

    def find_answer(self, question, program, auth_id):
        # """
        # Uses GPT-4 to find the answer to a given question for a specified program.
        # """
        # try:
        #     conn = self.connect()
        #     cursor = conn.cursor()
        #     cursor.execute(
        #         "SELECT program_description FROM programs WHERE program_name = ? AND auth_id = ?", (program, auth_id)
        #     )
        #     info = cursor.fetchone()
        #     if info:
        #         instructions = "You need to answer the following question with the given school program information for students. You need to be short and concise."
        #         message = f"Your instructions: {instructions} \n\nInformation about the program: {info[0]} \n\nThe question is {question}"
        #         return self.chat(message)
        #     return "Program information not found."
        # except Exception as e:
        #     print("Error in find_answer:", e)
        #     return None
        # finally:
        #     conn.close()
        return None

    def find_questions(self, transcript):
        # """
        # Find the questions raised in a transcript using GPT-4. Returns questions (list) and the program(s) the question was about.
        # """
        # instructions = "I will pass in a meeting between a student and advisor. Can you pick out all the questions that were raised in the meeting in a list format. Here is the meeting\n\n"
        # questions = self.chat(f"{instructions}{transcript}")
        # questions = re.findall(r"- (.+)", questions)
        # program_utterance = self.chat(
        #     f"what is the name of the program in this discussion. Just give me the name only. Here is the discussion: \n\n{transcript}"
        # )
        # return {
        #     "questions": questions,
        #     "program_utterance": program_utterance,
        # }
        return None

    def meeting_summary(self, transcript):
        # """
        # Generates a meeting summary from a transcript.
        # """
        # instructions = "You are given a meeting transcript between a student and advisor. Create a short summary, in a conversational tone and friendly manner, of the meeting. Here is the meeting transcript\n\n"
        # return self.chat(f"{instructions} {transcript}")
        return None

    #def process_transcript(self, transcript, auth_id):
        # """
        # Drafts an email with the transcript summary, questions, and answers.
        # """
        # data = self.find_questions(transcript)
        # questions, program_utterance = data["questions"], data["program_utterance"]
        # program = self.match_programs(program_utterance, auth_id)
        # summary = self.meeting_summary(transcript)
        # s_question, s_answer = "", ""
        # answers = []

        # if program:
        #     for i, question in enumerate(questions):
        #         answer = self.find_answer(question, program, auth_id)
        #         question = question.replace("*", "")
        #         s_question += f"{i + 1}) {question}\n"
        #         s_answer += f"{i + 1}) {answer}\n"
        #         answers.append(answer.replace("'", ""))
        # else:
        #     program = f"{program_utterance}, Not found"

        # formatted_time = time.strftime("%I:%M %p %Z on %b %d, %Y")
        # content = f"Meeting at {formatted_time} \n\n{summary} \n\nQuestions raised about the {program}: \n{s_question} \nAnswers:\n{s_answer}"

        # RESPONSE.update({
        #     "email_content": content,
        #     "questions": questions,
        #     "summary": summary,
        #     "answers": answers,
        #     "program": program
        # })

        # return RESPONSE
        #return None
    
    def process_transcript(self, transcript, auth_id):
        answers = []
        questions = []
        program = "Program not found"
        summary = "Summary not found"
        s_question = ""
        s_answer = ""
        
        summary = transcript # making the summary the transcript for now

        formatted_time = time.strftime("%I:%M %p %Z on %b %d, %Y")
        content = f"Meeting at {formatted_time} \n\n{summary} \n\nQuestions raised about the {program}: \n{s_question} \nAnswers:\n{s_answer}"

        RESPONSE.update({
            "email_content": content,
            "questions": questions,
            "summary": summary,
            "answers": answers,
            "program": program
        })
        return RESPONSE
    def send_email(self, student_email, advisor_email, summary, program, date):
        subject = "Your LU360 Meeting Summary"
        body = f"""\
Here are the details of your recent meeting:

📅 Date: {date}
🎓 Program: {program}
📝 Summary:
{summary}

Best,
LU360 Team
"""

        payload = {
            "from": {
                "email": self.mailersend_sender,
                "name": "LU360"
            },
            "to": [
                {"email": student_email},
                {"email": advisor_email}
            ],
            "subject": subject,
            "text": body
        }

        headers = {
            "Authorization": f"Bearer {self.mailersend_token}",
            "Content-Type": "application/json"
        }

        response = requests.post("https://api.mailersend.com/v1/email", headers=headers, json=payload)

        if response.status_code in [200, 202]:
            return True
        else:
            print("MailerSend error:", response.status_code, response.text)
            return False