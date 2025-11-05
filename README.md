# NeuroLearn - Neurodivergent Digital Coaching Platform

## 🧠 Overview

NeuroLearn is an AI-enhanced digital coaching and educational platform specifically designed for neurodivergent learners (ADHD, Autism Spectrum, Dyslexia, and more). The platform provides personalized learning paths, gamification, progress tracking, and AI-powered coaching to help neurodivergent individuals thrive in their educational journey.

## ✨ Key Features

### 🎯 Personalized Learning
- **Neurodivergent-Specific Content**: Customized learning modules for ADHD, Autism, Dyslexia, Dyscalculia, Dysgraphia, and mixed profiles
- **Adaptive Learning Paths**: Content that adapts to individual learning styles and needs
- **Multiple Difficulty Levels**: Beginner, Intermediate, and Advanced content

### 🤖 AI-Powered Coaching
- **Real-time Feedback**: AI coach provides personalized encouragement and strategies
- **Context-Aware Support**: Coaching tailored to specific neurodivergent profiles
- **Progress Milestones**: Automated coaching at key learning milestones

### 🎮 Gamification System
- **Points & Levels**: Earn points and level up as you learn
- **Achievements & Badges**: Unlock achievements for completing modules and maintaining streaks
- **Streak Tracking**: Build daily learning habits with streak counters
- **Visual Progress**: Beautiful progress bars and charts

### 📊 Progress Tracking
- **Detailed Analytics**: Track time spent, modules completed, and points earned
- **Visual Dashboards**: Interactive charts showing learning trends
- **Module Progress**: Track progress on individual learning modules
- **Parent Dashboard**: Parents can monitor their child's progress (coming soon)

### 🎨 User Experience
- **Responsive Design**: Works beautifully on desktop, tablet, and mobile
- **Accessible Interface**: Designed with neurodivergent needs in mind
- **Engaging Animations**: Smooth transitions and celebratory effects
- **Clean, Distraction-Free**: Minimalist design to reduce cognitive overload

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite (via Prisma ORM)
- **Authentication**: NextAuth.js
- **UI Components**: Lucide Icons, Framer Motion, Recharts
- **AI Integration**: Template-based coaching (OpenAI integration ready)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Codex
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

   The default `.env.local` is already configured for local development.

4. **Initialize the database**
   ```bash
   npx prisma db push
   ```

5. **Seed the database with demo data**
   ```bash
   npm run db:seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Demo Accounts

After seeding the database, you can log in with these demo accounts:

**Student Accounts:**
- **ADHD Profile**:
  - Email: `alex@example.com`
  - Password: `demo123`

- **Autism Profile**:
  - Email: `jamie@example.com`
  - Password: `demo123`

**Parent Account:**
- Email: `parent@example.com`
- Password: `demo123`

## 📁 Project Structure

```
Codex/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── auth/            # Authentication endpoints
│   │   ├── coaching/        # AI coaching endpoints
│   │   ├── progress/        # Progress tracking endpoints
│   │   └── learning-session/ # Session management
│   ├── auth/                # Authentication pages
│   │   ├── signin/
│   │   └── register/
│   ├── dashboard/           # Main dashboard
│   ├── learn/               # Learning modules
│   │   └── [id]/           # Individual module pages
│   ├── progress/            # Progress tracking page
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── DashboardClient.tsx
│   ├── LearnClient.tsx
│   ├── ModuleLearningClient.tsx
│   └── ProgressClient.tsx
├── lib/                     # Utility libraries
│   ├── prisma.ts           # Prisma client
│   ├── auth.ts             # Auth configuration
│   ├── utils.ts            # Helper functions
│   └── ai-coach.ts         # AI coaching logic
├── prisma/                  # Database
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed data
├── types/                   # TypeScript types
└── public/                  # Static assets
```

## 🎓 Learning Modules

The platform includes pre-built learning modules for different neurodivergent profiles:

### ADHD Modules
- Focus Foundations
- Organization Station
- Time Management Magic

### Autism Spectrum Modules
- Communication Confidence
- Sensory Success

### Dyslexia Modules
- Reading Strategies Toolkit

Each module includes:
- Interactive content sections
- Engaging activities
- Progress tracking
- Points rewards
- AI coaching integration

## 🔧 Development

### Database Management

**View database in Prisma Studio:**
```bash
npm run db:studio
```

**Reset database:**
```bash
rm prisma/dev.db
npx prisma db push
npm run db:seed
```

**Update schema:**
1. Edit `prisma/schema.prisma`
2. Run `npx prisma db push`
3. Regenerate Prisma Client: `npx prisma generate`

### Adding New Modules

1. Add module data in `prisma/seed.ts`
2. Run `npm run db:seed` to update the database
3. Modules will automatically appear in the learning interface

### Customizing AI Coaching

The AI coaching system is located in `lib/ai-coach.ts`. You can:
- Add new coaching templates
- Integrate with OpenAI API (set `OPENAI_API_KEY` in `.env.local`)
- Customize coaching logic based on user behavior

## 🌟 Key Features Explained

### Gamification System

**Points System:**
- Each module awards points upon completion
- Points accumulate to increase user level
- Every 100 points = 1 level

**Streaks:**
- Daily learning builds consecutive day streaks
- Streak achievements unlock at 3, 7, and 30 days
- Visual streak indicators with emojis

**Achievements:**
- First module completion
- Streak milestones
- Level-up achievements
- Custom achievements can be added

### Progress Tracking

**Individual Progress:**
- Track completion percentage per module
- Monitor time spent learning
- View scores and attempt counts

**Analytics Dashboard:**
- 7-day learning time chart
- Points earned over time
- Module completion statistics
- Achievement showcase

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy!

For production, consider:
- Upgrading to PostgreSQL or MySQL
- Setting up proper authentication secrets
- Configuring OpenAI API for real AI coaching
- Setting up analytics

## 🎯 Market Opportunity

### Target Market
- 15-20% of the population is neurodivergent
- Parents seeking personalized learning solutions
- Schools looking for specialized ed-tech tools
- Adult neurodivergent learners

### Competitive Advantages
- Specifically designed for neurodivergent learners
- AI-powered personalization
- Comprehensive gamification
- Progress tracking for parents and educators
- Scalable content creation

### Monetization Strategies
- Freemium model (basic modules free, premium content paid)
- School/district licenses
- Parent subscriptions
- B2B partnerships with educational institutions
- Content marketplace for specialized modules

## 🛠️ Future Enhancements

- [ ] OpenAI GPT integration for dynamic coaching
- [ ] Parent dashboard with detailed child monitoring
- [ ] Teacher/educator accounts and classroom management
- [ ] Real-time progress notifications
- [ ] Social features (safe, moderated peer interaction)
- [ ] Mobile apps (iOS/Android)
- [ ] Video content and interactive multimedia
- [ ] Voice-to-text and text-to-speech integration
- [ ] Custom learning path creation
- [ ] Third-party curriculum integration
- [ ] Advanced analytics and reporting
- [ ] Multi-language support

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ for neurodivergent learners**
