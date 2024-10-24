import os
from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
from bson import ObjectId
from PyPDF2 import PdfReader
import io
import json
from huggingface_hub import InferenceClient
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

load_dotenv()

app = Flask(__name__)

# Configure MongoDB and JWT
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

print(f"MongoDB URI: {app.config['MONGO_URI']}")  # Debug print

# Initialize extensions
try:
    mongo = PyMongo(app)
    # Test the connection
    mongo.db.command('ping')
    print("MongoDB connection successful!")
except Exception as e:
    print(f"MongoDB connection error: {str(e)}")
    raise e

jwt = JWTManager(app)

# Configure CORS with more specific settings
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://localhost:4173"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Initialize Hugging Face client
client = InferenceClient(os.getenv("HUGGINGFACE_TOKEN"))

@app.route("/api/test", methods=["GET"])
def test_route():
    try:
        # Test MongoDB connection
        mongo.db.users.find_one({})
        return jsonify({"message": "Backend is working correctly"}), 200
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

@app.route("/api/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        email = data.get("email")
        password = data.get("password")
        
        print(f"Signup attempt - Email: {email}")  # Debug print
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
            
        existing_user = mongo.db.users.find_one({"email": email})
        if existing_user:
            return jsonify({"error": "Email already exists"}), 400
            
        hashed_password = generate_password_hash(password)
        new_user = {
            "email": email,
            "password": hashed_password,
            "role": "student"
        }
        
        result = mongo.db.users.insert_one(new_user)
        user_id = str(result.inserted_id)
        
        token = create_access_token(identity=user_id)
        
        print(f"User created successfully - ID: {user_id}")  # Debug print
        
        return jsonify({
            "token": token,
            "user": {
                "id": user_id,
                "email": email,
                "role": "student"
            }
        }), 201
        
    except Exception as e:
        print(f"Signup error: {str(e)}")  # Debug print
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route("/api/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        email = data.get("email")
        password = data.get("password")
        
        print(f"Login attempt - Email: {email}")  # Debug print
        
        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400
        
        # TPO login check
        if email == "TPO@gmail.com" and password == "123":
            token = create_access_token(identity="tpo")
            return jsonify({
                "token": token,
                "user": {
                    "id": "tpo",
                    "email": "TPO@gmail.com",
                    "role": "tpo"
                }
            })
        
        # Regular user login
        user = mongo.db.users.find_one({"email": email})
        print(f"Found user: {user}")  # Debug print
        
        if not user:
            return jsonify({"error": "User not found"}), 401
        
        if not check_password_hash(user["password"], password):
            return jsonify({"error": "Invalid password"}), 401
        
        token = create_access_token(identity=str(user["_id"]))
        
        return jsonify({
            "token": token,
            "user": {
                "id": str(user["_id"]),
                "email": user["email"],
                "role": user.get("role", "student")
            }
        })
        
    except Exception as e:
        print(f"Login error: {str(e)}")  # Debug print
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500

@app.route("/api/analyze-resume", methods=["POST"])
@jwt_required()
def analyze_resume():
    try:
        if "resume" not in request.files:
            return jsonify({"error": "No resume file provided"}), 400
            
        file = request.files["resume"]
        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400
            
        if not file.filename.endswith(".pdf"):
            return jsonify({"error": "Only PDF files are allowed"}), 400

        # Read PDF content
        pdf_reader = PdfReader(io.BytesIO(file.read()))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()

        action = request.form.get("action", "improve")
        
        if action == "improve":
            analysis = analyze_resume_with_llama(text, "analysis")
            return jsonify({"result": analysis})
            
        elif action == "questions":
            questions = analyze_resume_with_llama(text, "questions")
            return jsonify({
                "questions": questions.split("\n"),
                "resume_text": text
            })
            
        elif action == "recommend_jobs":
            # Get all jobs from database
            jobs = list(mongo.db.jobs.find())
            
            # Create TF-IDF vectorizer
            vectorizer = TfidfVectorizer()
            
            # Combine all job texts
            job_texts = [f"{job['name']} {job['position']} {job['description']} {job['requirements']}" for job in jobs]
            job_texts.append(text)
            
            # Calculate TF-IDF matrices
            tfidf_matrix = vectorizer.fit_transform(job_texts)
            
            # Calculate similarity scores
            similarities = cosine_similarity(tfidf_matrix[-1:], tfidf_matrix[:-1])[0]
            
            # Sort jobs by similarity
            job_scores = list(zip(jobs, similarities))
            job_scores.sort(key=lambda x: x[1], reverse=True)
            
            # Return top 5 jobs
            recommended_jobs = [
                {
                    "id": str(job["_id"]),
                    "name": job["name"],
                    "position": job["position"],
                    "description": job["description"],
                    "requirements": job["requirements"],
                    "similarity_score": float(score)
                }
                for job, score in job_scores[:5]
            ]
            
            return jsonify({"recommended_jobs": recommended_jobs})
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/interview-prep", methods=["POST"])
@jwt_required()
def interview_prep():
    try:
        data = request.get_json()
        resume_text = data.get("resume_text")
        question = data.get("question")
        answer = data.get("answer")
        
        if not all([resume_text, question, answer]):
            return jsonify({"error": "Missing required fields"}), 400
            
        feedback = analyze_resume_with_llama(
            {"question": question, "answer": answer},
            "feedback"
        )
        
        return jsonify({"result": feedback})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/companies", methods=["GET", "POST"])
@jwt_required()
def handle_companies():
    try:
        if request.method == "GET":
            companies = list(mongo.db.jobs.find())
            return jsonify([{
                "id": str(company["_id"]),
                "name": company["name"],
                "position": company["position"],
                "description": company["description"],
                "requirements": company["requirements"]
            } for company in companies])
            
        elif request.method == "POST":
            data = request.get_json()
            required_fields = ["name", "position", "description", "requirements"]
            
            if not all(field in data for field in required_fields):
                return jsonify({"error": "Missing required fields"}), 400
                
            result = mongo.db.jobs.insert_one(data)
            return jsonify({"id": str(result.inserted_id)}), 201
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def analyze_resume_with_llama(text, prompt_type="analysis"):
    prompts = {
        "analysis": f"Analyze this resume and provide specific improvements:\n\n{text}",
        "questions": f"Generate 5 relevant interview questions based on this resume:\n\n{text}",
        "feedback": lambda answer: f"Evaluate this interview answer professionally:\n\nQuestion: {answer['question']}\nAnswer: {answer['answer']}"
    }
    
    prompt = prompts[prompt_type] if isinstance(prompts[prompt_type], str) else prompts[prompt_type](text)
    
    response = client.text_generation(
        prompt,
        model="meta-llama/Llama-2-7b-chat-hf",
        max_new_tokens=500,
        temperature=0.7
    )
    return response

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)