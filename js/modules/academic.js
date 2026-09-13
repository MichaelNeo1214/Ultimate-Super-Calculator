(function () {
  'use strict';
  window.SuperCalcModules = window.SuperCalcModules || {};

  var GRADE_POINTS = { A: 4, AB: 3.5, B: 3, BC: 2.5, C: 2, D: 1, E: 0 };

  function gradePoint(grade) {
    var g = String(grade).toUpperCase();
    if (!(g in GRADE_POINTS)) throw new Error('Nilai "' + grade + '" tidak dikenal. Gunakan A, AB, B, BC, C, D, E.');
    return GRADE_POINTS[g];
  }

  // courses: [{sks, grade}] — minimal 1 MK valid
  function gpa(courses) {
    if (!Array.isArray(courses) || courses.length === 0) throw new Error('Data mata kuliah kosong.');
    var totalSks = 0, totalBobot = 0, detail = [];
    courses.forEach(function (c, i) {
      var sks = c.sks, grade = c.grade;
      if (typeof sks !== 'number' || isNaN(sks)) throw new Error('SKS MK-' + (i + 1) + ' harus berupa angka.');
      if (sks < 0 || sks > 12) throw new Error('SKS MK-' + (i + 1) + ' harus 0–12.');
      if (sks === 0) return; // MK dikosongkan / tidak diambil
      var point = gradePoint(grade);
      totalSks += sks;
      totalBobot += point * sks;
      detail.push({ sks: sks, grade: String(grade).toUpperCase(), point: point });
    });
    if (totalSks === 0) throw new Error('Isi minimal 1 mata kuliah (SKS > 0).');
    var ipk = totalBobot / totalSks;
    var predikat = ipk >= 3.5 ? 'Dengan Pujian (Cumlaude)' : ipk >= 3.0 ? 'Sangat Memuaskan' : ipk >= 2.5 ? 'Memuaskan' : ipk >= 2.0 ? 'Cukup' : 'Kurang';
    return { ipk: ipk, totalSks: totalSks, totalBobot: totalBobot, predikat: predikat, detail: detail };
  }

  // Skor seksi PBT: Listening 31–68, Structure 31–68, Reading 31–67
  function toeflPbt(listening, structure, reading) {
    [['Listening', listening, 31, 68], ['Structure', structure, 31, 68], ['Reading', reading, 31, 67]].forEach(function (t) {
      var name = t[0], v = t[1], lo = t[2], hi = t[3];
      if (typeof v !== 'number' || isNaN(v)) throw new Error('Skor ' + name + ' harus berupa angka.');
      if (Math.abs(v - Math.round(v)) > 1e-9) throw new Error('Skor ' + name + ' harus bilangan bulat.');
      if (v < lo || v > hi) throw new Error('Skor ' + name + ' harus ' + lo + '–' + hi + '.');
    });
    var total = Math.round((listening + structure + reading) * 10 / 3);
    var level = total >= 600 ? 'Sangat baik (umumnya lolos beasiswa S3/LPDP).' :
      total >= 550 ? 'Baik (umumnya lolos S2 dalam negeri).' :
      total >= 500 ? 'Menengah (cukup syarat wisuda banyak kampus).' :
      total >= 450 ? 'Dasar (perlu bimbingan intensif).' : 'Pemula (mulai dari fondasi).';
    return { total: total, level: level };
  }

  // subs: [{price, period: 'bulan'|'tahun'}] — dinormalisasi ke bulanan & tahunan
  function subscriptions(subs) {
    if (!Array.isArray(subs) || subs.length === 0) throw new Error('Data langganan kosong.');
    var perMonth = 0;
    var detail = subs.map(function (s, i) {
      if (typeof s.price !== 'number' || isNaN(s.price)) throw new Error('Harga langganan ke-' + (i + 1) + ' harus berupa angka.');
      if (s.price < 0) throw new Error('Harga langganan ke-' + (i + 1) + ' tidak boleh negatif.');
      if (s.price > 1e12) throw new Error('Harga langganan ke-' + (i + 1) + ' terlalu besar.');
      var monthly = s.period === 'tahun' ? s.price / 12 : s.price;
      perMonth += monthly;
      return { price: s.price, period: s.period, monthly: monthly };
    });
    return { perMonth: perMonth, perYear: perMonth * 12, count: detail.length, detail: detail };
  }

  window.SuperCalcModules.academic = {
    gpa: gpa,
    gradePoint: gradePoint,
    toeflPbt: toeflPbt,
    subscriptions: subscriptions
  };
})();
