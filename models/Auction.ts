import { Bid } from "./Bid";
import { Transaction } from "./Transaction";
import { User } from "./User";

export interface Auction {
  id: string;
  name: string;
  description: string;
  location: string;
  images: string[];
  openingPrice: number;
  buyNowPrice: number;
  minimumBid: number;
  start: Date;
  end: Date;
  category: AuctionCategory;
  status: AuctionStatus;
  userId: string;
  seller: User;
  transaction: Transaction | null;
  bids: Bid[];
  createdAt: Date;
  updatedAt: Date;
  isAbleToBid: boolean;
  isAbleToFinish: boolean;
  isWaitingForSeller: boolean;
  isSeller: boolean;
  isBuyer: boolean;
}

export type AuctionStatus = "Pending" | "Accepted" | "Rejected";
export type AuctionCategory =
  | "Tops"
  | "Bottoms"
  | "Footwear"
  | "Accessories"
  | "Outerwear";
