(function () {
  'use strict';
  window.SuperCalcModules = window.SuperCalcModules || {};

  function assertNumber(name, v) {
    if (typeof v !== 'number' || isNaN(v)) throw new Error(name + ' harus berupa angka.');
    if (!isFinite(v)) throw new Error(name + ' terlalu besar.');
  }

  // eDPI = dpi * sens
  function edpi(dpi, sens) {
    assertNumber('DPI mouse', dpi);
    assertNumber('Sensitivitas', sens);
    if (dpi <= 0) throw new Error('DPI harus lebih dari nol.');
    if (sens <= 0) throw new Error('Sensitivitas harus lebih dari nol.');
    if (dpi > 30000) throw new Error('DPI tidak wajar (> 30000).');
    if (sens > 100) throw new Error('Sensitivitas tidak wajar (> 100).');
    var value = dpi * sens;
    var feel = value < 400 ? 'Sangat rendah (arm-aim, perlu mousepad besar).' :
      value < 1000 ? 'Rendah–stabil (cocok tactical FPS).' :
      value < 2500 ? 'Menengah (seimbang).' :
      value < 5000 ? 'Tinggi (cepat, butuh kontrol).' :
      'Sangat tinggi (rawan over-aim).';
    return { edpi: value, feel: feel };
  }

  // ratePercent: % per pull (0-100), pulls: jumlah pull, pity: jaminan (0 = tanpa pity)
  function gacha(ratePercent, pulls, pity) {
    assertNumber('Rate', ratePercent);
    assertNumber('Pull', pulls);
    assertNumber('Pity', pity);
    if (ratePercent <= 0 || ratePercent > 100) throw new Error('Rate harus 0–100% (cth: 0,6).');
    if (Math.abs(pulls - Math.round(pulls)) > 1e-9) throw new Error('Jumlah pull harus bilangan bulat.');
    if (pulls < 1 || pulls > 100000) throw new Error('Pull harus 1–100000.');
    if (Math.abs(pity - Math.round(pity)) > 1e-9) throw new Error('Pity harus bilangan bulat (0 = tanpa pity).');
    if (pity < 0 || pity > 100000) throw new Error('Pity harus 0–100000.');
    var p = ratePercent / 100;
    var n = Math.round(pulls), py = Math.round(pity);
    var prob;
    if (py > 0 && n >= py) prob = 1;
    else prob = 1 - Math.pow(1 - p, n);
    return { probability: prob * 100, expectedPulls: 1 / p, failChance: (1 - prob) * 100, guaranteed: py > 0 && n >= py };
  }

  // Perbandingan 2 paket top-up: termurah per currency menang
  function topup(priceA, amountA, priceB, amountB) {
    assertNumber('Harga A', priceA);
    assertNumber('Isi A', amountA);
    assertNumber('Harga B', priceB);
    assertNumber('Isi B', amountB);
    if (priceA <= 0 || priceB <= 0) throw new Error('Harga harus lebih dari nol.');
    if (amountA <= 0 || amountB <= 0) throw new Error('Isi paket harus lebih dari nol.');
    var perA = priceA / amountA, perB = priceB / amountB;
    var winner = perA < perB ? 'A' : perB < perA ? 'B' : 'Seri';
    var saving = winner === 'Seri' ? 0 : (Math.max(perA, perB) - Math.min(perA, perB)) / Math.max(perA, perB) * 100;
    return { perA: perA, perB: perB, winner: winner, savingPct: saving };
  }

  window.SuperCalcModules.gaming = { edpi: edpi, gacha: gacha, topup: topup };
})();
