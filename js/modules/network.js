(function () {
  'use strict';
  window.SuperCalcModules = window.SuperCalcModules || {};

  function assertNumber(name, v) {
    if (typeof v !== 'number' || isNaN(v)) throw new Error(name + ' harus berupa angka.');
    if (!isFinite(v)) throw new Error(name + ' terlalu besar.');
  }

  // ---- Subnetting ----
  // prefix: 0..32. Returns { total, usable, mask, wildcard, bitsHost }
  function subnetInfo(prefix) {
    assertNumber('Prefix CIDR', prefix);
    if (Math.abs(prefix - Math.round(prefix)) > 1e-9) throw new Error('Prefix CIDR harus bilangan bulat 0–32.');
    var p = Math.round(prefix);
    if (p < 0 || p > 32) throw new Error('Prefix CIDR harus antara 0–32 (cth: 24).');
    var hostBits = 32 - p;
    var total = Math.pow(2, hostBits);
    var usable;
    if (p === 32) usable = 1;       // single host route
    else if (p === 31) usable = 2;  // RFC 3021 point-to-point
    else usable = Math.max(total - 2, 0);
    var maskInt = p === 0 ? 0 : (Math.pow(2, 32) - Math.pow(2, hostBits));
    function intToIp(n) {
      return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
    }
    var mask = intToIp(maskInt >>> 0);
    var wildcard = intToIp((~maskInt) >>> 0);
    return { prefix: p, hostBits: hostBits, total: total, usable: usable, mask: mask, wildcard: wildcard };
  }

  // ---- Download time ----
  // fileSizeMB: megabyte (MB), speedMbps: megabit per detik
  // returns { seconds }
  function downloadTime(fileSizeMB, speedMbps) {
    assertNumber('Ukuran file', fileSizeMB);
    assertNumber('Kecepatan', speedMbps);
    if (fileSizeMB <= 0) throw new Error('Ukuran file harus lebih dari nol.');
    if (speedMbps <= 0) throw new Error('Kecepatan harus lebih dari nol.');
    if (fileSizeMB > 1e9) throw new Error('Ukuran file terlalu besar.');
    var seconds = (fileSizeMB * 8) / speedMbps;
    if (!isFinite(seconds)) throw new Error('Hasil tidak terhingga.');
    return { seconds: seconds };
  }

  function formatDuration(totalSeconds) {
    var s = Math.round(totalSeconds);
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;
    var parts = [];
    if (h > 0) parts.push(h + ' jam');
    if (m > 0) parts.push(m + ' mnt');
    parts.push(sec + ' dtk');
    return parts.join(' ');
  }

  // ---- LLM VRAM estimator ----
  // paramsB: miliar parameter, bits: 4/8/16/32, overhead: pengali (mis 1.2 = +20%)
  // returns { weightsGB, totalGB }
  function llmVram(paramsB, bits, overhead) {
    assertNumber('Parameter', paramsB);
    assertNumber('Kuantisasi', bits);
    assertNumber('Overhead', overhead);
    if (paramsB <= 0) throw new Error('Parameter harus lebih dari nol.');
    if (paramsB > 10000) throw new Error('Parameter tidak wajar (> 10000 B).');
    if ([4, 8, 16, 32].indexOf(bits) === -1) throw new Error('Kuantisasi harus 4, 8, 16, atau 32 bit.');
    if (overhead < 1 || overhead > 3) throw new Error('Overhead harus antara 1,0–3,0 (cth: 1,2).');
    var bytesPerParam = bits / 8;
    var weightsBytes = paramsB * 1e9 * bytesPerParam;
    var weightsGB = weightsBytes / Math.pow(1024, 3);
    var totalGB = weightsGB * overhead;
    return { weightsGB: weightsGB, totalGB: totalGB, bytesPerParam: bytesPerParam };
  }

  // Estimasi kebalikannya: max parameter (B) yang muat di vramGB
  function llmMaxParams(vramGB, bits, overhead) {
    assertNumber('VRAM', vramGB);
    if (vramGB <= 0) throw new Error('VRAM harus lebih dari nol.');
    if ([4, 8, 16, 32].indexOf(bits) === -1) throw new Error('Kuantisasi harus 4, 8, 16, atau 32 bit.');
    if (overhead < 1 || overhead > 3) throw new Error('Overhead harus antara 1,0–3,0.');
    var usableBytes = (vramGB * Math.pow(1024, 3)) / overhead;
    return usableBytes / (bits / 8) / 1e9;
  }

  // ---- Bandwidth usage server ----
  // pageMB: rata-rata ukuran response/halaman (MB), visitsPerDay: kunjungan/hari
  // returns { dailyGB, monthlyGB, avgMbps }
  function bandwidthUsage(pageMB, visitsPerDay) {
    assertNumber('Ukuran halaman', pageMB);
    assertNumber('Kunjungan/hari', visitsPerDay);
    if (pageMB <= 0) throw new Error('Ukuran halaman harus lebih dari nol.');
    if (visitsPerDay < 0) throw new Error('Kunjungan tidak boleh negatif.');
    if (pageMB > 10000) throw new Error('Ukuran halaman tidak wajar (> 10 GB).');
    if (visitsPerDay > 1e10) throw new Error('Kunjungan terlalu besar.');
    var dailyMB = pageMB * visitsPerDay;
    var dailyGB = dailyMB / 1024;
    var monthlyGB = dailyGB * 30;
    var avgMbps = (dailyGB * 8 * 1024) / 86400;
    return { dailyMB: dailyMB, dailyGB: dailyGB, monthlyGB: monthlyGB, avgMbps: avgMbps };
  }

  // ---- Minecraft Server RAM estimator ----
  // players: slot/pemain bersamaan, mods: jumlah mod/plugin berat
  // Heuristik: base 1.5 GB + 0.08 GB/pemain + 0.12 GB/mod, min 2 GB
  function minecraftRam(players, mods) {
    assertNumber('Pemain', players);
    assertNumber('Mod', mods);
    if (Math.abs(players - Math.round(players)) > 1e-9) throw new Error('Jumlah pemain harus bilangan bulat.');
    if (Math.abs(mods - Math.round(mods)) > 1e-9) throw new Error('Jumlah mod harus bilangan bulat.');
    var p = Math.round(players), m = Math.round(mods);
    if (p < 0 || p > 1000) throw new Error('Pemain harus 0–1000.');
    if (m < 0 || m > 500) throw new Error('Mod harus 0–500.');
    var raw = 1.5 + p * 0.08 + m * 0.12;
    var need = Math.max(raw, 2);
    var rounded = Math.ceil(need * 2) / 2; // kelipatan 0.5 GB
    var plan = rounded <= 2 ? 'Paket 2 GB cukup (vanilla / sedikit pemain).' :
      rounded <= 4 ? 'Ambil paket 4 GB (komunitas kecil-menengah).' :
      rounded <= 8 ? 'Ambil paket 8 GB (banyak pemain/mod).' :
      rounded <= 16 ? 'Ambil paket 12–16 GB (server besar / modpack).' :
      'Pertimbangkan dedicated / split server (lobby + survival).';
    return { rawGB: need, recommendedGB: rounded, plan: plan };
  }

  window.SuperCalcModules.network = {
    subnetInfo: subnetInfo,
    downloadTime: downloadTime,
    formatDuration: formatDuration,
    llmVram: llmVram,
    llmMaxParams: llmMaxParams,
    bandwidthUsage: bandwidthUsage,
    minecraftRam: minecraftRam
  };
})();
