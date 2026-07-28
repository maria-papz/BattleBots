export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Normalize degrees into [-180, 180). */
export function normalizeAngleDeg(degrees: number): number {
  let a = degrees % 360;
  if (a >= 180) a -= 360;
  if (a < -180) a += 360;
  return a;
}

/** Shortest signed difference from -> to in degrees, result in (-180, 180]. */
export function shortestAngleDiffDeg(fromDeg: number, toDeg: number): number {
  return normalizeAngleDeg(toDeg - fromDeg);
}

export function distance(
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = bx - ax;
  const dy = by - ay;
  return Math.hypot(dx, dy);
}

export function angleToDeg(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
): number {
  return (Math.atan2(toY - fromY, toX - fromX) * 180) / Math.PI;
}

export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * True when target centre is within range and inside the frontal attack cone.
 * attackArc is the full cone width in degrees.
 */
export function isWithinAttackArc(
  attackerX: number,
  attackerY: number,
  facingDeg: number,
  targetX: number,
  targetY: number,
  range: number,
  attackArcDeg: number,
): boolean {
  const dist = distance(attackerX, attackerY, targetX, targetY);
  if (dist > range) {
    return false;
  }
  const bearing = angleToDeg(attackerX, attackerY, targetX, targetY);
  const delta = Math.abs(shortestAngleDiffDeg(facingDeg, bearing));
  return delta <= attackArcDeg / 2;
}
