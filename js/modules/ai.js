(function () {
  'use strict';
  window.SuperCalcModules = window.SuperCalcModules || {};

  function assertNumber(name, v) {
    if (typeof v !== 'number' || isNaN(v)) throw new Error(name + ' harus berupa angka.');
    if (!isFinite(v)) throw new Error(name + ' terlalu besar.');
  }

  // VRAM = params * (bits/8) byte * overhead ; hasil GiB/GB
  function llmVram(paramsB, bits, overhead) {
    assertNumber('Parameter', paramsB);
    assertNumber('Kuantisasi', bits);
    assertNumber('Overhead', overhead);
    if (paramsB <= 0) throw new Error('Parameter harus lebih dari nol.');
    if (paramsB > 10000) throw new Error('Parameter tidak wajar (> 10000 B).');
    if ([4, 8, 16, 32].indexOf(bits) === -1) throw new Error('Kuantisasi harus 4, 8, 16, atau 32 bit.');
    if (overhead < 1 || overhead > 3) throw new Error('Overhead harus antara 1,0–3,0 (cth: 1,2).');
    var weightsGB = (paramsB * 1e9 * (bits / 8)) / Math.pow(1024, 3);
    return { weightsGB: weightsGB, totalGB: weightsGB * overhead, bytesPerParam: bits / 8 };
  }

  function llmMaxParams(vramGB, bits, overhead) {
    assertNumber('VRAM', vramGB);
    if (vramGB <= 0) throw new Error('VRAM harus lebih dari nol.');
    if ([4, 8, 16, 32].indexOf(bits) === -1) throw new Error('Kuantisasi harus 4, 8, 16, atau 32 bit.');
    if (overhead < 1 || overhead > 3) throw new Error('Overhead harus antara 1,0–3,0.');
    return ((vramGB * Math.pow(1024, 3)) / overhead) / (bits / 8) / 1e9;
  }

  // Ukuran file GGUF ≈ params * bitsEfektif / 8.
  // bitsEfektif umum: Q2_K≈2.6, Q3_K≈3.5, Q4_K_M≈4.6, Q5_K_M≈5.4, Q6_K≈6.6, Q8_0=8.5, F16=16
  // Untuk kesederhanaan UI memakai pilihan bit bulat 2/3/4/5/6/8/16 (perkiraan).
  function ggufSize(paramsB, bits) {
    assertNumber('Parameter', paramsB);
    assertNumber('Kuantisasi', bits);
    if (paramsB <= 0) throw new Error('Parameter harus lebih dari nol.');
    if (paramsB > 10000) throw new Error('Parameter tidak wajar (> 10000 B).');
    if ([2, 3, 4, 5, 6, 8, 16].indexOf(bits) === -1) throw new Error('Kuantisasi GGUF harus 2, 3, 4, 5, 6, 8, atau 16 bit.');
    var bytes = paramsB * 1e9 * (bits / 8);
    return {
      bytes: bytes,
      gbDecimal: bytes / 1e9,
      gib: bytes / Math.pow(1024, 3),
      ramNeeded: (bytes * 1.3) / Math.pow(1024, 3)
    };
  }

  window.SuperCalcModules.ai = {
    llmVram: llmVram,
    llmMaxParams: llmMaxParams,
    ggufSize: ggufSize
  };
})();
