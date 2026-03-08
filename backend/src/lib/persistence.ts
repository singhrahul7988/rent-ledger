import { leases, payments, transactions } from "../data/store.js";
import { isSupabaseConfigured, supabase } from "./supabase.js";
import type { Lease, PaymentRecord, TransactionEvent } from "../types.js";

type LeaseRow = {
  lease_id: string;
  tenant_account_id: string;
  onchain_lease_id: string | null;
  landlord_name: string;
  landlord_account_address: string;
  monthly_rent_usd: number;
  due_day: number;
  start_date: string;
  status: "ACTIVE" | "PAUSED" | "ENDED";
};

type PaymentRow = {
  payment_record_id: string;
  lease_id: string;
  month: string;
  amount_usd: number;
  status: "ON_TIME" | "LATE";
  tx_hash: string;
  certificate_token_id: string;
  confirmed_at: string;
};

type TransactionRow = {
  event_id: string;
  account_id: string;
  event_type: TransactionEvent["eventType"];
  status: TransactionEvent["status"];
  timestamp: string;
  tx_hash: string;
  explorer_url: string;
};

function toLease(row: LeaseRow): Lease {
  return {
    leaseId: row.lease_id,
    tenantAccountId: row.tenant_account_id,
    onchainLeaseId: row.onchain_lease_id || undefined,
    landlordName: row.landlord_name,
    landlordAccountAddress: row.landlord_account_address,
    monthlyRentUsd: Number(row.monthly_rent_usd || 0),
    dueDay: Number(row.due_day || 5),
    startDate: row.start_date,
    status: row.status
  };
}

function toLeaseRow(lease: Lease) {
  return {
    lease_id: lease.leaseId,
    tenant_account_id: lease.tenantAccountId,
    onchain_lease_id: lease.onchainLeaseId || null,
    landlord_name: lease.landlordName,
    landlord_account_address: lease.landlordAccountAddress,
    monthly_rent_usd: lease.monthlyRentUsd,
    due_day: lease.dueDay,
    start_date: lease.startDate,
    status: lease.status
  };
}

function toPayment(row: PaymentRow): PaymentRecord {
  return {
    paymentRecordId: row.payment_record_id,
    leaseId: row.lease_id,
    month: row.month,
    amountUsd: Number(row.amount_usd || 0),
    status: row.status,
    txHash: row.tx_hash,
    certificateTokenId: row.certificate_token_id,
    confirmedAt: row.confirmed_at
  };
}

function toPaymentRow(payment: PaymentRecord) {
  return {
    payment_record_id: payment.paymentRecordId,
    lease_id: payment.leaseId,
    month: payment.month,
    amount_usd: payment.amountUsd,
    status: payment.status,
    tx_hash: payment.txHash,
    certificate_token_id: payment.certificateTokenId,
    confirmed_at: payment.confirmedAt
  };
}

function toTransaction(row: TransactionRow): TransactionEvent {
  return {
    eventId: row.event_id,
    accountId: row.account_id,
    eventType: row.event_type,
    status: row.status,
    timestamp: row.timestamp,
    txHash: row.tx_hash,
    explorerUrl: row.explorer_url
  };
}

function toTransactionRow(tx: TransactionEvent) {
  return {
    event_id: tx.eventId,
    account_id: tx.accountId,
    event_type: tx.eventType,
    status: tx.status,
    timestamp: tx.timestamp,
    tx_hash: tx.txHash,
    explorer_url: tx.explorerUrl
  };
}

function ensureSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    return null;
  }
  return supabase;
}

export async function listLeasesByAccount(accountId: string): Promise<Lease[]> {
  const client = ensureSupabase();
  if (!client) {
    return leases.filter((lease) => lease.tenantAccountId === accountId);
  }

  const { data, error } = await client
    .from("leases")
    .select("*")
    .eq("tenant_account_id", accountId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []).map((row) => toLease(row as LeaseRow));
}

export async function listLeaseIdsByAccount(accountId: string): Promise<string[]> {
  const items = await listLeasesByAccount(accountId);
  return items.map((item) => item.leaseId);
}

export async function getLeaseById(leaseId: string): Promise<Lease | null> {
  const client = ensureSupabase();
  if (!client) {
    return leases.find((lease) => lease.leaseId === leaseId) || null;
  }

  const { data, error } = await client
    .from("leases")
    .select("*")
    .eq("lease_id", leaseId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return toLease(data as LeaseRow);
}

export async function createLeaseRecord(lease: Lease): Promise<void> {
  const client = ensureSupabase();
  if (!client) {
    leases.push(lease);
    return;
  }

  const { error } = await client.from("leases").insert(toLeaseRow(lease));
  if (error) throw new Error(error.message);
}

export async function updateLeaseRecord(
  leaseId: string,
  updates: Partial<Pick<Lease, "onchainLeaseId" | "landlordName" | "landlordAccountAddress" | "monthlyRentUsd" | "dueDay" | "startDate" | "status">>
): Promise<void> {
  const client = ensureSupabase();
  if (!client) {
    const lease = leases.find((item) => item.leaseId === leaseId);
    if (!lease) return;
    if (typeof updates.onchainLeaseId !== "undefined") lease.onchainLeaseId = updates.onchainLeaseId;
    if (typeof updates.landlordName !== "undefined") lease.landlordName = updates.landlordName;
    if (typeof updates.landlordAccountAddress !== "undefined") {
      lease.landlordAccountAddress = updates.landlordAccountAddress;
    }
    if (typeof updates.monthlyRentUsd !== "undefined") lease.monthlyRentUsd = updates.monthlyRentUsd;
    if (typeof updates.dueDay !== "undefined") lease.dueDay = updates.dueDay;
    if (typeof updates.startDate !== "undefined") lease.startDate = updates.startDate;
    if (typeof updates.status !== "undefined") lease.status = updates.status;
    return;
  }

  const patch: Record<string, unknown> = {};
  if (typeof updates.onchainLeaseId !== "undefined") patch.onchain_lease_id = updates.onchainLeaseId || null;
  if (typeof updates.landlordName !== "undefined") patch.landlord_name = updates.landlordName;
  if (typeof updates.landlordAccountAddress !== "undefined") {
    patch.landlord_account_address = updates.landlordAccountAddress;
  }
  if (typeof updates.monthlyRentUsd !== "undefined") patch.monthly_rent_usd = updates.monthlyRentUsd;
  if (typeof updates.dueDay !== "undefined") patch.due_day = updates.dueDay;
  if (typeof updates.startDate !== "undefined") patch.start_date = updates.startDate;
  if (typeof updates.status !== "undefined") patch.status = updates.status;

  if (Object.keys(patch).length === 0) return;

  const { error } = await client.from("leases").update(patch).eq("lease_id", leaseId);
  if (error) throw new Error(error.message);
}

export async function listPaymentsByLeaseIds(leaseIds: string[]): Promise<PaymentRecord[]> {
  if (leaseIds.length === 0) return [];

  const client = ensureSupabase();
  if (!client) {
    return payments
      .filter((payment) => leaseIds.includes(payment.leaseId))
      .sort((a, b) => new Date(b.confirmedAt).getTime() - new Date(a.confirmedAt).getTime());
  }

  const { data, error } = await client
    .from("payments")
    .select("*")
    .in("lease_id", leaseIds)
    .order("confirmed_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []).map((row) => toPayment(row as PaymentRow));
}

export async function listPaymentsByAccount(accountId: string): Promise<PaymentRecord[]> {
  const leaseIds = await listLeaseIdsByAccount(accountId);
  return listPaymentsByLeaseIds(leaseIds);
}

export async function createPaymentRecord(payment: PaymentRecord): Promise<void> {
  const client = ensureSupabase();
  if (!client) {
    payments.unshift(payment);
    return;
  }

  const { error } = await client.from("payments").insert(toPaymentRow(payment));
  if (error) throw new Error(error.message);
}

export async function listTransactionsByAccount(accountId: string): Promise<TransactionEvent[]> {
  const client = ensureSupabase();
  if (!client) {
    return transactions.filter((tx) => tx.accountId === accountId);
  }

  const { data, error } = await client
    .from("transactions")
    .select("*")
    .eq("account_id", accountId)
    .order("timestamp", { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []).map((row) => toTransaction(row as TransactionRow));
}

export async function createTransactionRecord(tx: TransactionEvent): Promise<void> {
  const client = ensureSupabase();
  if (!client) {
    transactions.unshift(tx);
    return;
  }

  const { error } = await client.from("transactions").insert(toTransactionRow(tx));
  if (error) throw new Error(error.message);
}

export async function resolveTenantAccountByTxHash(txHash: string): Promise<{ accountId: string; txHash: string } | null> {
  const client = ensureSupabase();
  if (!client) {
    const matchedPayment = payments.find(
      (payment) => String(payment.txHash).toLowerCase() === String(txHash).toLowerCase()
    );
    if (!matchedPayment) return null;
    const lease = leases.find((item) => item.leaseId === matchedPayment.leaseId);
    if (!lease) return null;
    return { accountId: lease.tenantAccountId, txHash: matchedPayment.txHash };
  }

  const { data, error } = await client
    .from("payments")
    .select("lease_id, tx_hash")
    .ilike("tx_hash", txHash)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  const lease = await getLeaseById(String((data as { lease_id?: string }).lease_id || ""));
  if (!lease) return null;

  return {
    accountId: lease.tenantAccountId,
    txHash: String((data as { tx_hash?: string }).tx_hash || txHash)
  };
}

