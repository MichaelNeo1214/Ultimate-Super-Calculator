(function () {
  'use strict';
  window.SuperCalcModules = window.SuperCalcModules || {};

  function assertNumber(name, v) {
    if (typeof v !== 'number' || isNaN(v)) throw new Error(name + ' harus berupa angka.');
    if (!isFinite(v)) throw new Error(name + ' terlalu besar.');
  }
  function assertPositive(name, v) {
    assertNumber(name, v);
    if (v <= 0) throw new Error(name + ' harus lebih dari nol.');
  }
  function assertNonNegative(name, v) {
    assertNumber(name, v);
    if (v < 0) throw new Error(name + ' tidak boleh negatif.');
  }

  // v = s / t  (m/s)
  function speed(distance, time) {
    assertNonNegative('Jarak (s)', distance);
    assertPositive('Waktu (t)', time);
    return distance / time;
  }

  // F = m * a  (Newton)
  function force(mass, acceleration) {
    assertNonNegative('Massa (m)', mass);
    assertNumber('Percepatan (a)', acceleration);
    return mass * acceleration;
  }

  // rho = m / V  (kg/m3)
  function density(mass, volume) {
    assertNonNegative('Massa (m)', mass);
    assertPositive('Volume (V)', volume);
    return mass / volume;
  }

  // EK = 1/2 * m * v^2  (Joule)
  function kineticEnergy(mass, velocity) {
    assertNonNegative('Massa (m)', mass);
    assertNumber('Kecepatan (v)', velocity);
    return 0.5 * mass * velocity * velocity;
  }

  window.SuperCalcModules.physics = {
    speed: speed,
    force: force,
    density: density,
    kineticEnergy: kineticEnergy
  };
  // Alias Indonesia agar konsisten dengan file lama fisika.js
  window.SuperCalcModules.fisika = window.SuperCalcModules.physics;
})();
