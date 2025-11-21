from flask import Flask, request, jsonify
from supabase import create_client
from dotenv import load_dotenv
import os
import bcrypt

# Load env
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
app = Flask(__name__)

# --------- Routes ---------
@app.route("/")
def home():
    return "🌿 EcoBadge Auth Server Running!"

# --------- Signup ---------
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"status": "error", "message": "Email and password required"}), 400

    try:
        # Check if user already exists
        existing = supabase.table("user").select("*").eq("email", email).execute()
        if existing.data and len(existing.data) > 0:
            print(f"Signup failed: Email {email} already exists")
            return jsonify({"status": "error", "message": "Email already exists"}), 409

        # Hash password
        hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        # Insert user
        response = supabase.table("user").insert({"email": email, "passwords": hashed_pw}).execute()
        print(f"User created successfully: {email}")

        return jsonify({"status": "success", "message": "User created"}), 201

    except Exception as e:
        # Catch APIError or other exceptions
        print(f"Signup error for {email}: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500



# --------- Login ---------
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"status": "error", "message": "Email and password required"}), 400

    # Fetch user
    try:
        response = supabase.table("user").select("*").eq("email", email).execute()
        user = response.data[0] if response.data else None

        if user and bcrypt.checkpw(password.encode("utf-8"), user["passwords"].encode("utf-8")):
            print(f"Login successful: {email}")
            return jsonify({"status": "success", "message": "Login successful", "user_id": user["id"]})
        else:
            print(f"Login failed: Invalid credentials for {email}")
            return jsonify({"status": "error", "message": "Invalid credentials"}), 401
    except Exception as e:
        print(f"Login error for {email}: {str(e)}")
        return jsonify({"status": "error", "message": "Login error occurred"}), 500


# --------- Run Server ---------
if __name__ == "__main__":
    app.run(debug=True)
