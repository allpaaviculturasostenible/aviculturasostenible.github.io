import Phaser from "phaser";

export type ChickVitals = {
  ageDays: number; // edad en días
};

// --- DATOS REALES (del nuevo análisis) ---
// Área en metros cuadrados que ocupa un pollo
const AREA_D1_M2 = 0.0025; // ~55 cm²
const AREA_D56_M2 = 0.030;  // ~600 cm² (Día 56)

export class Chick extends Phaser.GameObjects.Container {
  vitals: ChickVitals;
  body!: Phaser.Physics.Arcade.Body;

  // NUEVO: Almacena la escala de la simulación
  private pxPerMeter: number;

  // Formas que componen al pollito
  private bodyShape: Phaser.GameObjects.Shape;
  private beakShape: Phaser.GameObjects.Shape;
  private wingLeftShape: Phaser.GameObjects.Shape;
  private wingRightShape: Phaser.GameObjects.Shape;

  // Este es el radio de *dibujo* de nuestro círculo base (a escala 1)
  private baseRadius: number = 14;

  // Colores para la interpolación
  private colorYellow = new Phaser.Display.Color(255, 255, 0);
  private colorPink = new Phaser.Display.Color(255, 182, 193);
  private colorWhite = new Phaser.Display.Color(255, 255, 255);

  // ACTUALIZADO: El constructor ahora acepta 'pxPerMeter'
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    ageDays: number,
    pxPerMeter: number // <-- ¡NUEVO PARÁMETRO!
  ) {
    super(scene, x, y);

    this.vitals = { ageDays };
    this.pxPerMeter = pxPerMeter; // <-- Almacenamos la escala

    // --- Creación de formas (sin cambios) ---
    this.bodyShape = scene.add.circle(0, 0, this.baseRadius, 0xFFFFFF);

    this.beakShape = scene.add.triangle(
      +4, 0,
      0, -this.baseRadius - 3,
      -4, -this.baseRadius + 2,
      4, -this.baseRadius + 2,
      0xFFA500
    );

    this.wingLeftShape = scene.add.triangle(
      -this.baseRadius + 7, +2,
      0, 0, -6, 4, -6, -4, 0xFFFFFF
    );

    this.wingRightShape = scene.add.triangle(
      this.baseRadius -1, +2,
      0, 0, 6, 4, 6, -4, 0xFFFFFF
    );

    this.add([
      this.bodyShape,
      this.wingLeftShape,
      this.wingRightShape,
      this.beakShape,
    ]);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Animación de alas (sin cambios)
    this.animateWings();
    
    // Llamada inicial para establecer tamaño/color
    this.updateScaleAndBody();
  }

  /**
   * Animación de aleteo (sin cambios)
   */
  animateWings() {
    const commonWingTween = {
      rotation: { from: -0.1, to: 0.1 },
      duration: 300, yoyo: true, repeat: -1,
      ease: 'Sine.easeInOut',
    };
    this.scene.tweens.add({
      targets: this.wingLeftShape, ...commonWingTween,
      delay: Math.random() * 200,
    });
    this.scene.tweens.add({
      targets: this.wingRightShape, ...commonWingTween,
      delay: Math.random() * 200,
    });
  }

  // --- LÓGICA DE TAMAÑO REAL (NUEVA) ---

  /**
   * Calcula el Área (m²) por edad, interpolada linealmente 1→56 días
   */
  private areaByAge(ageDays: number) {
    // Clamp asegura que la edad esté entre 1 y 56
    const a = Phaser.Math.Clamp(ageDays, 1, 56);
    // 't' es el factor de interpolación (0.0 a 1.0)
    const t = (a - 1) / (56 - 1);
    return AREA_D1_M2 + t * (AREA_D56_M2 - AREA_D1_M2);
  }

  /**
   * ACTUALIZADO:
   * Ajusta escala visual Y cuerpo físico en función del ÁREA REAL.
   */
  updateScaleAndBody() {
    // 1. Obtener edad (clamp 1-56) y normalizar
    const a = Phaser.Math.Clamp(this.vitals.ageDays, 1, 56);
    const t_normalized = (a - 1) / (56 - 1); // 0.0 a 1.0

    // 2. Calcular radio físico real en píxeles
    const areaM2 = this.areaByAge(a);
    const px2PerM2 = this.pxPerMeter * this.pxPerMeter;
    const areaPx2 = areaM2 * px2PerM2;
    
    // r = radio físico real que debe tener en pantalla
    const r = Math.max(3, Math.sqrt(areaPx2 / Math.PI));

    // 3. Calcular escala visual
    // Comparamos el radio real (r) con el radio de nuestro dibujo (baseRadius)
    const visualScale = r / this.baseRadius;
    this.setScale(visualScale);

    // 4. Actualizar color (basado en el 't' normalizado)
    this.updateColor(t_normalized);

    // 5. Ajustar cuerpo físico
    if (this.body) {
      this.body.setCircle(r); // Usa el radio real
      this.body.setOffset(-r, -r); // Centra el cuerpo
      this.body.setBounce(0.3);
      this.body.useDamping = true;
      this.body.setDrag(0.9, 0.9);
      this.body.setMaxVelocity(90, 90);
    }
  }

  /**
   * ACTUALIZADO:
   * Interpola el color según el factor 't' (0.0 a 1.0)
   */
  private updateColor(t_normalized: number) {
    let bodyColor;

    if (t_normalized < 0.5) {
      // Mitad 1: Amarillo (0.0) -> Rosado (0.5)
      const t_half = t_normalized * 2;
      bodyColor = Phaser.Display.Color.Interpolate.ColorWithColor(
        this.colorYellow, this.colorPink, 1, t_half
      );
    } else {
      // Mitad 2: Rosado (0.5) -> Blanco (1.0)
      const t_half = (t_normalized - 0.5) * 2;
      bodyColor = Phaser.Display.Color.Interpolate.ColorWithColor(
        this.colorPink, this.colorWhite, 1, t_half
      );
    }

    const finalColor = Phaser.Display.Color.GetColor(
      bodyColor.r, bodyColor.g, bodyColor.b
    );

    this.bodyShape.setFillStyle(finalColor);
    this.wingLeftShape.setFillStyle(finalColor);
    this.wingRightShape.setFillStyle(finalColor);
  }

  /**
   * ACTUALIZADO:
   * Velocidad preferida según edad (ciclo de 56 días)
   */
  getPreferredSpeed() {
    const a = Phaser.Math.Clamp(this.vitals.ageDays, 0, 56);
    // más activos jóvenes, luego bajan
    // 0–14 d: 60→80 px/s, 15–56 d: 80→40 px/s
    return a <= 14 ? 60 + (a / 14) * 20 : 80 - ((a - 14) / 42) * 40;
  }

  // --- Métodos "Proxy" de velocidad (sin cambios) ---

  public setVelocity(x: number, y: number): this {
    if (this.body) this.body.setVelocity(x, y);
    return this;
  }
  public setVelocityX(x: number): this {
    if (this.body) this.body.setVelocityX(x);
    return this;
  }
  public setVelocityY(y: number): this {
    if (this.body) this.body.setVelocityY(y);
    return this;
  }
}