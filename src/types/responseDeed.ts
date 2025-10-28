export interface IValuation {
  _id?: string;
  requestedValue?: number;
  estimatedValue?: number;
  isAccepted?: boolean;
  timestamp: number;
}

export interface ITnx {
  _id?: string;
  from: string;
  to: string;
  amount: number;
  share: number;
  timestamp: number;
}

export interface IOwner {
  address: string;
  share: number;
}

export interface ILocationPoint {
  longitude: number;
  latitude: number;
}

export interface ISides {
  North?: string;
  South?: string;
  East?: string;
  West?: string;
}

export type DeedTypeEnum =
  | "Power of Attorney"
  | "Gift"
  | "Sale"
  | "Exchange"
  | "Lease"
  | "Mortgage"
  | "Partition Deed"
  | "Last Will"
  | "Trust Deed"
  | "Settlement Deed"
  | "Declaration of Trust"
  | "Agreement to Sell"
  | "Conditional Transfer"
  | "Transfer Deed"
  | "Deed of Assignment"
  | "Deed of Disclaimer"
  | "Deed of Rectification"
  | "Deed of Cancellation"
  | "Deed of Surrender"
  | "Deed of Release"
  | "Deed of Nomination"
  | "Affidavit"
  | "Court Order / Judgment"
  | "Other";

export interface IDeedType {
  deedType: DeedTypeEnum;
  deedNumber: string;
}

export type LandTypeEnum = "Paddy land" | "Highland" | "Residential";

export type LandSizeUnitEnum =
  | "Perches"
  | "Acres"
  | "Hectares"
  | "Sqm"
  | "Sqft";

export interface IDeed {
  _id: string;
  tokenId?: number;
  title: ITnx[];
  owners: IOwner[];
  deedType: IDeedType;
  location: ILocationPoint[];
  sides: ISides;
  deedNumber: string;
  landType: LandTypeEnum;
  timestamp: number;

  ownerFullName: string;
  ownerNIC: string;
  ownerAddress: string;
  ownerPhone: string;

  landTitleNumber: string;
  landAddress: string;
  landArea: number;
  landSizeUnit?: LandSizeUnitEnum;
  surveyPlanNumber?: string;
  boundaries?: string;

  valuation?: IValuation[];

  district: string;
  division: string;

  registrationDate: Date;

  surveySignature?: string;
  surveyAssigned?: string;
  notarySignature?: string;
  notaryAssigned?: string;
  ivslAssigned?: string;
  ivslSignature?: string;

  createdAt?: Date;
  updatedAt?: Date;
}
