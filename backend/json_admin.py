import pyodbc
import os
import time
from inspect import currentframe
import json

# Global response
RESPONSE = {
    "message": "",
    "data": "",
    "response_code": "",
    "line": "",
    "file": os.path.basename(__file__),
}

def get_linenumber():
    return currentframe().f_back.f_lineno

def get_time():
    return str(time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()))

class Admin:
    def __init__(self, azure_connection_string) -> None:
        self.conn_str = azure_connection_string

    def connect(self):
        return pyodbc.connect(self.conn_str)

    def student_exist(self, email):
        try:
            conn = self.connect()
            cursor = conn.cursor()
            cursor.execute("SELECT email FROM students WHERE email = ?", (email,))
            return cursor.fetchone() is not None
        except Exception as e:
            print("Error in student_exist:", e)
            return False
        finally:
            conn.close()

    def get_student(self, email):
        if not self.student_exist(email):
            return False

        data = {
            "student_info": None,
            "summary": None,
            "questions_answers": None,
        }

        try:
            conn = self.connect()
            cursor = conn.cursor()

            # Fetch student details using email
            cursor.execute("SELECT student_id, name, major, year, email FROM students WHERE email = ?", (email,))
            student_info = cursor.fetchone()
            if student_info:
                student_id = student_info[0]
                data["student_info"] = {
                    "name": student_info[1],
                    "major": student_info[2],
                    "year": student_info[3],
                    "email": student_info[4]
                }

                # Fetch recordings for the student using student_id
                cursor.execute("SELECT id, timestamp, program, summary FROM recordings WHERE student_id = ?", (student_id,))
                data["summary"] = [dict(zip(["id", "timestamp", "program", "summary"], row)) for row in cursor.fetchall()]

                # Fetch questions and answers for the student using student_id
                cursor.execute("SELECT id, questions, answers FROM questions_answers WHERE student_id = ?", (student_id,))
                data["questions_answers"] = [dict(zip(["id", "questions", "answers"], row)) for row in cursor.fetchall()]
            return data
        except Exception as e:
            print("Error in get_student:", e)
            return None
        finally:
            conn.close()

    def add_recording(self, student_email, summary, program, questions, answers, transcript, counselor_id):
        try:
            conn = self.connect()
            cursor = conn.cursor()

            # Retrieve student_id using student_email
            cursor.execute("SELECT student_id FROM students WHERE email = ?", (student_email,))
            result = cursor.fetchone()
            if not result:
                print("Error: Student with email", student_email, "not found.")
                return False
            student_id = result[0]  # Extract student_id from query result

            # Insert into recordings table, ensuring student_email is not null
            cursor.execute(
                "INSERT INTO recordings (student_id, student_email, timestamp, program, summary, transcript, counselor_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (student_id, student_email, get_time(), program, summary, transcript, counselor_id)
            )
            
            # Proceed with questions_answers insert
            cursor.execute(
                "INSERT INTO questions_answers (student_id, questions, answers, counselor_id, student_email) VALUES (?, ?, ?, ?, ?)",
                (student_id, json.dumps(questions), json.dumps(answers), counselor_id, student_email)
            )
            
            conn.commit()
            print(f"Recording added successfully for student {student_email}.")
            return True
        except Exception as e:
            print("Error in add_recording:", e)
            return False
        finally:
            conn.close()

    def delete_recording(self, recording_id):
        try:
            conn = self.connect()
            cursor = conn.cursor()
            cursor.execute("DELETE FROM recordings WHERE id = ?", (recording_id,))
            conn.commit()
            print(f"Recording with ID {recording_id} deleted successfully.")
            return True
        except Exception as e:
            print("Error in delete_recording:", e)
            return False
        finally:
            if 'conn' in locals() and conn:
                conn.close()



    def export(self):
        """
        Export all database data for debugging or backup purposes.
        """
        try:
            conn = self.connect()
            cursor = conn.cursor()

            # Export students
            cursor.execute("SELECT * FROM students")
            students = [dict(zip([column[0] for column in cursor.description], row)) for row in cursor.fetchall()]

            # Export recordings
            cursor.execute("SELECT * FROM recordings")
            recordings = [dict(zip([column[0] for column in cursor.description], row)) for row in cursor.fetchall()]

            # Export questions_answers
            cursor.execute("SELECT * FROM questions_answers")
            questions_answers = [dict(zip([column[0] for column in cursor.description], row)) for row in cursor.fetchall()]

            return {"students": students, "recordings": recordings, "questions_answers": questions_answers}
        except Exception as e:
            print("Error in export:", e)
            return None
        finally:
            conn.close()
