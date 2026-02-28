/**
 * Agent Marketplace Types
 * Directory of certified agents that use AGENTS.md
 */

export type PricingModel = 'one-time' | 'subscription' | 'usage-based' | 'free';

export type AgentCategory =
  | 'code-review'
  | 'testing'
  | 'documentation'
  | 'refactoring'
  | 'security'
  | 'devops'
  | 'pr-labeler'
  | 'template'
  | 'other';

export interface AgentListing {
  id: string;
  name: string;
  slug: string;
  description: string;
  /** Agent capabilities and use cases */
  capabilities: string[];
  /** Required permissions from AGENTS.md */
  requiredPermissions: string[];
  /** Pricing model */
  pricing: {
    model: PricingModel;
    oneTimePrice?: number; // cents
    subscriptionPrice?: number; // cents/month
    usagePrice?: number; // cents per execution
  };
  /** Example AGENTS.md configuration */
  exampleAgentsMd: string;
  /** GitHub repo or source URL */
  sourceUrl?: string;
  /** AGENTS.md file URL for execution */
  agentsMdUrl: string;
  category: AgentCategory;
  license: string;
  /** Trust score 0-100 */
  trustScore: number;
  /** Certified AGENTS.md Compatible */
  certified: boolean;
  /** Average rating 1-5 */
  rating: number;
  reviewCount: number;
  /** Seller/developer info */
  sellerId: string;
  sellerName: string;
  /** Last updated */
  updatedAt: string;
}

export interface AgentReview {
  id: string;
  agentId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface TrustScoreBreakdown {
  testCoverage: number;
  userReviews: number;
  securityCompliance: number;
  updateFrequency: number;
}
