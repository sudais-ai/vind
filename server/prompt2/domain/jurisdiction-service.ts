export type JurisdictionRecord = {
  id: number;
  name: string;
  country: string | null;
  region: string | null;
};

export interface JurisdictionService {
  get(jurisdictionId: number): Promise<JurisdictionRecord | null>;
  list(): Promise<JurisdictionRecord[]>;
}
