import { Auction } from "./Auction";
import { User } from "./User";

export interface Bid {
  id: string;
  amount: number;
  auctionId: string;
  userId: string;
  auction: Auction;
  user: User;
  createdAt: Date;
  updatedAt: Date;
}
