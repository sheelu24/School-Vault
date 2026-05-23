export type MemberStatus = 'ACTIVE' | 'INACTIVE';

export interface Member {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: MemberStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MemberRequest {
  name: string;
  email: string;
  phone?: string;
  status?: MemberStatus;
}
