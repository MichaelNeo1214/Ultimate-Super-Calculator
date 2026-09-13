(function () {
  'use strict';
  window.SuperCalcModules = window.SuperCalcModules || {};

  function assertPositive(name, v) {
    if (typeof v !== 'number' || isNaN(v)) throw new Error(name + ' harus berupa angka.');
    if (!isFinite(v)) throw new Error(name + ' terlalu besar.');
    if (v < 0) throw new Error(name + ' tidak boleh negatif.');
    if (v === 0) throw new Error(name + ' harus lebih dari nol.');
  }

  function squareArea(sisi) { assertPositive('Sisi', sisi); return sisi * sisi; }
  function squarePerimeter(sisi) { assertPositive('Sisi', sisi); return 4 * sisi; }
  function rectangleArea(panjang, lebar) { assertPositive('Panjang', panjang); assertPositive('Lebar', lebar); return panjang * lebar; }
  function triangleArea(alas, tinggi) { assertPositive('Alas', alas); assertPositive('Tinggi', tinggi); return 0.5 * alas * tinggi; }
  function circleArea(jari) { assertPositive('Jari-jari', jari); return Math.PI * jari * jari; }
  function circleCircumference(jari) { assertPositive('Jari-jari', jari); return 2 * Math.PI * jari; }
  function cubeVolume(sisi) { assertPositive('Sisi', sisi); return Math.pow(sisi, 3); }
  function cubeSurface(sisi) { assertPositive('Sisi', sisi); return 6 * sisi * sisi; }
  function sphereVolume(jari) { assertPositive('Jari-jari', jari); return (4 / 3) * Math.PI * Math.pow(jari, 3); }
  function sphereSurface(jari) { assertPositive('Jari-jari', jari); return 4 * Math.PI * jari * jari; }
  function cylinderVolume(jari, tinggi) { assertPositive('Jari-jari', jari); assertPositive('Tinggi', tinggi); return Math.PI * jari * jari * tinggi; }
  function cylinderSurface(jari, tinggi) { assertPositive('Jari-jari', jari); assertPositive('Tinggi', tinggi); return 2 * Math.PI * jari * (jari + tinggi); }

  window.SuperCalcModules.geometry = {
    squareArea: squareArea,
    squarePerimeter: squarePerimeter,
    rectangleArea: rectangleArea,
    triangleArea: triangleArea,
    circleArea: circleArea,
    circleCircumference: circleCircumference,
    cubeVolume: cubeVolume,
    cubeSurface: cubeSurface,
    sphereVolume: sphereVolume,
    sphereSurface: sphereSurface,
    cylinderVolume: cylinderVolume,
    cylinderSurface: cylinderSurface
  };
})();
