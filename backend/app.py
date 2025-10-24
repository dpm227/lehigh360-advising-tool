from flask import (
    Flask,
    redirect,
    request,
    url_for,
    render_template,
    send_from_directory,
    jsonify,
    session
)
from flask_restful import Api
from flask_cors import CORS
from logic import Logic

# from db_admin import Admin
from json_admin import Admin
import copy
import os

# imports added for auth0
import json
from os import environ as env
from urllib.parse import quote_plus, urlencode
from flask_session import Session
from datetime import timedelta

from authlib.integrations.flask_client import OAuth
from dotenv import find_dotenv, load_dotenv

# imports for azure database
import pyodbc

# memory profiler
from memory_profiler import memory_usage

# Azure Connection string
connection_string = str(env.get("AZURE_CONNECTION_STRING"))

# instances of flask, api, and db
app = Flask(__name__, static_folder='static')
api = Api(app)
logic = Logic(connection_string)
admin = Admin(connection_string)
app.secret_key = env.get("APP_SECRET_KEY") # secret_key for auth0

# allowing my local React frontend to access backend route(specifically get_students)
CORS(app)

# Session
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# CONSTANTS
DB_NAME = "./db.sqlite"
# Load environment variables from .env file
FRONTEND_LINK = env.get("FRONTEND_URL", "http://localhost:3000") # Default to localhost if not set

# # Serve the React index.html for any other route
# @app.route('/', defaults={'path': ''})
# @app.route('/<path:path>')
# def serve_react_app(path):
#     if path != "" and path.startswith('api/'):
#         # If the request is for an API endpoint, return a 404
#         return jsonify({"message": "API endpoint not found"}), 404
#     return send_from_directory(app.static_folder, 'index.html')

# auth0
oauth = OAuth(app)

oauth.register(
    "auth0",
    client_id=env.get("AUTH0_CLIENT_ID"),
    client_secret=env.get("AUTH0_CLIENT_SECRET"),
    client_kwargs={
        "scope": "openid profile email",
    },
    server_metadata_url=f'https://{env.get("AUTH0_DOMAIN")}/.well-known/openid-configuration'
)

@app.route("/")
def home():
    return redirect(url_for("login"))


#@app.route("/get_students")
#def get_students():
#    students = admin.get_students()
#    return students, 201

# ---------------< student routes >--------------
@app.route("/record_meeting")
def record_meeting():
    return render_template("record_meeting.html")


@app.route("/find_student/<email>")
def find_student(email):
    res = admin.student_exist(email)
    if res:
        return "True", 201
    else:
        return "False", 201


@app.route("/upload_recording", methods=["GET", "POST"])
def upload_recording():
    if request.method == "POST":
        logic = Logic(admin)
        recording_file = request.files["file"]


        file_path = os.path.join('uploads', recording_file.filename)
        recording_file.save(file_path)

        transcript = logic.transcribe_audio(file_path)
        email = request.form["email"]
        transcript_data = logic.process_transcript(transcript, auth_id=session.get("auth_id"))
        print("working")
        res = admin.add_recording(
            email,
            transcript_data["summary"],
            transcript_data["program"],
            transcript_data["questions"],
            transcript_data["answers"],
            transcript,
        )

        os.remove(file_path)

        return str(res), 201
        
        # TODO: process the transcript of that recording file
    return render_template("upload_recording.html")

@app.route('/recordings/<int:recording_id>', methods=['DELETE'])
def delete_recording(recording_id):
    try:
        result = admin.delete_recording(recording_id)
        if result:
            return jsonify({"success": True, "deleted_id": recording_id}), 200
        else:
            return jsonify({"error": "Delete failed"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/type_notes")
def type_notes():
    return render_template("type_notes.html")


@app.route("/meeting_detail")
def meeting_detail():
    return render_template("meeting_detail.html")


@app.route("/send_email")
def send_email():
    return render_template("send_email.html")

#@app.route('/get_students', methods=['GET'])
#def get_students():
    #print(session)
    #print("Session State:", session.get('oauth_state'))

    #auth_id = session.get("auth_id")
    #print("auth id is ", auth_id)
#    auth_id = request.headers.get('Authorization')  # Get authId from headers
    #print("Auth id is :", auth_id)
#    try:
#        conn = pyodbc.connect(connection_string)
#        cursor = conn.cursor()
#        cursor.execute("SELECT name, major, year, email FROM students WHERE counselor_id = ?", auth_id)
#        rows = cursor.fetchall()
        
        # Convert rows to a list of dictionaries
#        students = [
#            {
#                'name': row[0],
#                'major': row[1],
#                'year': row[2],
#                'email': row[3]
#            } for row in rows
#        ]
#        return jsonify(students)
#        
#    except Exception as e:
#        return jsonify({"error": str(e)}), 500

def fetch_students(cursor):
    while True:
        rows = cursor.fetchmany(100)
        if not rows:
            break
        for row in rows:
            yield {
                'name': row[0],
                'major': row[1],
                'year': row[2],
                'email': row[3]
            }

@app.route('/get_students', methods=['GET'])
def get_students():
    auth_id = request.headers.get('Authorization')  # Get authId from headers
    try:
        conn = pyodbc.connect(connection_string)
        cursor = conn.cursor()
        cursor.execute("SELECT name, major, year, email FROM students WHERE counselor_id = ?", auth_id)
        rows = cursor.fetchall()
        
        # Convert rows to a list of dictionaries
        students = [
            {
                'name': row[0],
                'major': row[1],
                'year': row[2],
                'email': row[3]
            } for row in rows
        ]
        return jsonify(students)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/add_student")
def append_student():
    return render_template("add_student.html")


@app.route("/export_data")
def export():
    return admin.export()

# ---------------< Auth0 routes >--------------
@app.route("/login")
def login():
    session['oauth_state'] = 'some_random_value'
    session.permanent = True
    return oauth.auth0.authorize_redirect(
        redirect_uri=url_for("callback", _external=True),
        state=session['oauth_state']
    )

@app.route("/callback", methods=["GET", "POST"])
def callback():
    token = oauth.auth0.authorize_access_token()
    user_info = token.get("userinfo")
    session["user"] = {
        "email": user_info["email"],
        "name": user_info.get("name", "No Name"),
        "auth_id": user_info["sub"]
    }

    email = user_info["email"]
    name = user_info.get("name", "No Name")
    auth_id = user_info["sub"]

    try:
        conn = pyodbc.connect(connection_string)
        cursor = conn.cursor()

        check_user_query = "SELECT * FROM users WHERE auth_id = ?"
        cursor.execute(check_user_query, (auth_id,))
        existing_user = cursor.fetchone()

        if not existing_user:
            insert_user_query = """
            INSERT INTO users (auth_id, name, email) VALUES (?, ?, ?)
            """
            cursor.execute(insert_user_query, (auth_id, name, email))
            conn.commit()
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if 'conn' in locals() and conn:
            conn.close()
        return redirect(f"{FRONTEND_LINK}/callback?auth_id={auth_id}")

@app.route("/logout")
def logout():
    session.clear()
    return redirect(
        "https://" + env.get("AUTH0_DOMAIN")
        + "/v2/logout?"
        + urlencode(
            {
                "returnTo": url_for("home", _external=True),
                "client_id": env.get("AUTH0_CLIENT_ID"),
            },
            quote_via=quote_plus,
        )
    )

# ---------------< Operating Questioner >---------------
@app.route("/program_info", methods=["POST"])
def program_info_handler():
    # args and form are different! This took a long time to understand!
    program = request.form["program"]
    admin = Admin(conn=DB_NAME)
    logic = Logic(conn=admin.conn, cur=admin.cur)
    program_info = logic.find_program_info(program)
    return jsonify(program_info), 201


@app.route("/find_answer", methods=["POST"])
def find_answer_handler():
    program = request.form["program"]
    question = request.form["question"]
    admin = Admin(conn=DB_NAME)
    logic = Logic(conn=admin.conn, cur=admin.cur)
    answer = logic.find_answer(question, program)

    return jsonify({"answer": answer}), 201


@app.route("/program_names")
def get_program_names():
    admin = Admin(conn=DB_NAME)
    logic = Logic(conn=admin.conn, cur=admin.cur)
    programs = logic.get_programs()

    return jsonify(programs), 201


# ---------------< Operating Recordings >---------------
@app.route("/recordings/<email>", methods=["POST", "GET"])
def fetch_data(email):
    if request.method == "POST":
        res = admin.get_student(email)
        if res:  # Ensure `res` contains data
            return jsonify(res), 200  # 200 OK status if data is found
        else:
            return jsonify({"error": "Student not found or data unavailable"}), 404  # 404 Not Found if no data
    else:
        return render_template("meeting_detail.html", email=email)


@app.route("/add_student", methods=["GET", "POST"])
def add_student():
    if request.method == "POST":
        email = request.form["email"]
        name = request.form["name"]
        major = request.form["major"]
        year = request.form["year"]
        
        # Get auth_id from the form data
        auth_id = request.form.get("auth_id")  # Use request.form.get to retrieve the auth_id

        try:
            conn = pyodbc.connect(connection_string)
            cursor = conn.cursor()
            
            insert_query = """
            INSERT INTO students (counselor_id, name, major, year, email)
            VALUES (?, ?, ?, ?, ?)
            """
            cursor.execute(insert_query, (auth_id, name, major, year, email))
            conn.commit()
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        finally:
            if conn:
                conn.close()

        return redirect(FRONTEND_LINK)  # Redirect after successful insertion
    
    return render_template("add_student.html")

@app.route("/remove_student", methods=["GET", "POST"])
def remove_student():
    if request.method == "POST":
        email = request.form["email"]
        name = request.form["name"]
        major = request.form["major"]
        year = request.form["year"]

        try:
            conn = pyodbc.connect(connection_string)
            cursor = conn.cursor()

            # Delete recordings linked to the student first
            delete_recordings_query = """
            DELETE FROM recordings 
            WHERE student_id = (
                SELECT student_id FROM students WHERE email = ?
            )
            """
            cursor.execute(delete_recordings_query, (email,))

            # Then delete the student
            delete_student_query = """
            DELETE FROM students 
            WHERE name = ? AND major = ? AND year = ? AND email = ?
            """
            cursor.execute(delete_student_query, (name, major, year, email))
            conn.commit()

        except Exception as e:
            return jsonify({"error": str(e)}), 500

        finally:
            if conn:
                conn.close()

        return redirect(FRONTEND_LINK)

    return render_template("remove_student.html")


@app.route("/recordings/transcript", methods=["POST"])
def transcript():
    transcript = request.form["transcript"]
    email = request.form["email"]
    program = request.form["program"]

    print("working")
    # Retrieve auth_id from Authorization header
    counselor_id = request.headers.get("Authorization")
    if not counselor_id:
        return jsonify({"error": "auth_id is required"}), 400

    transcript_data = logic.process_transcript(transcript, counselor_id)

    # Pass counselor_id to add_recording
    res = admin.add_recording(
        email,
        transcript_data["summary"],
        program,
        transcript_data["questions"],
        transcript_data["answers"],
        transcript,
        counselor_id
    )

    return str(res), 201

@app.route("/recordings/send_email", methods=["POST"])
def email():
    student_email = request.form["student_email"]
    advisor_email = request.form["advisor_email"]
    summary = request.form["summary"]
    program = request.form["program"]
    date = request.form["date"]

    success = logic.send_email(student_email, advisor_email, summary, program, date)

    if success:
        return jsonify({"data": True}), 201
    else:
        return jsonify({"error": "Failed to send email"}), 500



if __name__ == "__main__":
    host = os.getenv("FLASK_RUN_HOST", "0.0.0.0")  # Ensure it's 0.0.0.0
    port = int(os.getenv("FLASK_RUN_PORT", 8000))  # Ensure it's 8000
    app.run(host=host, port=port, debug=True)
    #app.run(debug=True, port="8000")
