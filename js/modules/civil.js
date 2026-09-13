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

  // Q = A * v  (m3/s). A = luas penampang (m2), v = kecepatan aliran (m/s)
  function discharge(area, velocity) {
    assertPositive('Luas penampang (A)', area);
    assertNonNegative('Kecepatan aliran (v)', velocity);
    return area * velocity;
  }

  // P = rho * g * h  (Pascal). rho = massa jenis (kg/m3), g = gravitasi, h = kedalaman (m)
  function hydrostaticPressure(density, gravity, depth) {
    assertPositive('Massa jenis (rho)', density);
    assertPositive('Gravitasi (g)', gravity);
    assertNonNegative('Kedalaman (h)', depth);
    return density * gravity * depth;
  }

  window.SuperCalcModules.civil = {
    discharge: discharge,
    hydrostaticPressure: hydrostaticPressure
  };
})();
