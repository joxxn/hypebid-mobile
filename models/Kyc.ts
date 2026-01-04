export type KycStatus = "Pending" | "Accepted" | "Rejected";

export interface Kyc {
    id: string;
    userId: string;
    image: string;
    status: KycStatus;
    createdAt: string;
    updatedAt: string;
}
