import os
from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from bson import ObjectId
from PyPDF2 import PdfReader
from huggingface_hub import InferenceClient
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

load_dotenv()

app = Flask(__name__)

# Configure MongoDB
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

# Initialize extensions
mongo = PyMongo(app)
jwt = JWTManager(app)

# Configure CORS for production
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "https://671745327adbd0655aeb08b7--ai-placement-management-system.netlify.app",
            "http://localhost:5173",
            "http://localhost:4173"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Root route
@app.route("/")
def home():
    return jsonify({
        "message": "AI Placement Management System API",
        "status": "running",
        "endpoints": {
            "auth": ["/api/login", "/api/signup"],
            "resume": ["/api/analyze-resume"],
            "interview": ["/api/interview-prep"],
            "jobs": ["/api/companies"]
        }
    })
# Error handling
@app.errorhandler(Exception)
def handle_error(error):
    return jsonify({
        "error": str(error),
        "message": "An internal error occurred"
    }), 500

# Health check endpoint
@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy"}), 200

# Initialize Hugging Face client
huggingface_token = os.getenv("HUGGINGFACE_TOKEN")
client = InferenceClient(token=huggingface_token)

# Function to extract text from the uploaded PDF resume
def extract_text_from_pdf(pdf_file):
    reader = PdfReader(pdf_file)
    text = ""
    for page in reader.pages:
        text += page.extract_text()
    return text

# Function to generate interview questions based on resume content
def generate_interview_questions(resume_text):
    prompt = f"""Based on the following resume, generate 5 relevant interview questions:

{resume_text}

Generate 5 interview questions that are specific to the candidate's experience, skills, and background. Each question should be on a new line and start with 'Q: '."""

    try:
        response = client.text_generation(
            prompt,
            model="meta-llama/Llama-3.2-3B-Instruct",
            max_new_tokens=500,
            temperature=0.7,
            top_k=50,
            top_p=0.95,
        )
        questions = re.findall(r'Q: (.+)', response)
        return questions
    except Exception as e:
        print(f"Error generating interview questions: {str(e)}")
        return []

# Function to recommend jobs based on resume content
def recommend_jobs(resume_text):
    # Fetch all jobs from the database
    jobs = list(mongo.db.companies.find())
    
    # Prepare the documents for TF-IDF vectorization
    documents = [resume_text] + [f"{job['name']} {job['position']} {job['description']} {job['requirements']}" for job in jobs]
    
    # Create TF-IDF vectorizer
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(documents)
    
    # Calculate cosine similarity between resume and jobs
    cosine_similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
    
    # Sort jobs by similarity score
    job_scores = list(enumerate(cosine_similarities))
    job_scores = sorted(job_scores, key=lambda x: x[1], reverse=True)
    
    # Get top 5 recommended jobs
    recommended_jobs = []
    for idx, score in job_scores[:5]:
        job = jobs[idx]
        recommended_jobs.append({
            'id': str(job['_id']),
            'name': job['name'],
            'position': job['position'],
            'description': job['description'],
            'requirements': job['requirements'],
            'similarity_score': score
        })
    
    return recommended_jobs

@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    role = data.get("role")

    if not email or not password or not role:
        return jsonify({"error": "Missing required fields"}), 400

    if mongo.db.users.find_one({"email": email}):
        return jsonify({"error": "Email already exists"}), 400

    hashed_password = generate_password_hash(password)
    user_id = mongo.db.users.insert_one({
        "email": email,
        "password": hashed_password,
        "role": role
    }).inserted_id

    token = create_access_token(identity=str(user_id))
    return jsonify({"token": token, "user": {"id": str(user_id), "email": email, "role": role}}), 201

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = mongo.db.users.find_one({"email": email})
    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid email or password"}), 401

    token = create_access_token(identity=str(user["_id"]))
    return jsonify({"token": token, "user": {"id": str(user["_id"]), "email": user["email"], "role": user["role"]}}), 200

@app.route("/api/user", methods=["GET"])
@jwt_required()
def get_user():
    user_id = get_jwt_identity()
    user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"id": str(user["_id"]), "email": user["email"], "role": user["role"]}), 200

@app.route("/api/companies", methods=["GET", "POST"])
@jwt_required()
def companies():
    current_user = get_jwt_identity()
    user = mongo.db.users.find_one({"_id": ObjectId(current_user)})
    
    if not user:
        return jsonify({"error": "User not found"}), 404

    if request.method == "GET":
        companies = list(mongo.db.companies.find())
        return jsonify([{**company, "_id": str(company["_id"])} for company in companies])
    
    elif request.method == "POST":
        if user["role"] != "tpo":
            return jsonify({"error": "Unauthorized"}), 403
        data = request.json
        company_id = mongo.db.companies.insert_one(data).inserted_id
        return jsonify({"id": str(company_id)}), 201

@app.route("/api/analyze-resume", methods=["POST"])
@jwt_required()
def analyze_resume():
    if 'resume' not in request.files:
        return jsonify({'error': 'No resume file provided'}), 400

    resume_file = request.files['resume']
    action = request.form.get('action')

    if resume_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if resume_file and allowed_file(resume_file.filename):
        resume_text = extract_text_from_pdf(resume_file)

        if action == 'improve':
            prompt = f"I have the following resume, please suggest me some ideas to improve my skills:\n{resume_text}\nBased on this resume, recommend me 5 improvements.\nJust Output me the improvements Nothing Else"
        elif action == 'questions':
            questions = generate_interview_questions(resume_text)
            return jsonify({'questions': questions, 'resume_text': resume_text})
        elif action == 'recommend_jobs':
            recommended_jobs = recommend_jobs(resume_text)
            return jsonify({'recommended_jobs': recommended_jobs})
        else:
            return jsonify({'error': 'Invalid action'}), 400

        try:
            response = client.text_generation(
                prompt,
                model="meta-llama/Llama-3.2-3B-Instruct",
                max_new_tokens=500,
                temperature=0.7,
                top_k=50,
                top_p=0.95,
            )
            return jsonify({'result': response})
        except Exception as e:
            print(f"Error calling Hugging Face API: {str(e)}")
            return jsonify({'error': 'An error occurred during resume analysis'}), 500
    else:
        return jsonify({'error': 'Invalid file type'}), 400


@app.route("/api/interview-prep", methods=["POST"])
@jwt_required()
def interview_prep():
    data = request.json
    resume_text = data.get('resume_text')
    question = data.get('question')
    answer = data.get('answer')

    if not resume_text or not question or not answer:
        return jsonify({'error': 'Missing required fields'}), 400

    prompt = f"""Based on the following resume:

{resume_text}

For the interview question: "{question}"

The candidate's answer was: "{answer}"

Please provide constructive feedback and suggestions for improvement. Focus on:
1. The relevance of the answer to the question
2. The clarity and structure of the response
3. Any missing key points or experiences from the resume that could have been mentioned
4. Suggestions for better articulation or presentation of ideas

Provide your feedback in a clear, concise manner with specific points for improvement."""

    try:
        response = client.text_generation(
            prompt,
            model="meta-llama/Llama-3.2-3B-Instruct",
            max_new_tokens=500,
            temperature=0.7,
            top_k=50,
            top_p=0.95,
        )
        return jsonify({'result': response})
    except Exception as e:
        print(f"Error calling Hugging Face API: {str(e)}")
        return jsonify({'error': 'An error occurred during interview preparation'}), 500

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in {'pdf'}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)