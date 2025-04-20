/**
 * Mock Resume Parser
 * Simulates AI parsing of resumes without using OpenAI
 */

/**
 * Parse resume text to extract structured information
 * @param {string} resumeText - The text content of the resume
 * @returns {Object} Structured resume data
 */
export async function parseResume(resumeText) {
  try {
    console.log('Simulating AI resume parsing...');
    
    // For MVP purposes, generate simulated parsing results
    // In a real implementation, this would use OpenAI to analyze the resumeText
    
    // Simulate processing delay for realistic feel
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate mock parsed data
    const mockParsedData = {
      contactInfo: {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "555-123-4567"
      },
      skills: [
        "JavaScript", "React", "Node.js", "TypeScript", "HTML", "CSS", 
        "Git", "RESTful APIs", "MongoDB", "SQL", "Agile"
      ],
      workExperience: [
        {
          company: "Tech Solutions Inc.",
          position: "Senior Frontend Developer",
          duration: "2020 - Present",
          responsibilities: [
            "Developed responsive web applications using React and TypeScript",
            "Collaborated with UX designers to implement user-friendly interfaces",
            "Improved application performance by 40%"
          ]
        },
        {
          company: "Digital Innovations LLC",
          position: "Web Developer",
          duration: "2017 - 2020",
          responsibilities: [
            "Built and maintained multiple client websites",
            "Implemented RESTful APIs for data integration",
            "Mentored junior developers"
          ]
        }
      ],
      education: [
        {
          institution: "University of Technology",
          degree: "Bachelor of Science in Computer Science",
          graduationYear: "2017"
        }
      ]
    };
    
    // Extract skills as a flat array for easier processing
    const flatSkills = mockParsedData.skills;
    
    return {
      parsedResume: mockParsedData,
      extractedSkills: flatSkills
    };
  } catch (error) {
    console.error("Error parsing resume:", error);
    throw new Error(`Resume parsing failed: ${error.message}`);
  }
}

/**
 * Extract PDF text using a PDF parsing library
 * For MVP, this is simplified with mock functionality
 * @param {Buffer} fileBuffer - The PDF file buffer
 * @returns {string} Extracted text
 */
export async function extractTextFromPDF(fileBuffer) {
  try {
    console.log('Simulating PDF text extraction...');
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock extracted text
    return "Mock extracted text from a resume PDF file. This text would normally be parsed from the actual PDF content.";
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error(`PDF text extraction failed: ${error.message}`);
  }
}