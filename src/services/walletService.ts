import api from './api';

export interface TransactionDto {
  id: number;
  amount: number;
  transactionType: string;
  description: string;
  createdAt: string;
}

export interface WalletDto {
  id: number;
  balance: number;
  transactions: TransactionDto[];
}

export async function getMyWallet(): Promise<WalletDto> {
  const response = await api.get('/wallets/me');
  return response.data as WalletDto;
}

export async function deductWallet(amount: number, description: string): Promise<void> {
  await api.post('/wallets/deduct', { amount, description });
}
