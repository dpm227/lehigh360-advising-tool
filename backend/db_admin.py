import pyodbc
import re
import os
from bs4 import BeautifulSoup
import requests
import time
import datetime

# Global response
RESPONSE = {
    "response_code": "",
    "message": "",
    "line": "",
    "file": os.path.basename(__file__),
    "data": "",
}
EXPIRY = 15

def get_linenumber():
    return currentframe().f_back.f_lineno

def get_time():
    return str(time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()))

class Admin:
    def __init__(self, azure_connection_string, table_name="students"):
        self.conn_str = azure_connection_string
        self.table_name = table_name
        self.setup_table()

    def connect(self):
        return pyodbc.connect(self.conn_str)

    def setup_table(self):
        try:
            conn = self.connect()
            cursor = conn.cursor()
            cursor.execute(f"""
                CREATE TABLE IF NOT EXISTS {self.table_name} (
                    name NVARCHAR(255) NOT NULL, 
                    major NVARCHAR(255) NOT NULL, 
                    year NVARCHAR(255) NOT NULL, 
                    email NVARCHAR(255) NOT NULL PRIMARY KEY
                )
            """)
            conn.commit()
        except Exception as e:
            print("Error in setup_table:", e)
        finally:
            conn.close()

    def check_time(self):
        try:
            conn = self.connect()
            cursor = conn.cursor()
            cursor.execute("SELECT TOP 1 date FROM programs")
            row = cursor.fetchone()  # date column
        except pyodbc.OperationalError:
            return True  # If programs table doesn't exist, scrape

        if row:
            timestamp = datetime.datetime.strptime(row[0], "%Y-%m-%d %H:%M:%S")
            return (datetime.datetime.now() - timestamp).days > EXPIRY
        return True

    def scrape_lu_data(self):
        if self.check_time():
            print("Scraping data from LU db webpage.")
            time_stamp = get_time()
            try:
                from bs4 import BeautifulSoup
                import requests

                conn = self.connect()
                cursor = conn.cursor()
                cursor.execute("DROP TABLE IF EXISTS programs")
                cursor.execute("""
                    CREATE TABLE programs (
                        id INT PRIMARY KEY IDENTITY,
                        date NVARCHAR(255) NOT NULL,
                        program_name NVARCHAR(255) NOT NULL,
                        program_description NVARCHAR(MAX) NOT NULL
                    )
                """)

                # Scrape the data
                base_url = "https://creativeinquiry.lehigh.edu"
                page = requests.get(f"{base_url}/lehigh-360/lehigh-360-high-impact-programs-database")
                soup = BeautifulSoup(page.text, "html.parser")
                project_urls = soup.find_all("h4", class_="field-content")
                
                for project in project_urls:
                    project_name = project.get_text()
                    project_url = base_url + project.find("a").get("href")
                    project_page = requests.get(project_url)
                    content = BeautifulSoup(project_page.text, "html.parser").find("div", class_="node__content").get_text().strip()
                    content = content.replace("\u00a0", " ").replace("\n", "")
                    
                    cursor.execute("""
                        INSERT INTO programs (date, program_name, program_description)
                        VALUES (?, ?, ?)
                    """, (time_stamp, project_name, content))
                conn.commit()
            except Exception as e:
                print("Error in scrape_lu_data:", e)
            finally:
                conn.close()
        else:
            print("Data up to date!")
        return True

    def get_students(self):
        try:
            conn = self.connect()
            cursor = conn.cursor()
            cursor.execute("SELECT name, major, year, email FROM students")
            for row in cursor.fetchall():
                yield {row[3]: {"name": row[0], "major": row[1], "year": row[2]}}
        except Exception as e:
            print("Error in get_students:", e)
        finally:
            conn.close()

    def student_exist(self, email):
        try:
            conn = self.connect()
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM students WHERE email = ?", (email,))
            return cursor.fetchone()[0] > 0
        except Exception as e:
            print("Error in student_exist:", e)
            return False
        finally:
            conn.close()

    def create_student_record_table(self, email):
        try:
            conn = self.connect()
            cursor = conn.cursor()
            cursor.execute(f"""
                CREATE TABLE IF NOT EXISTS [{email}] (
                    number INT PRIMARY KEY IDENTITY, 
                    date DATE DEFAULT GETDATE(),
                    program NVARCHAR(255) NOT NULL,
                    summary NVARCHAR(MAX) NOT NULL, 
                    questions NVARCHAR(MAX) NOT NULL,
                    answers NVARCHAR(MAX) NOT NULL
                )
            """)
            conn.commit()
            return f"Created table for {email}."
        except Exception as e:
            print("Error in create_student_record_table:", e)
            return None
        finally:
            conn.close()

    def verify_year(self, year):
        valid_years = ["First Year", "Second Year", "Freshman", "Sophomore", "Junior", "Senior"]
        return year in valid_years

    def verify_email(self, email):
        return bool(re.match(r"^[A-Za-z]{3}\d{3}$", email))

    def add_student(self, name, major, year, email):
        if not self.verify_year(year) or not self.verify_email(email):
            return {"response_code": 402, "message": "Invalid year or email format."}

        try:
            conn = self.connect()
            cursor = conn.cursor()
            cursor.execute("INSERT INTO students (name, major, year, email) VALUES (?, ?, ?, ?)", (name, major, year, email))
            conn.commit()
            return {"response_code": 201, "message": f"Added {name} to students table."}
        except Exception as e:
            print("Error in add_student:", e)
            return {"response_code": 500, "message": "Error adding student."}
        finally:
            conn.close()

    def fetch_data(self, email):
        try:
            conn = self.connect()
            cursor = conn.cursor()
            cursor.execute(f"SELECT * FROM students WHERE email = ?", (email,))
            student_info = cursor.fetchone()
            if not student_info:
                return {"data": {"info": {}, "recordings": []}}

            student_dict = {
                "name": student_info[0],
                "major": student_info[1],
                "year": student_info[2],
                "email": student_info[3]
            }

            cursor.execute(f"SELECT * FROM [{email}]")
            recordings = (dict(zip(["number", "date", "program", "summary", "questions", "answers"], row)) for row in cursor.fetchall())

            return {"data": {"info": student_dict, "recordings": list(recordings)}}
        except Exception as e:
            print("Error in fetch_data:", e)
            return {"data": {"info": {}, "recordings": []}}
        finally:
            conn.close()

    def record_student(self, email, program, summary, questions, answers):
        try:
            conn = self.connect()
            cursor = conn.cursor()
            cursor.execute(f"INSERT INTO [{email}] (program, summary, questions, answers) VALUES (?, ?, ?, ?)", (program, summary, questions, answers))
            conn.commit()
            return {"response_code": 201, "message": f"Recorded entry for {email}"}
        except Exception as e:
            print("Error in record_student:", e)
            return {"response_code": 500, "message": "Error recording student data."}
        finally:
            conn.close()

    def close(self):
        try:
            conn = self.connect()
            conn.close()
        except Exception as e:
            print("Error in closing connection:", e)
