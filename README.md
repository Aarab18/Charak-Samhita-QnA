# 🌿 Charak Samhita Q&A – AI-Powered Ayurvedic Wisdom

A modern, interactive web application that bridges the ancient knowledge of the **Charak Samhita** with today's technology. Ask questions in natural language and receive detailed, **cited answers** from an AI trained on classical Ayurvedic texts.

---

## ✨ Key Features

- 🔍 **AI-Powered Q&A**  
  Get detailed, context-aware answers about Ayurvedic concepts, principles, and treatments from the Charak Samhita.

- 📖 **Cited Sources**  
  Each answer is backed by specific **chapter and verse references**, providing authenticity and paths for deeper study.

- 🕑 **Persistent Question History**  
  Your questions are saved anonymously and persist across sessions on the same device via Firebase.

- 🎨 **Thematic & Interactive UI**
  - Dark mode with parchment-like textures
  - "Wisdom of the Day" verse greeting
  - Suggested topics for guided exploration
  - Elegant glowing focus effects and smooth animations

- 🔐 **User Authentication**  
  Firebase Anonymous Authentication enables secure, profile-based history without requiring sign-up.

---

## 🧰 Tech Stack

### 🖥 Frontend

- [React](https://reactjs.org/) – UI Library  
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first styling  
- [Lucide React](https://lucide.dev/) – Icon library  

### 🔧 Backend & Services

- [Firebase](https://firebase.google.com/)  
  - Authentication (Anonymous)  
  - Firestore (NoSQL user history storage)

- [Google Gemini API](https://makersuite.google.com/app)  
  - Powers question-answering intelligence

### 🚀 Deployment

- Fully compatible with [Vercel](https://vercel.com/) or [Netlify](https://netlify.com/) for easy deployment

---

## 🛠 Local Setup & Installation

Follow the steps below to run the project locally:

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/charak-samhita-qa.git
cd charak-samhita-qa
````
2. Install Dependencies
````bash
npm install
````
3. Set Up Environment Variables
4. 
Create a .env file in the root directory and add your API keys:

env
````bash
REACT_APP_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
REACT_APP_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
REACT_APP_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
REACT_APP_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
REACT_APP_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
REACT_APP_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID"
REACT_APP_GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
````
🔒 Never commit your .env file. Ensure it's listed in .gitignore.

4. Start the Development Server
````
npm start
````
App will run at: http://localhost:3000


🧠 Future Enhancements
1. Multilingual support for Sanskrit/Hindi queries
2. Personalized suggestions based on usage
3. Offline-first mode with caching
4. Admin dashboard to manage verses/Q&A base

📜 License

-This project is open-source and available under the MIT License.

🙏 Acknowledgements

-Ancient wisdom from the Charak Samhita

-Google Gemini API

-Firebase
