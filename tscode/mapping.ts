import { parseLatLng } from "./utils";

export const DistanceMode_LINE = 'chim bay'
export const DistanceMode_ROUTE = 'lái xe'

export const remapModel = (obj: any) => {
  return {
    targetLocation: parseLatLng(obj['vị trí đất']),
    intro: obj['giới thiệu'],
    arrounds: obj['xung quanh'].map(x => ({
      name: x['tên'],
      intro: x['giới thiệu'],
      location: parseLatLng(x['tọa độ']),
      icon: x['hình ảnh'],
      distanceMode: x['cách đo'] || DistanceMode_ROUTE,
      borderColor: x['đường viền'] || "#ff0030", // vien mau do
      routeLabelLocation: x['vị trí nhãn'] && parseLatLng(x['vị trí nhãn'])
    } as ArroundInputSchema))
  } as ScriptRunnerSchema;
}

export type RawInputSchema = {
  'vị trí đất': string;
  ['xung quanh']: {
    'tên': string;
    'tọa độ': string;
    'cách đo'?: string;
    'vị trí nhãn'?: string;
    'đường viền'? : string;
  }[]
}

export type ArroundInputSchema = {
  name: string;
  intro: string;
  location: google.maps.LatLng;
  icon?: string;
  borderColor: string;
  distanceMode: string;
  routeLabelLocation?: google.maps.LatLng;
}
export type ScriptRunnerSchema = {
  targetLocation: google.maps.LatLng;
  intro: string;
  arrounds: ArroundInputSchema[]
}