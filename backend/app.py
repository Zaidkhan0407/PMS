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
import time
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

load_dotenv()

app = Flask(__name__)

# MongoDB Configuration with optimized settings
def get_mongo_client():
    try:
        # Configure MongoDB with optimized connection pool
        client = MongoClient(
            os.getenv("MONGO_URI"),
            serverSelectionTimeoutMS=5000,  # Reduce server selection timeout
            connectTimeoutMS=5000,          # Reduce connection timeout
            socketTimeoutMS=5000,           # Reduce socket timeout
            maxPoolSize=50,                 # Optimize connection pool
            minPoolSize=10,                 # Maintain minimum connections
            maxIdleTimeMS=50000,           # Reduce idle connection time
            waitQueueTimeoutMS=5000        # Reduce wait queue timeout
        )
        # Test connection
        client.admin.command('ping')
        print("MongoDB connection successful!")
        return client
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        print(f"Could not connect to MongoDB: {e}")
        raise

try:
    mongo_client = get_mongo_client()
    db = mongo_client.get_database('placement_management_system')
except Exception as e:
    print(f"Fatal MongoDB connection error: {str(e)}")
    raise

# Configure JWT
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
jwt = JWTManager(app)

# Configure CORS with specific origins
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
        db.users.find_one({})
        return jsonify({"message": "Backend is working correctly", "status": "success"}), 200
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}", "status": "error"}), 500

@app.route("/api/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided", "status": "error"}), 400

        email = data.get("email")
        password = data.get("password")
        
        if not email or not password:
            return jsonify({"error": "Email and password are required", "status": "error"}), 400
            
        # Use find_one with projection to optimize query
        existing_user = db.users.find_one({"email": email}, {"_id": 1})
        if existing_user:
            return jsonify({"error": "Email already exists", "status": "error"}), 400
            
        hashed_password = generate_password_hash(password)
        new_user = {
            "email": email,
            "password": hashed_password,
            "role": "student",
            "created_at": time.time()
        }
        
        result = db.users.insert_one(new_user)
        user_id = str(result.inserted_id)
        token = create_access_token(identity=user_id)
        
        return jsonify({
            "token": token,
            "user": {
                "id": user_id,
                "email": email,
                "role": "student"
            },
            "status": "success"
        }), 201
        
    except Exception as e:
        print(f"Signup error: {str(e)}")
        return jsonify({"error": str(e), "status": "error"}), 500

@app.route("/api/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided", "status": "error"}), 400

        email = data.get("email")
        password = data.get("password")
        
        if not email or not password:
            return jsonify({"error": "Email and password are required", "status": "error"}), 400
        
        # TPO login - fast path
        if email == "TPO@gmail.com" and password == "123":
            token = create_access_token(identity="tpo")
            return jsonify({
                "token": token,
                "user": {
                    "id": "tpo",
                    "email": "TPO@gmail.com",
                    "role": "tpo"
                },
                "status": "success"
            })
        
        # Optimize query with projection
        user = db.users.find_one(
            {"email": email},
            {"password": 1, "email": 1, "role": 1}
        )
        
        if not user:
            return jsonify({"error": "User not found", "status": "error"}), 401
        
        if not check_password_hash(user["password"], password):
            return jsonify({"error": "Invalid password", "status": "error"}), 401
        
        token = create_access_token(identity=str(user["_id"]))
        
        return jsonify({
            "token": token,
            "user": {
                "id": str(user["_id"]),
                "email": user["email"],
                "role": user.get("role", "student")
            },
            "status": "success"
        })
        
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({"error": str(e), "status": "error"}), 500

@app.route("/api/analyze-resume", methods=["POST"])
@jwt_required()
def analyze_resume():
    try:
        if "resume" not in request.files:
            return jsonify({"error": "No resume file provided", "status": "error"}), 400
            
        file = request.files["resume"]
        if file.filename == "":
            return jsonify({"error": "No selected file", "status": "error"}), 400
            
        if not file.filename.endswith(".pdf"):
            return jsonify({"error": "Only PDF files are allowed", "status": "error"}), 400

        # Read PDF content
        pdf_reader = PdfReader(io.BytesIO(file.read()))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()

        action = request.form.get("action", "improve")
        
        if action == "improve":
            analysis = analyze_resume_with_llama(text, "analysis")
            return jsonify({"result": analysis, "status": "success"})
            
        elif action == "questions":
            questions = analyze_resume_with_llama(text, "questions")
            return jsonify({
                "questions": questions.split("\n"),
                "resume_text": text,
                "status": "success"
            })
            
        elif action == "recommend_jobs":
            # Get all jobs with projection to optimize query
            jobs = list(db.jobs.find({}, {
                "name": 1,
                "position": 1,
                "description": 1,
                "requirements": 1
            }))
            
            if not jobs:
                return jsonify({"error": "No jobs available", "status": "error"}), 404
            
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
            
            return jsonify({"recommended_jobs": recommended_jobs, "status": "success"})
            
    except Exception as e:
        return jsonify({"error": str(e), "status": "error"}), 500

@app.route("/api/interview-prep", methods=["POST"])
@jwt_required()
def interview_prep():
    try:
        data = request.get_json()
        resume_text = data.get("resume_text")
        question = data.get("question")
        answer = data.get("answer")
        
        if not all([resume_text, question, answer]):
            return jsonify({"error": "Missing required fields", "status": "error"}), 400
            
        feedback = analyze_resume_with_llama(
            {"question": question, "answer": answer},
            "feedback"
        )
        
        return jsonify({"result": feedback, "status": "success"})
    except Exception as e:
        return jsonify({"error": str(e), "status": "error"}), 500

@app.route("/api/companies", methods=["GET", "POST"])
@jwt_required()
def handle_companies():
    try:
        if request.method == "GET":
            # Optimize query with projection
            companies = list(db.jobs.find({}, {
                "name": 1,
                "position": 1,
                "description": 1,
                "requirements": 1
            }))
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
                return jsonify({"error": "Missing required fields", "status": "error"}), 400
                
            result = db.jobs.insert_one(data)
            return jsonify({"id": str(result.inserted_id), "status": "success"}), 201
            
    except Exception as e:
        return jsonify({"error": str(e), "status": "error"}), 500

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