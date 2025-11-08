export type BarnConfig = {
  widthMeters: number
  heightMeters: number
  pxPerMeter: number
}

export class Barn {
  widthMeters: number
  heightMeters: number
  pxPerMeter: number

  constructor(cfg: BarnConfig) {
    this.widthMeters = cfg.widthMeters
    this.heightMeters = cfg.heightMeters
    this.pxPerMeter = cfg.pxPerMeter
  }

  get widthPx()  { return this.widthMeters  * this.pxPerMeter }
  get heightPx() { return this.heightMeters * this.pxPerMeter }
  get areaM2()   { return this.widthMeters * this.heightMeters }
}
