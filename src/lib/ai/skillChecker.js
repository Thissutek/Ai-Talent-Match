/**
 * Mock Skill Checker
 * Simulates AI-based skill assessment without using OpenAI
 */

/**
 * Assess candidate skills based on resume parsing and chat conversation
 * @param {Object} parsedResume - The parsed resume data
 * @param {Array} chatHistory - The AI chat conversation history
 * @returns {Object} Skill assessment and ranking
 */
export async function assessCandidateSkills(parsedResume, chatHistory = []) {
  try {
    console.log("Simulating AI skill assessment...");

    // Simulate processing delay for realistic feel
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Extract skills from parsed resume if available, otherwise use default skills
    const skills = parsedResume.extractedSkills || [
      "JavaScript",
      "React",
      "TypeScript",
      "Node.js",
      "HTML",
      "CSS",
    ];

    // Generate mock skill assessment
    const mockAssessment = {
      verifiedSkills: {},
      skillGaps: [
        "Docker containerization experience",
        "Cloud deployment (AWS/Azure)",
        "Testing frameworks (Jest/Mocha)",
      ],
      overallScore: (Math.random() * 1.5 + 8.5).toFixed(1),
      summary:
        "The candidate demonstrates strong frontend development skills, particularly in React and JavaScript. They have good experience with modern web development practices and some backend exposure. Areas for improvement include containerization technologies, cloud services, and automated testing frameworks.",
    };

    // Generate confidence scores for each skill
    skills.forEach((skill) => {
      // Assign random confidence scores between 0.65 and 0.95
      mockAssessment.verifiedSkills[skill] = (
        Math.random() * 0.18 +
        0.8
      ).toFixed(2);
    });

    return mockAssessment;
  } catch (error) {
    console.error("Error assessing candidate skills:", error);
    throw new Error(`Skill assessment failed: ${error.message}`);
  }
}

/**
 * Generate follow-up questions based on resume to verify skills
 * @param {Object} parsedResume - The parsed resume
 * @returns {Array} List of follow-up questions
 */
export async function generateSkillVerificationQuestions(parsedResume) {
  try {
    console.log("Generating skill verification questions...");

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Extract skills from parsed resume or use defaults
    const skills = parsedResume?.extractedSkills || [
      "JavaScript",
      "React",
      "TypeScript",
      "Node.js",
      "HTML",
      "CSS",
    ];

    // Mock questions that would normally be generated based on the resume
    const mockQuestions = [
      {
        id: 1,
        question:
          "Can you describe a challenging project where you used React, and how you structured the component hierarchy?",
        skillToVerify: "React",
        purpose: "Technical depth assessment",
      },
      {
        id: 2,
        question:
          "How do you typically handle state management in your frontend applications?",
        skillToVerify: "JavaScript",
        purpose: "Architecture knowledge",
      },
      {
        id: 3,
        question:
          "Can you explain how you've implemented responsive designs in your previous work?",
        skillToVerify: "CSS",
        purpose: "Practical application",
      },
      {
        id: 4,
        question:
          "Tell me about a time when you had to optimize a web application for performance. What approaches did you take?",
        skillToVerify: "Performance Optimization",
        purpose: "Problem-solving assessment",
      },
      {
        id: 5,
        question:
          "How do you approach learning new technologies in your field?",
        skillToVerify: "Adaptability",
        purpose: "Learning capacity",
      },
    ];

    return mockQuestions;
  } catch (error) {
    console.error("Error generating verification questions:", error);
    throw new Error(`Question generation failed: ${error.message}`);
  }
}

/**
 * Calculate candidate ranking based on skill assessment
 * @param {Object} assessment - The skill assessment result
 * @returns {number} Ranking score (0-100)
 */
export function calculateCandidateRanking(assessment) {
  // Create a weighted score based on various factors
  const weights = {
    overallScore: 0.6, // 60% weight on overall score
    skillVerification: 0.3, // 30% weight on verified skills
    skillGaps: 0.1, // 10% negative weight on skill gaps
  };

  // Calculate skill verification score (percentage of verified skills)
  const verifiedSkills = assessment.verifiedSkills || {};
  const skillVerificationScore =
    Object.values(verifiedSkills).reduce(
      (sum, confidence) => sum + parseFloat(confidence),
      0,
    ) / (Object.values(verifiedSkills).length || 1);

  // Calculate skill gap penalty (more gaps = lower score)
  const skillGaps = assessment.skillGaps || [];
  const skillGapPenalty = skillGaps.length * 0.1; // Each gap reduces score by 0.5

  // Calculate final weighted score
  let finalScore =
    assessment.overallScore * weights.overallScore +
    skillVerificationScore * weights.skillVerification -
    skillGapPenalty * weights.skillGaps;

  // Normalize to 0-100 scale
  finalScore = Math.min(Math.max(finalScore * 10, 80), 100);

  return parseFloat(finalScore.toFixed(1));
}
