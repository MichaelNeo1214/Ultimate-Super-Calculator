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

  // Bunga Sederhana: I = P * r * t ; Total = P + I
  // ratePercent: % per tahun, timeYears: tahun
  function simpleInterest(principal, ratePercent, timeYears) {
    assertPositive('Modal awal (P)', principal);
    assertNonNegative('Suku bunga (r)', ratePercent);
    assertNonNegative('Waktu (t)', timeYears);
    var r = ratePercent / 100;
    var interest = principal * r * timeYears;
    var total = principal + interest;
    return { interest: interest, total: total, rateDecimal: r };
  }

  // Bunga Majemuk: A = P * (1 + r/n)^(n*t)
  // ratePercent: % per tahun, n: frekuensi kapitalisasi per tahun
  function compoundInterest(principal, ratePercent, timesPerYear, timeYears) {
    assertPositive('Modal awal (P)', principal);
    assertNonNegative('Suku bunga (r)', ratePercent);
    assertPositive('Frekuensi (n)', timesPerYear);
    assertNonNegative('Waktu (t)', timeYears);
    if (!Number.isInteger(timesPerYear)) throw new Error('Frekuensi (n) harus bilangan bulat (mis. 1, 4, 12).');
    if (timesPerYear > 365) throw new Error('Frekuensi (n) maksimal 365 (harian).');
    var r = ratePercent / 100;
    var amount = principal * Math.pow(1 + r / timesPerYear, timesPerYear * timeYears);
    if (!isFinite(amount)) throw new Error('Hasil terlalu besar (overflow). Kurangi input.');
    return { amount: amount, interest: amount - principal, rateDecimal: r };
  }

  // ROI: ((NilaiAkhir - Biaya) / Biaya) * 100%
  function roi(cost, finalValue) {
    assertPositive('Biaya investasi', cost);
    assertNumber('Nilai akhir', finalValue);
    if (finalValue < 0) throw new Error('Nilai akhir tidak boleh negatif.');
    var profit = finalValue - cost;
    var percent = (profit / cost) * 100;
    return { profit: profit, percent: percent, multiple: finalValue / cost };
  }

  // DCA Average Price: totalBiaya / totalQty dari 2 lot
  // qty1, price1, qty2, price2
  function dcaAverage(qty1, price1, qty2, price2) {
    assertPositive('Jumlah lot 1', qty1);
    assertNonNegative('Harga lot 1', price1);
    assertPositive('Jumlah lot 2', qty2);
    assertNonNegative('Harga lot 2', price2);
    var totalQty = qty1 + qty2;
    var totalCost = qty1 * price1 + qty2 * price2;
    var avg = totalCost / totalQty;
    return { averagePrice: avg, totalQty: totalQty, totalCost: totalCost };
  }

  // Mining profitability harian:
  // powerW: daya rig (Watt), tariffPerKwh: Rp/kWh, grossRevenuePerDay: Rp/hari (dari WhatToMine/pool)
  function miningProfit(powerW, tariffPerKwh, grossRevenuePerDay) {
    assertNumber('Daya (W)', powerW);
    assertNumber('Tarif listrik', tariffPerKwh);
    assertNumber('Pendapatan kotor', grossRevenuePerDay);
    if (powerW < 0) throw new Error('Daya tidak boleh negatif.');
    if (powerW > 100000) throw new Error('Daya tidak wajar (> 100 kW).');
    if (tariffPerKwh < 0) throw new Error('Tarif listrik tidak boleh negatif.');
    if (grossRevenuePerDay < 0) throw new Error('Pendapatan kotor tidak boleh negatif.');
    var kwhPerDay = (powerW * 24) / 1000;
    var costPerDay = kwhPerDay * tariffPerKwh;
    var netPerDay = grossRevenuePerDay - costPerDay;
    return { kwhPerDay: kwhPerDay, costPerDay: costPerDay, netPerDay: netPerDay, netPerMonth: netPerDay * 30, margin: grossRevenuePerDay > 0 ? (netPerDay / grossRevenuePerDay) * 100 : 0 };
  }

  window.SuperCalcModules.finance = {
    simpleInterest: simpleInterest,
    compoundInterest: compoundInterest,
    roi: roi,
    dcaAverage: dcaAverage,
    miningProfit: miningProfit
  };
})();
