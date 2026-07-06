export enum VideoStatus {
  DRAFT = "DRAFT",
  RESEARCHING = "RESEARCHING",
  WRITING_SCRIPT = "WRITING_SCRIPT",
  REVIEWING_SCRIPT = "REVIEWING_SCRIPT",
  SCENE_PLANNING = "SCENE_PLANNING",
  PROMPT_ENGINEERING = "PROMPT_ENGINEERING",
  GENERATING_MEDIA = "GENERATING_MEDIA",
  ASSEMBLING_VIDEO = "ASSEMBLING_VIDEO",
  QA_TESTING = "QA_TESTING",
  AWAITING_APPROVAL = "AWAITING_APPROVAL",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  PUBLISHING = "PUBLISHING",
  PUBLISHED = "PUBLISHED"
}

export interface WebCitation {
  title: string;
  uri: string;
  source: string;
}

export interface ResearchReport {
  topic: string;
  summary: string;
  confidenceScore: number;
  facts: string[];
  benchmarks: string[];
  expertOpinions: string[];
  citations: WebCitation[];
}

export interface ScriptModel {
  title: string;
  hook: string;
  problem: string;
  context: string;
  mainContent: string;
  examples: string[];
  insights: string[];
  conclusion: string;
  cta: string;
  estimatedWatchTimeScore: number; // 0 - 100
  estimatedRetentionScore: number; // 0 - 100
  fullNarration: string;
}

export interface ScriptReview {
  score: number; // 0 - 100
  approved: boolean;
  clarity: number;
  engagement: number;
  accuracy: number;
  novelty: number;
  feedback: string;
}

export interface StoryboardScene {
  id: string;
  sceneNumber: number;
  duration: number; // in seconds
  visualDescription: string;
  cameraMotion: string;
  scenePrompt: string;
  transitionType: string;
  narrationText: string;
  imageUrl?: string; // Generated Base64 or mock URL
  voiceUrl?: string; // Generated Base64 audio URL
  videoUrl?: string; // Generated video URL or visual representation
}

export interface VideoMetadata {
  id: string;
  topic: string;
  title: string;
  description: string;
  keywords: string[];
  chapters: string[];
  tags: string[];
  trendScore: number;
  viralityScore: number;
  competitionScore: number;
}

export interface VideoAnalytics {
  views: number;
  watchTime: number; // hours
  ctr: number; // percentage
  likes: number;
  shares: number;
  comments: number;
  subscriberGrowth: number;
}

export interface HumanFeedback {
  reason: string;
  affectedScenes: number[];
  improvementInstructions: string;
}

export interface CloudLog {
  id: string;
  timestamp: string;
  workflowId: string;
  videoId: string;
  agentName: string;
  message: string;
  status: "START" | "RUNNING" | "SUCCESS" | "FAILED";
  input: string;
  output: string;
  executionSeconds: number;
  cost: number;
}

export interface VideoWorkflow {
  id: string;
  videoId: string;
  executionId: string;
  versionId: string;
  status: VideoStatus;
  currentStep: string;
  updatedAt: string;
  topic: string;
  title: string;
  research?: ResearchReport;
  script?: ScriptModel;
  review?: ScriptReview;
  scenes?: StoryboardScene[];
  metadata?: VideoMetadata;
  feedback?: HumanFeedback;
  analytics?: VideoAnalytics;
  thumbnailUrls?: string[];
  selectedThumbnailIndex?: number;
  titles?: string[];
}

export interface SystemStats {
  totalWatchTime: number;
  subscribers: number;
  views: number;
  avgCtr: number;
  totalCost: number;
  apiTokensUsed: number;
}

export interface ApiKeyConfig {
  id: string;
  name: string;
  value: string;
  service: string;
  updatedAt: string;
}

export interface McpConnection {
  id: string;
  name: string;
  appName: string;
  status: "connected" | "disconnected";
  endpoint: string;
  description: string;
}

export interface AgentState {
  name: string;
  role: string;
  status: "idle" | "running" | "completed" | "failed";
  lastMessage: string;
  avatar: string;
}
