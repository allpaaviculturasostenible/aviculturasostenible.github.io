import Phaser from "phaser";
import { EventBus } from "../eventBus";
import { Barn } from "../core/Barn";
import { Chick } from "../core/Chick";

type ClimateKey = "caliente" | "templado" | "frio";

type SimConfig = {
  widthMeters: number;
  heightMeters: number;
  chicks: number;
  initialAge: number;
  climate: ClimateKey;
  areaEff: number; // área efectiva (clamp 1–3 m²) que envía la UI
  recommended: number; // aves recomendadas según clima y área
  hardMax: number; // tope x2 del recomendado
};

export class SimScene extends Phaser.Scene {
  barn!: Barn;

  private barnRect?: Phaser.GameObjects.Rectangle;
  private wallTop?: Phaser.GameObjects.Rectangle;
  private wallBottom?: Phaser.GameObjects.Rectangle;
  private wallLeft?: Phaser.GameObjects.Rectangle;
  private wallRight?: Phaser.GameObjects.Rectangle;

  private chicksGroup?: Phaser.Physics.Arcade.Group;

  private overlay?: Phaser.GameObjects.Graphics;
  private infoText?: Phaser.GameObjects.Text;

  // Ahora 96 px/m para escala realista
  pxPerMeter = 96;

  cfg: SimConfig = {
    widthMeters: 12,
    heightMeters: 12,
    chicks: 26,
    initialAge: 7,
    climate: "templado",
    areaEff: 1,
    recommended: 13,
    hardMax: 26,
  };

  constructor() {
    super("Sim");
  }

  create() {
    EventBus.on("ui:update", (cfg: Partial<SimConfig>) => {
      this.cfg = { ...this.cfg, ...cfg };

      // Clamp cantidad de pollitos a hardMax llegado desde la UI
      if (this.cfg.chicks > this.cfg.hardMax)
        this.cfg.chicks = this.cfg.hardMax;

      this.resetWorld();
    });
    this.resetWorld();
  }

  private clearWorld() {
    if (this.physics && this.physics.world)
      this.physics.world.colliders.destroy();

    // Destruir pollitos (limpio y seguro)
    if (this.chicksGroup) {
      // Destruye y quita todos los hijos del grupo
      this.chicksGroup.clear(true, true);

      this.chicksGroup.destroy?.();

      this.chicksGroup = undefined;
    }

    this.wallTop?.destroy();
    this.wallTop = undefined;
    this.wallBottom?.destroy();
    this.wallBottom = undefined;
    this.wallLeft?.destroy();
    this.wallLeft = undefined;
    this.wallRight?.destroy();
    this.wallRight = undefined;

    this.overlay?.destroy();
    this.overlay = undefined;
    this.infoText?.destroy();
    this.infoText = undefined;
    this.barnRect?.destroy();
    this.barnRect = undefined;
  }

  resetWorld() {
    this.clearWorld();

    // Modelo Barn (geom. visual libre; la lógica usa areaEff 1–3 m²)
    this.barn = new Barn({
      widthMeters: this.cfg.widthMeters,
      heightMeters: this.cfg.heightMeters,
      pxPerMeter: this.pxPerMeter,
    });

    const cam = this.cameras.main;
    const w = Math.min(cam.width - 80, this.barn.widthPx);
    const h = Math.min(cam.height - 100, this.barn.heightPx);
    const cx = cam.width / 2;
    const cy = cam.height / 2;

    // Galpón visible
    this.barnRect = this.add
      .rectangle(cx, cy, w, h, 0xfbf7e8, 1)
      .setStrokeStyle(4, 0x8b5e34)
      .setDepth(0);

    // Paredes invisibles
    this.wallTop = this.add
      .rectangle(
        cx,
        this.barnRect.y - this.barnRect.height / 2 + 4,
        this.barnRect.width - 8,
        12
      )
      .setVisible(false);
    this.physics.add.existing(this.wallTop, true);

    this.wallBottom = this.add
      .rectangle(
        cx,
        this.barnRect.y + this.barnRect.height / 2 - 4,
        this.barnRect.width - 8,
        12
      )
      .setVisible(false);
    this.physics.add.existing(this.wallBottom, true);

    this.wallLeft = this.add
      .rectangle(
        this.barnRect.x - this.barnRect.width / 2 + 4,
        cy,
        12,
        this.barnRect.height - 8
      )
      .setVisible(false);
    this.physics.add.existing(this.wallLeft, true);

    this.wallRight = this.add
      .rectangle(
        this.barnRect.x + this.barnRect.width / 2 - 4,
        cy,
        12,
        this.barnRect.height - 8
      )
      .setVisible(false);
    this.physics.add.existing(this.wallRight, true);

    (
      this.wallTop.body as Phaser.Physics.Arcade.StaticBody
    ).updateFromGameObject();
    (
      this.wallBottom.body as Phaser.Physics.Arcade.StaticBody
    ).updateFromGameObject();
    (
      this.wallLeft.body as Phaser.Physics.Arcade.StaticBody
    ).updateFromGameObject();
    (
      this.wallRight.body as Phaser.Physics.Arcade.StaticBody
    ).updateFromGameObject();

    // Grupo de pollitos
    this.chicksGroup = this.physics.add.group({ collideWorldBounds: false });

    // Spawn dentro del rect
    const left = this.barnRect.x - this.barnRect.width / 2 + 20;
    const right = this.barnRect.x + this.barnRect.width / 2 - 20;
    const top = this.barnRect.y - this.barnRect.height / 2 + 20;
    const bottom = this.barnRect.y + this.barnRect.height / 2 - 20;

    for (let i = 0; i < this.cfg.chicks; i++) {
      const x = Phaser.Math.Between(left, right);
      const y = Phaser.Math.Between(top, bottom);
      const c = new Chick(this, x, y, this.cfg.initialAge, this.pxPerMeter);
      c.setDepth(5);

      const sp = c.getPreferredSpeed();
      c.setVelocity(Phaser.Math.Between(-sp, sp), Phaser.Math.Between(-sp, sp));
      this.chicksGroup.add(c);
    }

    // Colisiones
    this.physics.add.collider(this.chicksGroup, this.chicksGroup);
    this.physics.add.collider(this.chicksGroup, this.wallTop!);
    this.physics.add.collider(this.chicksGroup, this.wallBottom!);
    this.physics.add.collider(this.chicksGroup, this.wallLeft!);
    this.physics.add.collider(this.chicksGroup, this.wallRight!);

    // Overlay y texto
    this.overlay = this.add.graphics().setDepth(2);
    this.infoText = this.add
      .text(16, this.scale.height - 28, "", {
        fontSize: "14px",
        color: "#111",
        backgroundColor: "rgba(255,255,255,0.85)",
      })
      .setDepth(10)
      .setPadding(6, 2, 6, 2);
  }

  update(_: number, dtMs: number) {
    const dt = dtMs / 1000;
    if (!this.chicksGroup) return;

    // Wander + crecimiento/escala realista
    this.chicksGroup.children.iterate((obj) => {
      const c = obj as Chick;
      const body = c.body as Phaser.Physics.Arcade.Body;
      if (!body) return null;

      c.vitals.ageDays = Math.min(56, c.vitals.ageDays + (56 / 40) * dt); // 40 s → 56 días
      c.updateScaleAndBody();

      const sp = c.getPreferredSpeed();
      const jx = Phaser.Math.FloatBetween(-10, 10);
      const jy = Phaser.Math.FloatBetween(-10, 10);

      const vx = Number.isFinite(body.velocity.x) ? body.velocity.x : 0;
      const vy = Number.isFinite(body.velocity.y) ? body.velocity.y : 0;

      body.setVelocity(
        Phaser.Math.Clamp(vx + jx, -sp, sp),
        Phaser.Math.Clamp(vy + jy, -sp, sp)
      );
      return null;
    });

    // Overlay por densidad de aves (no kg/m² aún)
    const areaM2 = Math.max(1, Math.min(3, this.cfg.areaEff || 1));
    const avesPorM2 = this.chicksGroup.getLength() / areaM2;
    let color = 0x22c55e;
    if (avesPorM2 < 11) color = 0x3b82f6;
    if (avesPorM2 > 13) color = 0xf97316;
    if (avesPorM2 > 16) color = 0xef4444;

    const cam = this.cameras.main;
    const w = Math.min(cam.width - 80, this.barn.widthPx);
    const h = Math.min(cam.height - 100, this.barn.heightPx);
    const cx = cam.width / 2;
    const cy = cam.height / 2;
    const left = cx - w / 2;
    const top = cy - h / 2;

    this.overlay?.clear().fillStyle(color, 0.12).fillRect(left, top, w, h);

    const msg = `Clima: ${
      this.cfg.climate
    } — Aves: ${this.chicksGroup.getLength()} | Área efectiva ${areaM2.toFixed(
      2
    )} m² | Recomendado ${this.cfg.recommended}, Máx ${this.cfg.hardMax}`;
    this.infoText?.setText(msg);
    this.infoText?.setPosition(
      16,
      this.scale.height - (this.infoText?.height ?? 0) - 12
    );
  }
}
