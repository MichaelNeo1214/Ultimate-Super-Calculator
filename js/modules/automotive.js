(function () {
  'use strict';
  window.SuperCalcModules = window.SuperCalcModules || {};

  function engineDisplacement(boreMm, strokeMm, cylinders) {
    [boreMm, strokeMm, cylinders].forEach(function (v, i) {
      var names = ['Bore (diameter piston)', 'Stroke (langkah piston)', 'Jumlah silinder'];
      if (typeof v !== 'number' || isNaN(v)) throw new Error(names[i] + ' harus berupa angka.');
      if (!isFinite(v)) throw new Error(names[i] + ' terlalu besar.');
    });
    if (boreMm <= 0) throw new Error('Bore harus lebih dari nol.');
    if (strokeMm <= 0) throw new Error('Stroke harus lebih dari nol.');
    if (Math.abs(cylinders - Math.round(cylinders)) > 1e-9) throw new Error('Jumlah silinder harus bilangan bulat.');
    var n = Math.round(cylinders);
    if (n < 1 || n > 16) throw new Error('Jumlah silinder harus 1–16.');
    if (boreMm > 200 || strokeMm > 200) throw new Error('Bore/stroke tidak wajar (> 200 mm). Periksa satuan (mm).');
    var boreCm = boreMm / 10;
    var strokeCm = strokeMm / 10;
    var cc = (Math.PI / 4) * boreCm * boreCm * strokeCm * n;
    return { cc: cc, liters: cc / 1000, perCylinder: cc / n };
  }

  // Final gear ratio = gigi belakang (driven) / gigi depan (drive)
  // stockRatio opsional (>0) untuk hitung % perubahan.
  function gearRatio(driveTeeth, drivenTeeth, stockRatio) {
    [driveTeeth, drivenTeeth].forEach(function (v, i) {
      var nm = ['Gigi depan (drive)', 'Gigi belakang (driven)'][i];
      if (typeof v !== 'number' || isNaN(v)) throw new Error(nm + ' harus berupa angka.');
      if (!isFinite(v)) throw new Error(nm + ' terlalu besar.');
    });
    if (Math.abs(driveTeeth - Math.round(driveTeeth)) > 1e-9) throw new Error('Gigi depan harus bilangan bulat (jumlah mata).');
    if (Math.abs(drivenTeeth - Math.round(drivenTeeth)) > 1e-9) throw new Error('Gigi belakang harus bilangan bulat (jumlah mata).');
    if (driveTeeth < 5 || driveTeeth > 100) throw new Error('Gigi depan harus 5–100 mata.');
    if (drivenTeeth < 5 || drivenTeeth > 150) throw new Error('Gigi belakang harus 5–150 mata.');
    var ratio = drivenTeeth / driveTeeth;
    var out = { ratio: ratio };
    if (stockRatio !== undefined && stockRatio !== null && !isNaN(stockRatio) && stockRatio > 0) {
      if (stockRatio <= 0 || stockRatio > 20) throw new Error('Rasio standar tidak wajar.');
      out.changePct = ((ratio - stockRatio) / stockRatio) * 100;
      out.effect = out.changePct > 0.5 ? 'Akselerasi ↑, top-speed ↓ dibanding standar.' : out.changePct < -0.5 ? 'Top-speed ↑, akselerasi ↓ dibanding standar.' : 'Hampir sama dengan standar.';
    }
    return out;
  }

  // Oli samping 2-tak: oilMl = fuelMl / ratio (ratio mis. 25 = 1:25)
  function premixOil(fuelLiters, ratio) {
    if (typeof fuelLiters !== 'number' || isNaN(fuelLiters)) throw new Error('Bensin harus berupa angka.');
    if (typeof ratio !== 'number' || isNaN(ratio)) throw new Error('Rasio harus berupa angka.');
    if (fuelLiters <= 0) throw new Error('Bensin harus lebih dari nol.');
    if (fuelLiters > 1000) throw new Error('Bensin tidak wajar (> 1000 L).');
    if (Math.abs(ratio - Math.round(ratio)) > 1e-9) throw new Error('Rasio harus bilangan bulat (cth: 25 untuk 1:25).');
    if (ratio < 10 || ratio > 100) throw new Error('Rasio umum 1:10 – 1:100 (cth: 25, 30, 50).');
    var oilMl = (fuelLiters * 1000) / ratio;
    return { oilMl: oilMl, oilLiters: oilMl / 1000 };
  }

  window.SuperCalcModules.automotive = {
    engineDisplacement: engineDisplacement,
    gearRatio: gearRatio,
    premixOil: premixOil
  };
})();
