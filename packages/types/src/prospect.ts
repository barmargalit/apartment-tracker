export enum SafeSpace {
  Room = 'Room',
  Floor = 'Floor',
  Building = 'Building',
  None = 'None',
}

export interface Prospect {
  id: string;
  created: Date;
  modified: Date;
  state: number;
  street: string;
  city: string;
  square_meters: number;
  balcony_square_meters: number | null;
  rooms: number;
  parking: boolean;
  safe_space: SafeSpace;
  contractor: string | null;
  comment: string | null;
  price: number | null;
  realtor: boolean;
  realtor_fee: number | null;
  floor_plan_url: string | null;
  video_url: string | null;
  floor: number | null;
  property_tax: number | null;
  building_fees: number | null;
}
