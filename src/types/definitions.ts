// Definitions Service Types

export interface RegistrationFeeDefinition {
  id: string;
  name: string;
  value: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RegistrationFeesResponse {
  government_fee: number;
  ivsl_fee: number;
  survey_fee: number;
  notary_fee: number;
  total_registration_fee: number;
}

export interface StampFeeTier {
  min_amount: number;
  max_amount: number | null;
  percentage: number;
}

export interface StampFeeTierDefinition {
  id: number;
  transaction_type: string;
  min_amount: number;
  max_amount: number | null;
  percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StampFeeTiersResponse {
  transaction_type: string;
  tiers: StampFeeTier[];
}

export interface AllStampFeeTiersResponse {
  tiers_by_type: Record<string, StampFeeTier[]>;
  default_tiers: StampFeeTier[];
}

export interface CalculateStampFeeRequest {
  amount_in_eth: number;
  transaction_type?: string;
}

export interface CalculateStampFeeResponse {
  percentage: number;
  fee_amount: number;
  transaction_type: string;
  tier_applied: StampFeeTier | null;
}

export interface RegistrationFeeDefinitionCreate {
  id: string;
  name: string;
  value: number;
  description?: string;
  is_active?: boolean;
}

export interface RegistrationFeeDefinitionUpdate {
  name?: string;
  value?: number;
  description?: string;
  is_active?: boolean;
}

export interface StampFeeTierDefinitionCreate {
  transaction_type: string;
  min_amount: number;
  max_amount?: number | null;
  percentage: number;
  is_active?: boolean;
}

export interface StampFeeTierDefinitionUpdate {
  transaction_type?: string;
  min_amount?: number;
  max_amount?: number | null;
  percentage?: number;
  is_active?: boolean;
}

