"""
Seed the database with sample courses and exam questions
Run this script after the database is created
"""
from app.db.session import SessionLocal
from app.models.course import Course
from app.models.exam_question import ExamQuestion
from app.models.user import User
from app.core.security import get_password_hash

db = SessionLocal()

# Create admin user
admin = db.query(User).filter(User.email == "admin@aicert.com").first()
if not admin:
    admin = User(
        email="admin@aicert.com",
        password_hash=get_password_hash("admin123"),
        full_name="Admin User",
        is_admin=True
    )
    db.add(admin)
    db.commit()
    print("Created admin user: admin@aicert.com / admin123")

# Course 1: AI Fundamentals
course1 = db.query(Course).filter(Course.slug == "ai-fundamentals").first()
if not course1:
    course1 = Course(
        title="AI Fundamentals Certification",
        slug="ai-fundamentals",
        description="""Master the essential concepts of Artificial Intelligence and Machine Learning.
        This comprehensive certification program covers the foundations of AI, from basic concepts to practical applications.

        Perfect for beginners and professionals looking to validate their AI knowledge.""",
        short_description="Essential AI and ML concepts for beginners",
        price=49.00,
        level="beginner",
        duration="4 weeks",
        pass_percentage=70,
        exam_duration=60,
        syllabus="""
        Module 1: Introduction to AI
        - What is Artificial Intelligence?
        - History and Evolution of AI
        - Types of AI Systems

        Module 2: Machine Learning Basics
        - Supervised vs Unsupervised Learning
        - Common Algorithms
        - Training and Testing

        Module 3: Neural Networks
        - Perceptrons and Layers
        - Activation Functions
        - Deep Learning Introduction

        Module 4: AI Applications
        - Computer Vision
        - Natural Language Processing
        - Recommendation Systems
        """,
        learning_outcomes="""
        - Understand core AI and ML concepts
        - Identify different types of AI systems
        - Explain how neural networks work
        - Recognize real-world AI applications
        """
    )
    db.add(course1)
    db.commit()
    db.refresh(course1)
    print(f"Created course: {course1.title}")

    # Add exam questions for AI Fundamentals
    questions_ai_fundamentals = [
        {
            "question_text": "What is the primary goal of Artificial Intelligence?",
            "options": [
                "To replace all human workers",
                "To create systems that can perform tasks requiring human intelligence",
                "To make computers faster",
                "To eliminate the need for programming"
            ],
            "correct_answer": 1,
            "difficulty": "easy",
            "explanation": "AI aims to create systems that can perform tasks that typically require human intelligence, such as visual perception, speech recognition, and decision-making."
        },
        {
            "question_text": "Which type of machine learning uses labeled training data?",
            "options": [
                "Unsupervised learning",
                "Reinforcement learning",
                "Supervised learning",
                "Transfer learning"
            ],
            "correct_answer": 2,
            "difficulty": "easy",
            "explanation": "Supervised learning uses labeled training data where each example has an input and corresponding output."
        },
        {
            "question_text": "What is a neural network?",
            "options": [
                "A biological network in the human brain",
                "A computer network topology",
                "A computing system inspired by biological neural networks",
                "A social network for AI researchers"
            ],
            "correct_answer": 2,
            "difficulty": "medium",
            "explanation": "Neural networks are computing systems inspired by the biological neural networks in animal brains."
        },
        {
            "question_text": "Which of the following is NOT a common AI application?",
            "options": [
                "Image recognition",
                "Speech recognition",
                "Weather prediction",
                "Time travel"
            ],
            "correct_answer": 3,
            "difficulty": "easy",
            "explanation": "AI is used for image recognition, speech recognition, and weather prediction, but not time travel."
        },
        {
            "question_text": "What is the difference between AI and Machine Learning?",
            "options": [
                "They are the same thing",
                "ML is a subset of AI focused on learning from data",
                "AI is a subset of ML",
                "ML came before AI"
            ],
            "correct_answer": 1,
            "difficulty": "medium",
            "explanation": "Machine Learning is a subset of AI that focuses on systems that can learn and improve from experience without being explicitly programmed."
        },
        {
            "question_text": "What is an activation function in neural networks?",
            "options": [
                "A function that activates the computer",
                "A function that determines if a neuron should fire",
                "A function that deletes unnecessary neurons",
                "A function that creates new neurons"
            ],
            "correct_answer": 1,
            "difficulty": "medium",
            "explanation": "An activation function determines whether a neuron should be activated (fire) based on the weighted sum of its inputs."
        },
        {
            "question_text": "What is the purpose of training data in machine learning?",
            "options": [
                "To test the final model",
                "To teach the model patterns and relationships",
                "To slow down the computer",
                "To create documentation"
            ],
            "correct_answer": 1,
            "difficulty": "easy",
            "explanation": "Training data is used to teach the model patterns and relationships so it can make predictions on new data."
        },
        {
            "question_text": "Which AI technique is used for image recognition?",
            "options": [
                "Linear regression",
                "Convolutional Neural Networks (CNN)",
                "Decision trees only",
                "Simple if-else statements"
            ],
            "correct_answer": 1,
            "difficulty": "medium",
            "explanation": "Convolutional Neural Networks (CNNs) are specifically designed for processing grid-like data such as images."
        },
        {
            "question_text": "What is overfitting in machine learning?",
            "options": [
                "When a model is too large to fit in memory",
                "When a model performs well on training data but poorly on new data",
                "When a model trains too quickly",
                "When a model uses too few parameters"
            ],
            "correct_answer": 1,
            "difficulty": "medium",
            "explanation": "Overfitting occurs when a model learns the training data too well, including noise, and performs poorly on new, unseen data."
        },
        {
            "question_text": "What is Natural Language Processing (NLP)?",
            "options": [
                "Processing natural resources",
                "A branch of AI focused on human language understanding",
                "A programming language",
                "A type of neural network"
            ],
            "correct_answer": 1,
            "difficulty": "easy",
            "explanation": "NLP is a branch of AI that focuses on enabling computers to understand, interpret, and generate human language."
        }
    ]

    for q_data in questions_ai_fundamentals:
        question = ExamQuestion(
            course_id=course1.id,
            **q_data
        )
        db.add(question)

    db.commit()
    print(f"Added {len(questions_ai_fundamentals)} questions for AI Fundamentals")

# Course 2: Prompt Engineering Professional
course2 = db.query(Course).filter(Course.slug == "prompt-engineering-professional").first()
if not course2:
    course2 = Course(
        title="Prompt Engineering Professional",
        slug="prompt-engineering-professional",
        description="""Become a certified Prompt Engineering expert. Learn advanced techniques for crafting effective
        prompts for ChatGPT, Claude, and other large language models.

        Master the art and science of prompt design to get the best results from AI systems.""",
        short_description="Advanced prompt engineering for AI systems",
        price=99.00,
        level="intermediate",
        duration="3 weeks",
        pass_percentage=75,
        exam_duration=75,
        syllabus="""
        Module 1: Prompt Engineering Fundamentals
        - Understanding LLMs
        - Basic Prompt Structure
        - Zero-shot vs Few-shot Learning

        Module 2: Advanced Techniques
        - Chain of Thought Prompting
        - Role-based Prompting
        - Prompt Chaining

        Module 3: ChatGPT & Claude Best Practices
        - Platform-specific Techniques
        - Context Management
        - Error Handling

        Module 4: Real-world Applications
        - Content Creation
        - Code Generation
        - Data Analysis
        - Business Applications
        """,
        learning_outcomes="""
        - Master prompt engineering techniques
        - Create effective prompts for various tasks
        - Optimize AI model responses
        - Apply prompting in professional settings
        """
    )
    db.add(course2)
    db.commit()
    db.refresh(course2)
    print(f"Created course: {course2.title}")

    # Add exam questions for Prompt Engineering
    questions_prompt_eng = [
        {
            "question_text": "What is zero-shot prompting?",
            "options": [
                "Prompting without any examples",
                "Prompting with zero words",
                "Prompting with zero results",
                "Prompting without thinking"
            ],
            "correct_answer": 0,
            "difficulty": "easy",
            "explanation": "Zero-shot prompting is when you ask the model to perform a task without providing any examples."
        },
        {
            "question_text": "What is the purpose of few-shot learning in prompts?",
            "options": [
                "To reduce token usage",
                "To provide examples that guide the model's response",
                "To make prompts shorter",
                "To confuse the model"
            ],
            "correct_answer": 1,
            "difficulty": "medium",
            "explanation": "Few-shot learning provides examples in the prompt to help the model understand the desired output format and style."
        },
        {
            "question_text": "What is Chain of Thought (CoT) prompting?",
            "options": [
                "Asking multiple unrelated questions",
                "Encouraging the model to show reasoning steps",
                "Creating a chain of prompts",
                "Limiting the model's thinking"
            ],
            "correct_answer": 1,
            "difficulty": "medium",
            "explanation": "Chain of Thought prompting encourages the model to break down complex problems and show its reasoning process."
        },
        {
            "question_text": "Which technique helps maintain context in long conversations?",
            "options": [
                "Deleting previous messages",
                "Summarizing and referencing previous context",
                "Starting over each time",
                "Using shorter prompts"
            ],
            "correct_answer": 1,
            "difficulty": "medium",
            "explanation": "Summarizing and referencing previous context helps maintain coherence in long conversations without exceeding token limits."
        },
        {
            "question_text": "What is role-based prompting?",
            "options": [
                "Prompting during role-playing games",
                "Assigning a specific role or persona to the AI",
                "Prompting multiple people",
                "Creating roles in a database"
            ],
            "correct_answer": 1,
            "difficulty": "easy",
            "explanation": "Role-based prompting assigns a specific role or persona to the AI (e.g., 'You are an expert programmer') to shape its responses."
        },
        {
            "question_text": "What is the main benefit of prompt chaining?",
            "options": [
                "Faster responses",
                "Breaking complex tasks into manageable steps",
                "Using less memory",
                "Avoiding API costs"
            ],
            "correct_answer": 1,
            "difficulty": "medium",
            "explanation": "Prompt chaining breaks complex tasks into a series of simpler prompts, where each output feeds into the next prompt."
        },
        {
            "question_text": "How can you improve specificity in prompts?",
            "options": [
                "Use vague language",
                "Provide clear constraints, format, and examples",
                "Make prompts as short as possible",
                "Avoid any details"
            ],
            "correct_answer": 1,
            "difficulty": "easy",
            "explanation": "Providing clear constraints, desired format, and examples makes prompts more specific and improves output quality."
        },
        {
            "question_text": "What is temperature in LLM settings?",
            "options": [
                "The physical temperature of the server",
                "A parameter controlling randomness in outputs",
                "The speed of generation",
                "The cost per token"
            ],
            "correct_answer": 1,
            "difficulty": "medium",
            "explanation": "Temperature controls the randomness of the model's outputs. Lower temperature = more focused/deterministic, higher = more creative/random."
        },
        {
            "question_text": "What is the purpose of system messages in ChatGPT?",
            "options": [
                "To debug errors",
                "To set the behavior and context for the entire conversation",
                "To send messages to system administrators",
                "To clear the conversation"
            ],
            "correct_answer": 1,
            "difficulty": "medium",
            "explanation": "System messages set the overall behavior, tone, and constraints for the AI assistant throughout the conversation."
        },
        {
            "question_text": "What is prompt injection?",
            "options": [
                "A medical procedure",
                "A security vulnerability where malicious input manipulates AI behavior",
                "Adding more prompts to a conversation",
                "A way to speed up responses"
            ],
            "correct_answer": 1,
            "difficulty": "medium",
            "explanation": "Prompt injection is a security vulnerability where carefully crafted input can manipulate the AI to behave in unintended ways."
        }
    ]

    for q_data in questions_prompt_eng:
        question = ExamQuestion(
            course_id=course2.id,
            **q_data
        )
        db.add(question)

    db.commit()
    print(f"Added {len(questions_prompt_eng)} questions for Prompt Engineering")

# Course 3: AI for Business Leaders
course3 = db.query(Course).filter(Course.slug == "ai-for-business-leaders").first()
if not course3:
    course3 = Course(
        title="AI for Business Leaders",
        slug="ai-for-business-leaders",
        description="""Strategic AI certification for executives and business leaders. Learn how to implement AI
        in your organization, measure ROI, and lead AI transformation initiatives.

        Designed for C-level executives, managers, and business strategists.""",
        short_description="Strategic AI implementation for executives",
        price=149.00,
        level="advanced",
        duration="6 weeks",
        pass_percentage=75,
        exam_duration=90,
        syllabus="""
        Module 1: AI Strategy
        - AI Readiness Assessment
        - Building an AI Roadmap
        - Technology Selection

        Module 2: Implementation
        - Team Building
        - Data Infrastructure
        - Pilot Projects

        Module 3: ROI and Metrics
        - Measuring AI Success
        - KPIs for AI Projects
        - Cost-Benefit Analysis

        Module 4: Leadership and Change Management
        - Managing AI Transformation
        - Ethics and Governance
        - Future Trends
        """,
        learning_outcomes="""
        - Develop AI strategy for organizations
        - Lead AI implementation projects
        - Measure and optimize AI ROI
        - Navigate AI ethics and governance
        """
    )
    db.add(course3)
    db.commit()
    db.refresh(course3)
    print(f"Created course: {course3.title}")

    # Add exam questions for AI for Business Leaders
    questions_business = [
        {
            "question_text": "What is the first step in developing an AI strategy?",
            "options": [
                "Buying the most expensive AI software",
                "Assessing organizational readiness and identifying use cases",
                "Hiring a large AI team",
                "Copying competitor strategies"
            ],
            "correct_answer": 1,
            "difficulty": "medium",
            "explanation": "Assessing organizational readiness and identifying relevant use cases is crucial before implementing AI."
        },
        {
            "question_text": "What is AI ROI?",
            "options": [
                "Return on Investment for AI initiatives",
                "Robot Operating Instructions",
                "AI Revenue Only Indicator",
                "Artificial Intelligence Research Organization"
            ],
            "correct_answer": 0,
            "difficulty": "easy",
            "explanation": "AI ROI measures the return on investment from AI initiatives, comparing benefits to costs."
        },
        {
            "question_text": "Why are pilot projects important in AI implementation?",
            "options": [
                "They're required by law",
                "They allow testing and learning before full-scale deployment",
                "They're cheaper than planning",
                "They impress investors"
            ],
            "correct_answer": 1,
            "difficulty": "medium",
            "explanation": "Pilot projects allow organizations to test AI solutions, learn, and refine before committing to full-scale deployment."
        },
        {
            "question_text": "What is a key consideration for AI ethics in business?",
            "options": [
                "Maximizing profit only",
                "Fairness, transparency, and accountability",
                "Speed of implementation",
                "Technology complexity"
            ],
            "correct_answer": 1,
            "difficulty": "medium",
            "explanation": "Ethical AI requires consideration of fairness, transparency, accountability, and potential societal impacts."
        },
        {
            "question_text": "What type of data infrastructure is needed for AI?",
            "options": [
                "No data needed",
                "Only spreadsheets",
                "High-quality, accessible, and well-organized data",
                "Any random data"
            ],
            "correct_answer": 2,
            "difficulty": "easy",
            "explanation": "AI requires high-quality, accessible, and well-organized data to function effectively."
        },
        {
            "question_text": "What is change management in AI transformation?",
            "options": [
                "Changing the AI software frequently",
                "Managing organizational and cultural changes during AI adoption",
                "Exchanging currency",
                "Modifying business hours"
            ],
            "correct_answer": 1,
            "difficulty": "medium",
            "explanation": "Change management involves guiding the organization and its people through the transition to AI-enabled processes."
        },
        {
            "question_text": "What KPI is most relevant for measuring AI success in customer service?",
            "options": [
                "Number of servers",
                "Response time and customer satisfaction scores",
                "Office square footage",
                "Number of meetings"
            ],
            "correct_answer": 1,
            "difficulty": "easy",
            "explanation": "For customer service AI, key metrics include response time, resolution rate, and customer satisfaction."
        },
        {
            "question_text": "What is AI governance?",
            "options": [
                "Government regulation only",
                "Frameworks and policies for responsible AI development and use",
                "AI controlling humans",
                "Software version control"
            ],
            "correct_answer": 1,
            "difficulty": "medium",
            "explanation": "AI governance includes policies, processes, and controls to ensure responsible and ethical AI use."
        },
        {
            "question_text": "What skill is most important for AI team members?",
            "options": [
                "Basketball skills",
                "Data literacy and domain expertise",
                "Social media following",
                "Gaming experience"
            ],
            "correct_answer": 1,
            "difficulty": "easy",
            "explanation": "Successful AI teams need both technical data skills and domain expertise to solve real business problems."
        },
        {
            "question_text": "What is the main risk of AI implementation without strategy?",
            "options": [
                "Too much success",
                "Wasted resources and failed projects",
                "Faster growth",
                "Better employee morale"
            ],
            "correct_answer": 1,
            "difficulty": "easy",
            "explanation": "Without proper strategy, AI projects often fail to deliver value, wasting time and resources."
        }
    ]

    for q_data in questions_business:
        question = ExamQuestion(
            course_id=course3.id,
            **q_data
        )
        db.add(question)

    db.commit()
    print(f"Added {len(questions_business)} questions for AI for Business Leaders")

print("\n✅ Database seeded successfully!")
print("\nAvailable courses:")
for course in db.query(Course).all():
    print(f"  - {course.title} (${course.price})")

db.close()
