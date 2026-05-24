export enum AuthorizedRail {
  SEPA = 'SEPA',
  STABLECOIN_EURC = 'STABLECOIN_EURC',
  BITCOIN = 'BITCOIN'
}

export enum MandateStatus {
  ACTIVE = 'ACTIVE',
  REVOKED = 'REVOKED',
  EXPIRED = 'EXPIRED'
}

export interface ScanContextResponse {
  merchant_id: string;
  merchant_name: string;
  requested_scope: string;
  max_suggested_amount: number;
}
