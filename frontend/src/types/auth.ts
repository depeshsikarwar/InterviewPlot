export interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  education?: string | null;
  degree?: string | null;
  graduationYear?: number | null;
  targetRole: string;
  experienceLevel: string;
  programmingLanguages: string[];
  technicalSkills: string[];
  projects?: any;
  internshipExperience?: any;
  preferredInterviewLanguage: string;
  dailyStudyMinutes: number;
  preferredInterviewDuration: number;
  careerGoals?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserSkillItem {
  skillId: string;
  name: string;
  category: string;
  proficiencyScore: number;
  confidenceLevel: number;
  totalAttempts: number;
  lastAssessedAt?: string | null;
}

export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  isVerified: boolean;
  profile?: UserProfile;
  skills?: UserSkillItem[];
  fullName?: string;
  targetRole?: string;
  experienceLevel?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}
