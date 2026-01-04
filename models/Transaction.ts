import { Auction } from "./Auction";
import { User } from "./User";

export interface Transaction {
  id: string;
  amount: number;
  status: TransactionStatus;
  location: string | null;
  snapToken: string | null;
  directUrl: string | null;
  auctionId: string;
  userId: string;
  auction: Auction;
  buyer: User;
  createdAt: Date;
  updatedAt: Date;
}

export type TransactionStatus =
  | "Pending"
  | "Paid"
  | "Delivered"
  | "Completed"
  | "Expired";
