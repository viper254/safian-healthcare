import { normalizeKenyanPhone } from "@/lib/checkout";

const REQUEST_TIMEOUT_MS = 10_000;
const TOKEN_CACHE_MS = 50 * 60 * 1000;

type MpesaEnvironment = "sandbox" | "production";

type MpesaConfig = {
  environment: MpesaEnvironment;
  baseUrl: string;
  consumerKey: string;
  consumerSecret: string;
  shortcode: string;
  passkey: string;
  callbackUrl: string;
  transactionType: string;
};

type TokenCache = {
  accessToken: string;
  expiresAt: number;
};

let tokenCache: TokenCache | null = null;

export class MpesaError extends Error {
  constructor(
    message: string,
    public readonly status = 502,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "MpesaError";
  }
}

export function getMpesaConfig(): MpesaConfig {
  const environment: MpesaEnvironment =
    process.env.MPESA_ENVIRONMENT === "production" ? "production" : "sandbox";
  const baseUrl =
    environment === "production"
      ? "https://api.safaricom.co.ke"
      : "https://sandbox.safaricom.co.ke";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

  const values = {
    consumerKey: process.env.MPESA_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET,
    shortcode: process.env.MPESA_SHORTCODE,
    passkey: process.env.MPESA_PASSKEY,
    callbackUrl:
      process.env.MPESA_CALLBACK_URL ||
      (siteUrl ? `${siteUrl}/api/payments/mpesa/callback` : undefined),
  };

  const missing = Object.entries(values)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missing.length > 0) {
    throw new MpesaError(
      `M-Pesa is not configured. Missing: ${missing.join(", ")}`,
      503,
    );
  }

  if (!/^\d+$/.test(values.shortcode!)) {
    throw new MpesaError("MPESA_SHORTCODE must contain digits only", 503);
  }

  return {
    environment,
    baseUrl,
    consumerKey: values.consumerKey!,
    consumerSecret: values.consumerSecret!,
    shortcode: values.shortcode!,
    passkey: values.passkey!,
    callbackUrl: values.callbackUrl!,
    transactionType:
      process.env.MPESA_TRANSACTION_TYPE || "CustomerPayBillOnline",
  };
}

function toDarajaTimestamp(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  return `${values.year}${values.month}${values.day}${values.hour}${values.minute}${values.second}`;
}

function createPassword(shortcode: string, passkey: string, timestamp: string): string {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();
  try {
    return (JSON.parse(text) as Record<string, unknown>) || {};
  } catch {
    throw new MpesaError("M-Pesa returned an invalid response", 502, text);
  }
}

async function getAccessToken(config: MpesaConfig): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now()) {
    return tokenCache.accessToken;
  }

  const basic = Buffer.from(
    `${config.consumerKey}:${config.consumerSecret}`,
  ).toString("base64");
  let response: Response;
  try {
    response = await fetch(
      `${config.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          Authorization: `Basic ${basic}`,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      },
    );
  } catch (error) {
    throw new MpesaError("Unable to reach the M-Pesa authentication service", 502, error);
  }

  const data = await readJson(response);
  const accessToken = typeof data.access_token === "string" ? data.access_token : "";
  if (!response.ok || !accessToken) {
    throw new MpesaError("M-Pesa authentication failed", 502, data);
  }

  tokenCache = {
    accessToken,
    expiresAt: Date.now() + TOKEN_CACHE_MS,
  };
  return accessToken;
}

export type StkPushResult = {
  merchantRequestId: string;
  checkoutRequestId: string;
  customerMessage: string;
};

export async function initiateStkPush(input: {
  amount: number;
  phone: string;
  accountReference: string;
  transactionDescription: string;
}): Promise<StkPushResult> {
  const config = getMpesaConfig();
  const phone = normalizeKenyanPhone(input.phone);
  if (!phone) throw new MpesaError("Invalid Kenyan M-Pesa phone number", 400);

  const amount = Math.round(input.amount);
  if (!Number.isSafeInteger(amount) || amount < 1) {
    throw new MpesaError("M-Pesa amount must be a positive whole number", 400);
  }

  const timestamp = toDarajaTimestamp();
  const token = await getAccessToken(config);
  let response: Response;
  try {
    response = await fetch(`${config.baseUrl}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        BusinessShortCode: Number(config.shortcode),
        Password: createPassword(config.shortcode, config.passkey, timestamp),
        Timestamp: timestamp,
        TransactionType: config.transactionType,
        Amount: amount,
        PartyA: Number(phone.international),
        PartyB: Number(config.shortcode),
        PhoneNumber: Number(phone.international),
        CallBackURL: config.callbackUrl,
        AccountReference: input.accountReference.slice(0, 12),
        TransactionDesc: input.transactionDescription.slice(0, 20),
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (error) {
    throw new MpesaError("Unable to reach the M-Pesa payment service", 502, error);
  }

  const data = await readJson(response);
  const responseCode = String(data.ResponseCode ?? "");
  const merchantRequestId = String(data.MerchantRequestID ?? "");
  const checkoutRequestId = String(data.CheckoutRequestID ?? "");

  if (!response.ok || responseCode !== "0" || !checkoutRequestId) {
    throw new MpesaError(
      typeof data.errorMessage === "string"
        ? data.errorMessage
        : typeof data.ResponseDescription === "string"
          ? data.ResponseDescription
          : "M-Pesa payment request was not accepted",
      502,
      data,
    );
  }

  return {
    merchantRequestId,
    checkoutRequestId,
    customerMessage:
      typeof data.CustomerMessage === "string"
        ? data.CustomerMessage
        : "Success. Request accepted for processing.",
  };
}

export type ParsedMpesaCallback = {
  checkoutRequestId: string;
  resultCode: number;
  resultDescription: string;
  amount: number | null;
  receiptNumber: string | null;
  phoneNumber: string | null;
  transactionDate: string | null;
};

export function parseMpesaCallback(payload: unknown): ParsedMpesaCallback | null {
  if (!payload || typeof payload !== "object") return null;
  const callback = (payload as { Body?: { stkCallback?: unknown } }).Body
    ?.stkCallback;
  if (!callback || typeof callback !== "object") return null;

  const raw = callback as Record<string, unknown>;
  const checkoutRequestId =
    typeof raw.CheckoutRequestID === "string" ? raw.CheckoutRequestID : "";
  const resultCode = Number(raw.ResultCode);
  if (!checkoutRequestId || !Number.isInteger(resultCode)) return null;

  const items = Array.isArray((raw.CallbackMetadata as { Item?: unknown[] } | undefined)?.Item)
    ? ((raw.CallbackMetadata as { Item: unknown[] }).Item)
    : [];
  const metadata = new Map<string, unknown>();
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const name = (item as { Name?: unknown }).Name;
    if (typeof name === "string") metadata.set(name, (item as { Value?: unknown }).Value);
  }

  const amountValue = metadata.get("Amount");
  const phoneValue = metadata.get("PhoneNumber");
  const dateValue = metadata.get("TransactionDate");
  return {
    checkoutRequestId,
    resultCode,
    resultDescription:
      typeof raw.ResultDesc === "string" ? raw.ResultDesc : "M-Pesa callback received",
    amount: typeof amountValue === "number" ? amountValue : Number.isFinite(Number(amountValue)) ? Number(amountValue) : null,
    receiptNumber: typeof metadata.get("MpesaReceiptNumber") === "string" ? String(metadata.get("MpesaReceiptNumber")) : null,
    phoneNumber: phoneValue === undefined || phoneValue === null ? null : String(phoneValue),
    transactionDate: dateValue === undefined || dateValue === null ? null : String(dateValue),
  };
}
