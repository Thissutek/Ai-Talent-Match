# NeuroMatch AI-powered Talent Matching MVP 

## Overview

This project is an MVP (Minimum Viable Product) for an AI-powered talent matching platform that connects job seekers with recruiters. The platform uses simulated AI to parse resumes, conduct skill assessment chats, and generate candidate rankings, providing a comprehensive solution for both candidates and recruiters.


## Key Features

### For Candidates
- Resume upload and automated parsing
- AI-powered skill assessment through interactive chat
- Comprehensive profile management
- Skills verification and confidence scoring

### For Recruiters
- Browse candidates with AI-generated rankings
- Detailed candidate profiles with verified skills
- Review and feedback system
- Filtering and searching capabilities

## Technology Stack

- **Frontend**: Next.js 14 with React
- **Backend**: Supabase for authentication, database, and storage
- **Styling**: Tailwind CSS
- **Icons**: React Icons
- **Simulated AI**: Custom JavaScript modules (with future OpenAI integration capability)

## AI Implementation

This project showcases innovative uses of simulated AI to create a realistic user experience while remaining cost-effective during the MVP phase:

### 1. Resume Parsing with Simulated AI

The `resumeParser.js` module simulates AI-powered resume parsing, generating structured data from uploaded PDF files:

```javascript
// Example from src/lib/ai/resumeParser.js
export async function parseResume(resumeText) {
  // Simulate AI processing delay for realistic feel
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate structured data including contact info, skills, experience, and education
  const mockParsedData = {
    contactInfo: { /* ... */ },
    skills: ["JavaScript", "React", /* ... */],
    workExperience: [/* ... */],
    education: [/* ... */]
  };
  
  return {
    parsedResume: mockParsedData,
    extractedSkills: mockParsedData.skills
  };
}
```

This approach:
- Mimics the behavior of real AI resume parsing
- Provides consistent, structured data
- Includes realistic processing delays
- Can be easily replaced with real OpenAI integration in the future

### 2. Interactive Skill Assessment Chat

The platform features an interactive chat system that simulates an AI interviewer assessing candidate skills:

```javascript
// From SkillsChat.js component
const generateMockFollowUp = (userMessage, currentQuestion) => {
  // Dynamic follow-up responses based on the skill being assessed
  const followUps = {
    "React": "That's interesting! Could you elaborate on how you handle component state in your React applications?",
    "JavaScript": "Thanks for sharing. Have you worked with any JavaScript frameworks besides React?",
    // More skill-specific follow-ups...
  };
  
  const skill = currentQuestion?.skillToVerify || "";
  return followUps[skill] || "Could you tell me more about how you applied this in a real project?";
};
```

Key AI chat features:
- Context-aware responses based on candidate skills
- Progressive conversation flow with follow-up questions
- Typing indicators and natural response delays
- Skill verification questions tailored to resume content

### 3. Candidate Ranking Algorithm

The platform uses a sophisticated algorithm to rank candidates based on their skills and assessment:

```javascript
// From src/lib/ai/skillChecker.js
export function calculateCandidateRanking(assessment) {
  // Create a weighted score based on various factors
  const weights = {
    overallScore: 0.6,  // 60% weight on overall score
    skillVerification: 0.3,  // 30% weight on verified skills
    skillGaps: 0.1  // 10% negative weight on skill gaps
  };
  
  // Calculate components and apply weights
  const skillVerificationScore = /* calculation */
  const skillGapPenalty = /* calculation */
  
  // Calculate final score
  let finalScore = 
    (assessment.overallScore * weights.overallScore) +
    (skillVerificationScore * weights.skillVerification) -
    (skillGapPenalty * weights.skillGaps);
  
  // Normalize to 0-100 scale
  return parseFloat((Math.min(Math.max(finalScore * 10, 0), 100)).toFixed(1));
}
```

This produces realistic rankings that:
- Incorporate multiple assessment factors
- Weight different aspects of candidate evaluation
- Generate confidence scores for each verified skill
- Identify skill gaps and areas for improvement

## Project Structure

```
talent-matching-mvp/
├── public/
│   └── assets/
├── src/
│   ├── app/
│   │   ├── candidate/
│   │   │   ├── dashboard/page.js    # Candidate main dashboard
│   │   │   ├── profile/page.js      # Profile management
│   │   │   ├── resume/page.js       # Resume upload & management
│   │   │   ├── chat/page.js         # Skills assessment chat
│   │   │   └── layout.js            # Layout with sidebar navigation
│   │   ├── recruiter/
│   │   │   ├── dashboard/page.js    # Recruiter main dashboard
│   │   │   ├── candidates/page.js   # Browse all candidates
│   │   │   ├── my-reviews/page.js   # View submitted reviews
│   │   │   ├── settings/page.js     # Account settings
│   │   │   └── layout.js            # Layout with sidebar navigation
│   │   ├── login/page.js            # Login page
│   │   ├── signup/page.js           # Signup page
│   │   ├── layout.js                # Root layout
│   │   ├── not-found.js             # 404 page
│   │   └── error.js                 # Error boundary
│   ├── components/
│   │   ├── candidate/
│   │   │   ├── ResumeUploader.js    # Resume upload component
│   │   │   ├── SkillsChat.js        # AI chat component
│   │   │   └── ProfileView.js       # Profile display
│   │   └── recruiter/
│   │       ├── CandidateList.js     # Candidate browsing
│   │       ├── CandidateDetails.js  # Detailed candidate view
│   │       └── FeedbackForm.js      # Review submission
│   ├── lib/
│   │   ├── supabase/
│   │   │   └── client.js            # Supabase client & helpers
│   │   ├── ai/                      # Simulated AI modules
│   │   │   ├── resumeParser.js      # Resume parsing simulation
│   │   │   ├── skillChecker.js      # Skill assessment & ranking
│   │   │   └── chatAssistant.js     # Chat logic
│   │   └── utils.js                 # Utility functions
│   └── styles/
│       └── globals.css              # Global styles
├── .env.local                       # Environment variables
├── tailwind.config.js               # Tailwind configuration
├── next.config.js                   # Next.js configuration
└── package.json                     # Dependencies
```

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/talent-matching-mvp.git
   cd talent-matching-mvp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with the following:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the database setup SQL scripts (provided in `/database/schema.sql`)
   - Create a storage bucket named 'resumes'

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Future Enhancements

- Real AI integration with OpenAI's GPT models
- Advanced matching algorithms based on job requirements
- Video interview capabilities
- Integration with job boards and ATS systems
- Mobile application
- Analytics dashboard for platform insights

## License

[MIT License](LICENSE)

## Acknowledgments

- This project was developed as an MVP to demonstrate the potential of AI in talent acquisition
- Special thanks to the Supabase and Next.js teams for their excellent documentation and tools
