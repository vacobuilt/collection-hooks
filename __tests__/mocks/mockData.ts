/**
 * Mock data for testing
 * 
 * This file contains sample data for different collection types
 * that can be used in tests.
 */

// Sample case study data
export const mockCaseStudies = [
  {
    id: 'case-study-1',
    title: 'Case Study 1',
    challenge: 'This was a challenging project',
    solution: 'We implemented a custom solution',
    results: 'The client saw a 50% increase in efficiency',
    client: 'ACME Corp',
    industry: 'Technology',
    date: '2023-01-15',
  },
  {
    id: 'case-study-2',
    title: 'Case Study 2',
    challenge: 'The client needed a scalable system',
    solution: 'We built a cloud-based platform',
    results: 'Processing time reduced by 75%',
    client: 'XYZ Inc',
    industry: 'Healthcare',
    date: '2023-03-22',
  },
];

// Sample solution data
export const mockSolutions = [
  {
    id: 'solution-1',
    name: 'Enterprise Solution',
    solutionNarrative: 'A comprehensive enterprise solution',
    primaryChallenges: [
      'Legacy system integration',
      'Data migration',
      'User training'
    ],
    outcomeMetrics: [
      'Reduced operational costs by 30%',
      'Improved data accuracy by 45%',
      'Decreased processing time by 60%'
    ],
    technologies: ['React', 'Node.js', 'MongoDB'],
  },
  {
    id: 'solution-2',
    name: 'Mobile Platform',
    solutionNarrative: 'A cross-platform mobile solution',
    primaryChallenges: [
      'Cross-platform compatibility',
      'Offline functionality',
      'Performance optimization'
    ],
    outcomeMetrics: [
      'Increased user engagement by 40%',
      'Reduced app crashes by 80%',
      'Improved load time by 50%'
    ],
    technologies: ['React Native', 'Firebase', 'Redux'],
  },
];

// Sample service data
export const mockServices = [
  {
    id: 'service-1',
    title: 'Custom Software Development',
    description: 'End-to-end custom software development services',
    benefits: [
      'Tailored to your specific needs',
      'Scalable architecture',
      'Ongoing support and maintenance'
    ],
    process: [
      'Requirements gathering',
      'Design and architecture',
      'Development and testing',
      'Deployment and support'
    ],
  },
  {
    id: 'service-2',
    title: 'Cloud Migration',
    description: 'Seamless migration to cloud platforms',
    benefits: [
      'Reduced infrastructure costs',
      'Improved scalability',
      'Enhanced security'
    ],
    process: [
      'Assessment and planning',
      'Migration strategy',
      'Implementation',
      'Optimization'
    ],
  },
];

// Sample user data
export const mockUsers = [
  {
    id: 'user-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'admin',
    createdAt: '2023-01-01T00:00:00.000Z',
  },
  {
    id: 'user-2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'user',
    createdAt: '2023-02-15T00:00:00.000Z',
  },
];

// Function to get mock data by collection name
export function getMockDataByCollection(collectionName: string): any[] {
  switch (collectionName) {
    case 'case-studies':
      return [...mockCaseStudies];
    case 'solutions':
      return [...mockSolutions];
    case 'services':
      return [...mockServices];
    case 'users':
      return [...mockUsers];
    default:
      return [];
  }
}
