export type TransactionStatus = "pending" | "completed" | "failed";

export type TransactionType =
  | "gift"
  | "open_market"
  | "direct_transfer"
  | "closed"
  | "init"
  | "sale_transfer"
  | "escrow_sale";

export interface ITransaction {
  _id?: string;
  deedId: string;
  from: string;
  to: string;
  amount: number;
  share: number;
  type: TransactionType;
  hash?: string;
  blockchain_identification?: string;
  date?: string;
  description?: string;
  status: TransactionStatus;
  createdAt?: string;
  updatedAt?: string;
}

