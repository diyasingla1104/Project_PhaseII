from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import os

app = Flask(__name__)
CORS(app)

# ---------------- MySQL Connection ----------------
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",          # your MySQL username
        password="12345",     # your MySQL password
        database="corefit"
    )

# ---------------- Serve uploaded photos ----------------
@app.route('/uploads/photos/<filename>')
def uploaded_photos(filename):
    return send_from_directory('uploads/photos', filename)

# ---------------- Registration ----------------
@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        sql = """INSERT INTO users
                 (name, email, phone, age, gender, weight, goal, domain, program, password)
                 VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
        values = (
            data.get("name"), data.get("email"), data.get("phone"), data.get("age"),
            data.get("gender"), data.get("weight"), data.get("goal"),
            data.get("domain"), data.get("program"), data.get("password")
        )
        cursor.execute(sql, values)
        conn.commit()
        return jsonify({"message": "Registration successful"})
    except Error as e:
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()

# ---------------- Login ----------------
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        sql = "SELECT * FROM users WHERE email=%s AND password=%s"
        cursor.execute(sql, (data.get("email"), data.get("password")))
        user = cursor.fetchone()
        if user:
            return jsonify({"user": user})
        else:
            return jsonify({"error": "Invalid email or password"}), 400
    except Error as e:
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()

# ---------------- Offline Class ----------------
@app.route("/api/offline-register", methods=["POST"])
def offline_register():
    data = request.json
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        sql = """INSERT INTO offline_classes
                 (name, email, phone, date, timing, location, plan, amount)
                 VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"""
        values = (
            data.get("name"), data.get("email"), data.get("phone"), data.get("date"),
            data.get("timing"), data.get("location"), data.get("plan"), data.get("amount")
        )
        cursor.execute(sql, values)
        conn.commit()
        return jsonify({"message": "Offline class registration successful"})
    except Error as e:
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()

# ---------------- Live Class ----------------
@app.route("/api/live-register", methods=["POST"])
def live_register():
    data = request.json
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        sql = """INSERT INTO live_classes
                 (name, email, phone, date, time, plan)
                 VALUES (%s, %s, %s, %s, %s, %s)"""
        values = (
            data.get("name"), data.get("email"), data.get("phone"),
            data.get("date"), data.get("time"), data.get("plan")
        )
        cursor.execute(sql, values)
        conn.commit()
        return jsonify({"message": "Live class registration successful"})
    except Error as e:
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()

# ---------------- Testimonials ----------------
@app.route("/api/testimonial", methods=["POST"])
def testimonial():
    data = request.form
    files = request.files

    photo_path = ""

    if "photo" in files:
        photo = files["photo"]
        if photo.filename:
            os.makedirs('uploads/photos', exist_ok=True)
            photo_path = f"uploads/photos/{photo.filename}"
            photo.save(photo_path)

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        sql = """INSERT INTO testimonials (name, review, photo_path)
                 VALUES (%s, %s, %s)"""
        values = (data.get("name"), data.get("review"), photo_path)
        cursor.execute(sql, values)
        conn.commit()
        return jsonify({"message": "Testimonial submitted successfully"})
    except Error as e:
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()

@app.route("/api/testimonials", methods=["GET"])
def get_testimonials():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM testimonials")
        result = cursor.fetchall()
        return jsonify(result)
    except Error as e:
        return jsonify({"error": str(e)}), 400
    finally:
        cursor.close()
        conn.close()

# ---------------- Test Endpoint ----------------
@app.route("/api/test", methods=["GET"])
def test():
    return jsonify({"message": "Server is running"})

# ---------------- Run Server ----------------
if __name__ == "__main__":
    app.run(debug=True)
