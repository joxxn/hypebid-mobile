import { Auction } from "./Auction";
import { Bid } from "./Bid";
import { Transaction } from "./Transaction";
import { Withdraw } from "./Withdraw";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
  balance: number;
  disburbedBalance: number;
  pendingBalance: number;
  image: string | null;
  banned: boolean;
  bids: Bid[];
  auctions: Auction[];
  withdraws: Withdraw[];
  transactions: Transaction[];
  createdAt: Date;
  updatedAt: Date;
  accessToken: string;
}

export type Role = "Admin" | "User";
