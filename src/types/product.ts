export interface IProduct {
  id: string
  name: string
  description?: string
  base_price: number
  image_url: string
}

export enum SIZE {
  M = 'M',
  L = 'L',
  XL = 'XL',
}

export enum ICE_LEVEL {
  ICE_ON_SIDE = 0,
  NO_ICE = 1,
  LES_ICE = 2,
  NORMAL = 3,
}

export enum SWEETNESS_LEVEL {
  HALF = '50%',
  SEVENTY = '70%',
  NORMAL = '100%',
}

export type ProductOptionsType = {
  size: SIZE
  ice_level: ICE_LEVEL
  sweetness_level: SWEETNESS_LEVEL
  toppings: string[]
  note: string
}
