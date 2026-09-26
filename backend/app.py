from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_mail import Mail, Message
from dotenv import load_dotenv
from database import get_db_connection
import os

load_dotenv()

print("MAIL USER:", os.getenv("MAIL_USERNAME"))
print("MAIL SENDER:", os.getenv("MAIL_DEFAULT_SENDER"))

app = Flask(__name__)
CORS(app)

# =========================
# EMAIL CONFIGURATION
# =========================

app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

mail = Mail(app)


# =========================
# HOME
# =========================

@app.route("/")
def home():
    return "Lahiru Portfolio Backend is running!"


# =========================
# CONTACT API
# =========================

@app.route("/api/contact", methods=["POST"])
def contact():

    try:
        data = request.get_json()

        name = data.get("name", "").strip()
        email = data.get("email", "").strip()
        message = data.get("message", "").strip()

        if not name or not email or not message:
            return jsonify({
                "success": False,
                "message": "Please complete all fields."
            }), 400

        # =========================
        # SAVE TO DATABASE
        # =========================

        connection = get_db_connection()
        cursor = connection.cursor()

        sql = """
            INSERT INTO contacts (name, email, message)
            VALUES (%s, %s, %s)
        """

        cursor.execute(sql, (name, email, message))
        connection.commit()

        cursor.close()
        connection.close()


        # =========================
        # SEND EMAIL
        # =========================

        msg = Message(
            subject=f"Portfolio Contact — {name}",
            recipients=[os.getenv('MAIL_USERNAME')],
            reply_to=email
        )

        msg.body = f"""
You received a new message from your portfolio website.

Name: {name}
Email: {email}

Message:
{message}
"""

        mail.send(msg)


        # =========================
        # SUCCESS RESPONSE
        # =========================

        return jsonify({
            "success": True,
            "message": "Message sent successfully."
        })


    except Exception as error:

        print("Error:", error)

        return jsonify({
            "success": False,
            "message": "Something went wrong."
        }), 500


# =========================
# RUN SERVER
# =========================


@app.route("/test-email")
def test_email():
    try:
        msg = Message(
            subject="Lahiru Portfolio Email Test",
            sender=os.getenv("MAIL_USERNAME"),
            recipients=[os.getenv("MAIL_USERNAME")]
        )

        msg.body = "This is a test email from your Flask portfolio backend."

        mail.send(msg)

        return "Email sent successfully!"

    except Exception as error:
        print("EMAIL ERROR:", error)
        return f"Email failed: {error}", 500

    
if __name__ == "__main__":
    app.run(debug=True)