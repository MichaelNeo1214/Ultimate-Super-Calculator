(function () {
  'use strict';

  /* ---------- Helpers ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function formatNumber(n, maxDec) {
    if (typeof n !== 'number' || isNaN(n)) return '—';
    if (!isFinite(n)) return 'Tak hingga';
    var dec = (maxDec === undefined) ? 6 : maxDec;
    var abs = Math.abs(n);
    if (abs !== 0 && (abs >= 1e12 || abs < 1e-6)) return n.toExponential(4).replace('.', ',');
    var fixed = parseFloat(n.toFixed(dec));
    return fixed.toLocaleString('id-ID', { maximumFractionDigits: dec });
  }
  function formatInt(n) {
    if (typeof n !== 'number' || isNaN(n) || !isFinite(n)) return '—';
    return Math.round(n).toLocaleString('id-ID');
  }
  function formatCurrency(n) {
    if (typeof n !== 'number' || !isFinite(n)) return '—';
    return 'Rp ' + Math.round(n).toLocaleString('id-ID');
  }
  function parseInput(val) {
    if (val === null || val === undefined) return NaN;
    var s = String(val).trim().replace(/\s/g, '').replace(/,/g, '.');
    if (s === '' || s === '-' || s === '.' || s === '+') return NaN;
    return Number(s);
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function getModules() { return window.SuperCalcModules || {}; }

  /* ---------- State ---------- */
  var state = { category: 'basic', formulaId: null, angleUnit: 'deg', history: [] };
  try {
    var saved = localStorage.getItem('supercalc_history_v1');
    if (saved) state.history = JSON.parse(saved) || [];
  } catch (e) { state.history = []; }
  function saveHistory() {
    try { localStorage.setItem('supercalc_history_v1', JSON.stringify(state.history.slice(0, 30))); } catch (e) {}
  }
  function pushHistory(entry) {
    state.history.unshift({ t: new Date().toLocaleString('id-ID'), text: entry });
    state.history = state.history.slice(0, 30);
    saveHistory();
    renderHistory();
  }

  function gradeOpts(def) {
    return [{ value: 'A', label: 'A (4,0)' }, { value: 'AB', label: 'AB (3,5)' }, { value: 'B', label: 'B (3,0)' }, { value: 'BC', label: 'BC (2,5)' }, { value: 'C', label: 'C (2,0)' }, { value: 'D', label: 'D (1,0)' }, { value: 'E', label: 'E (0)' }].map(function (o) {
      return '<option value="' + o.value + '"' + (String(def) === o.value ? ' selected' : '') + '>' + o.label + '</option>';
    }).join('');
  }

  /* ============================================================
   * REGISTRY RUMUS
   * ============================================================ */
  var FORMULAS = {
    geometry: [
      { id: 'square', name: 'Persegi — Luas', formula: 'L = s × s', desc: 'Luas persegi dari panjang sisi.',
        inputs: [{ key: 'sisi', label: 'Sisi (s)', unit: 'cm', placeholder: 'cth: 5' }],
        compute: function (v) {
          var m = getModules().geometry;
          var h = m.squareArea(v.sisi);
          return { main: formatNumber(h), unit: 'cm²', steps: ['L = s × s', 'L = ' + formatNumber(v.sisi) + ' × ' + formatNumber(v.sisi), 'L = ' + formatNumber(h) + ' cm²'], extras: [{ label: 'Keliling', value: formatNumber(m.squarePerimeter(v.sisi)) + ' cm' }] };
        } },
      { id: 'rectangle', name: 'Persegi Panjang — Luas', formula: 'L = p × l', desc: 'Luas persegi panjang dari panjang dan lebar.',
        inputs: [{ key: 'panjang', label: 'Panjang (p)', unit: 'cm', placeholder: 'cth: 8' }, { key: 'lebar', label: 'Lebar (l)', unit: 'cm', placeholder: 'cth: 5' }],
        compute: function (v) {
          var h = getModules().geometry.rectangleArea(v.panjang, v.lebar);
          return { main: formatNumber(h), unit: 'cm²', steps: ['L = p × l', 'L = ' + formatNumber(v.panjang) + ' × ' + formatNumber(v.lebar), 'L = ' + formatNumber(h) + ' cm²'], extras: [] };
        } },
      { id: 'triangle', name: 'Segitiga — Luas', formula: 'L = ½ × a × t', desc: 'Luas segitiga dari alas dan tinggi.',
        inputs: [{ key: 'alas', label: 'Alas (a)', unit: 'cm', placeholder: 'cth: 6' }, { key: 'tinggi', label: 'Tinggi (t)', unit: 'cm', placeholder: 'cth: 4' }],
        compute: function (v) {
          var h = getModules().geometry.triangleArea(v.alas, v.tinggi);
          return { main: formatNumber(h), unit: 'cm²', steps: ['L = ½ × a × t', 'L = ½ × ' + formatNumber(v.alas) + ' × ' + formatNumber(v.tinggi), 'L = ' + formatNumber(h) + ' cm²'], extras: [] };
        } },
      { id: 'circle', name: 'Lingkaran — Luas', formula: 'L = π × r²', desc: 'Luas lingkaran dari jari-jari.',
        inputs: [{ key: 'jari', label: 'Jari-jari (r)', unit: 'cm', placeholder: 'cth: 7' }],
        compute: function (v) {
          var m = getModules().geometry;
          var h = m.circleArea(v.jari);
          return { main: formatNumber(h), unit: 'cm²', steps: ['L = π × r²', 'L = 3,14159 × ' + formatNumber(v.jari) + '²', 'L = ' + formatNumber(h) + ' cm²'], extras: [{ label: 'Keliling', value: formatNumber(m.circleCircumference(v.jari)) + ' cm' }] };
        } },
      { id: 'cube', name: 'Kubus — Volume', formula: 'V = s³', desc: 'Volume kubus dari panjang sisi.',
        inputs: [{ key: 'sisi', label: 'Sisi (s)', unit: 'cm', placeholder: 'cth: 4' }],
        compute: function (v) {
          var m = getModules().geometry;
          var h = m.cubeVolume(v.sisi);
          return { main: formatNumber(h), unit: 'cm³', steps: ['V = s³', 'V = ' + formatNumber(v.sisi) + '³', 'V = ' + formatNumber(h) + ' cm³'], extras: [{ label: 'Luas permukaan', value: formatNumber(m.cubeSurface(v.sisi)) + ' cm²' }] };
        } },
      { id: 'sphere', name: 'Bola — Volume', formula: 'V = ⁴⁄₃ × π × r³', desc: 'Volume bola dari jari-jari.',
        inputs: [{ key: 'jari', label: 'Jari-jari (r)', unit: 'cm', placeholder: 'cth: 5' }],
        compute: function (v) {
          var m = getModules().geometry;
          var h = m.sphereVolume(v.jari);
          return { main: formatNumber(h), unit: 'cm³', steps: ['V = ⁴⁄₃ × π × r³', 'V = ⁴⁄₃ × π × ' + formatNumber(v.jari) + '³', 'V = ' + formatNumber(h) + ' cm³'], extras: [{ label: 'Luas permukaan', value: formatNumber(m.sphereSurface(v.jari)) + ' cm²' }] };
        } },
      { id: 'cylinder', name: 'Tabung — Volume', formula: 'V = π × r² × t', desc: 'Volume tabung dari jari-jari dan tinggi.',
        inputs: [{ key: 'jari', label: 'Jari-jari (r)', unit: 'cm', placeholder: 'cth: 3' }, { key: 'tinggi', label: 'Tinggi (t)', unit: 'cm', placeholder: 'cth: 10' }],
        compute: function (v) {
          var m = getModules().geometry;
          var h = m.cylinderVolume(v.jari, v.tinggi);
          return { main: formatNumber(h), unit: 'cm³', steps: ['V = π × r² × t', 'V = π × ' + formatNumber(v.jari) + '² × ' + formatNumber(v.tinggi), 'V = ' + formatNumber(h) + ' cm³'], extras: [{ label: 'Luas permukaan', value: formatNumber(m.cylinderSurface(v.jari, v.tinggi)) + ' cm²' }] };
        } }
    ],

    physics: [
      { id: 'speed', name: 'Kecepatan', formula: 'v = s ÷ t', desc: 'Kecepatan rata-rata. s = jarak (m), t = waktu (s).',
        inputs: [{ key: 'jarak', label: 'Jarak (s)', unit: 'm', placeholder: 'cth: 100' }, { key: 'waktu', label: 'Waktu (t)', unit: 's', placeholder: 'cth: 20' }],
        compute: function (v) {
          var h = getModules().physics.speed(v.jarak, v.waktu);
          return { main: formatNumber(h), unit: 'm/s', steps: ['v = s ÷ t', 'v = ' + formatNumber(v.jarak) + ' ÷ ' + formatNumber(v.waktu), 'v = ' + formatNumber(h) + ' m/s'], extras: [{ label: 'Dalam km/jam', value: formatNumber(h * 3.6) + ' km/jam' }] };
        } },
      { id: 'force', name: 'Gaya', formula: 'F = m × a', desc: 'Hukum II Newton. m = massa (kg), a = percepatan (m/s²).',
        inputs: [{ key: 'massa', label: 'Massa (m)', unit: 'kg', placeholder: 'cth: 10' }, { key: 'percepatan', label: 'Percepatan (a)', unit: 'm/s²', placeholder: 'cth: 9,8' }],
        compute: function (v) {
          var h = getModules().physics.force(v.massa, v.percepatan);
          return { main: formatNumber(h), unit: 'N (Newton)', steps: ['F = m × a', 'F = ' + formatNumber(v.massa) + ' × ' + formatNumber(v.percepatan), 'F = ' + formatNumber(h) + ' N'], extras: [] };
        } },
      { id: 'density', name: 'Massa Jenis', formula: 'ρ = m ÷ V', desc: 'Massa jenis. m = massa (kg), V = volume (m³).',
        inputs: [{ key: 'massa', label: 'Massa (m)', unit: 'kg', placeholder: 'cth: 5' }, { key: 'volume', label: 'Volume (V)', unit: 'm³', placeholder: 'cth: 2' }],
        compute: function (v) {
          var h = getModules().physics.density(v.massa, v.volume);
          return { main: formatNumber(h), unit: 'kg/m³', steps: ['ρ = m ÷ V', 'ρ = ' + formatNumber(v.massa) + ' ÷ ' + formatNumber(v.volume), 'ρ = ' + formatNumber(h) + ' kg/m³'], extras: [{ label: 'Dalam g/cm³', value: formatNumber(h / 1000) + ' g/cm³' }] };
        } }
    ],

    finance: [
      { id: 'simple', name: 'Bunga Sederhana', formula: 'I = P × r × t', desc: 'Bunga tunggal. P = modal (Rp), r = %/tahun, t = tahun.',
        inputs: [{ key: 'modal', label: 'Modal awal (P)', unit: 'Rp', placeholder: 'cth: 1000000' }, { key: 'bunga', label: 'Suku bunga (r)', unit: '%/thn', placeholder: 'cth: 5' }, { key: 'waktu', label: 'Waktu (t)', unit: 'thn', placeholder: 'cth: 2' }],
        compute: function (v) {
          var r = getModules().finance.simpleInterest(v.modal, v.bunga, v.waktu);
          return { main: formatCurrency(r.total), unit: 'total akhir', steps: ['I = P × r × t', 'I = ' + formatCurrency(v.modal) + ' × ' + formatNumber(v.bunga) + '% × ' + formatNumber(v.waktu), 'I = ' + formatCurrency(r.interest), 'Total = ' + formatCurrency(r.total)], extras: [{ label: 'Bunga (I)', value: formatCurrency(r.interest) }] };
        } },
      { id: 'compound', name: 'Bunga Majemuk', formula: 'A = P × (1 + r/n)^(n×t)', desc: 'Bunga berbunga. n = frekuensi kapitalisasi per tahun.',
        inputs: [{ key: 'modal', label: 'Modal awal (P)', unit: 'Rp', placeholder: 'cth: 1000000' }, { key: 'bunga', label: 'Suku bunga (r)', unit: '%/thn', placeholder: 'cth: 5' }, { key: 'frekuensi', label: 'Frekuensi (n)', unit: '×/thn', placeholder: 'cth: 12' }, { key: 'waktu', label: 'Waktu (t)', unit: 'thn', placeholder: 'cth: 2' }],
        compute: function (v) {
          var r = getModules().finance.compoundInterest(v.modal, v.bunga, Math.round(v.frekuensi), v.waktu);
          return { main: formatCurrency(r.amount), unit: 'total akhir', steps: ['A = P × (1 + r/n)^(n×t)', 'A = ' + formatCurrency(r.amount)], extras: [{ label: 'Bunga diperoleh', value: formatCurrency(r.interest) }] };
        } },
      { id: 'roi', name: 'ROI', formula: 'ROI = (Akhir − Biaya) ÷ Biaya × 100%', desc: 'Imbal hasil investasi (saham/kripto).',
        inputs: [{ key: 'biaya', label: 'Biaya investasi', unit: 'Rp', placeholder: 'cth: 5000000' }, { key: 'akhir', label: 'Nilai akhir', unit: 'Rp', placeholder: 'cth: 6500000' }],
        compute: function (v) {
          var r = getModules().finance.roi(v.biaya, v.akhir);
          return { main: formatNumber(r.percent, 2) + ' %', unit: (r.profit >= 0 ? 'untung ' : 'rugi ') + formatCurrency(Math.abs(r.profit)), steps: ['ROI = (Akhir − Biaya) ÷ Biaya × 100%', 'ROI = ' + formatNumber(r.percent, 2) + ' %'], extras: [{ label: 'Kelipatan', value: formatNumber(r.multiple, 4) + '×' }], badgeColor: r.profit >= 0 ? 'green' : 'red' };
        } },
      { id: 'dca', name: 'DCA — Harga Rata-rata', formula: 'Avg = Total Biaya ÷ Total Qty', desc: 'Rata-rata pembelian bertahap (saham/kripto).',
        inputs: [{ key: 'qty1', label: 'Jumlah lot 1', unit: 'qty', placeholder: 'cth: 2' }, { key: 'harga1', label: 'Harga lot 1', unit: '@/qty', placeholder: 'cth: 50000' }, { key: 'qty2', label: 'Jumlah lot 2', unit: 'qty', placeholder: 'cth: 3' }, { key: 'harga2', label: 'Harga lot 2', unit: '@/qty', placeholder: 'cth: 40000' }],
        compute: function (v) {
          var r = getModules().finance.dcaAverage(v.qty1, v.harga1, v.qty2, v.harga2);
          return { main: formatNumber(r.averagePrice, 4), unit: 'rata-rata per qty', steps: ['Total = ' + formatNumber(r.totalCost, 2), 'Avg = ' + formatNumber(r.totalCost, 2) + ' ÷ ' + formatNumber(r.totalQty) + ' = ' + formatNumber(r.averagePrice, 4)], extras: [{ label: 'Total qty', value: formatNumber(r.totalQty) }, { label: 'Total biaya', value: formatNumber(r.totalCost, 2) }] };
        } },
      { id: 'mining', name: 'Mining Profitability', formula: 'Net/hari = Revenue − (Watt×24/1000×Tarif)', desc: 'Profitabilitas mining: hashrate sebagai info, hitung dari daya vs tarif vs revenue harian (cek WhatToMine/pool).',
        inputs: [
          { key: 'hash', label: 'Hashrate rig', unit: 'MH/s', placeholder: 'cth: 120' },
          { key: 'daya', label: 'Daya rig', unit: 'W', placeholder: 'cth: 350' },
          { key: 'tarif', label: 'Tarif listrik', unit: 'Rp/kWh', placeholder: 'cth: 1700' },
          { key: 'revenue', label: 'Revenue kotor/hari', unit: 'Rp', placeholder: 'cth: 25000' }
        ],
        compute: function (v) {
          var r = getModules().finance.miningProfit(v.daya, v.tarif, v.revenue);
          return { main: formatCurrency(r.netPerDay), unit: 'net per hari @ ' + formatNumber(v.hash) + ' MH/s', steps: ['kWh/hari = ' + formatNumber(v.daya) + ' × 24 / 1000 = ' + formatNumber(r.kwhPerDay, 3) + ' kWh', 'Biaya/hari = ' + formatNumber(r.kwhPerDay, 3) + ' × ' + formatCurrency(v.tarif) + ' = ' + formatCurrency(r.costPerDay), 'Net = ' + formatCurrency(v.revenue) + ' − ' + formatCurrency(r.costPerDay) + ' = ' + formatCurrency(r.netPerDay)], extras: [{ label: 'Biaya listrik/hari', value: formatCurrency(r.costPerDay) }, { label: 'Net/bulan (×30)', value: formatCurrency(r.netPerMonth) }, { label: 'Margin', value: formatNumber(r.margin, 1) + ' %' }], badgeColor: r.netPerDay >= 0 ? 'green' : 'red' };
        } }
    ],

    health: [
      { id: 'bmi', name: 'BMI (IMT)', formula: 'BMI = BB ÷ TB²', desc: 'BB = berat (kg), TB = tinggi (m). Tinggi diisi cm.',
        inputs: [{ key: 'berat', label: 'Berat badan (BB)', unit: 'kg', placeholder: 'cth: 65' }, { key: 'tinggi', label: 'Tinggi badan (TB)', unit: 'cm', placeholder: 'cth: 170' }],
        compute: function (v) {
          var m = getModules().health;
          var nilai = m.bmi(v.berat, v.tinggi);
          var kat = m.bmiCategory(nilai);
          var range = m.healthyWeightRange(v.tinggi);
          return { main: formatNumber(nilai, 2), unit: 'kg/m² — ' + kat.label, steps: ['BMI = ' + formatNumber(v.berat) + ' ÷ ' + formatNumber(v.tinggi / 100, 3) + '² = ' + formatNumber(nilai, 2)], extras: [{ label: 'Kategori', value: kat.label }, { label: 'Berat ideal', value: formatNumber(range.min, 1) + ' – ' + formatNumber(range.max, 1) + ' kg' }, { label: 'Saran', value: kat.advice }], badgeColor: kat.color };
        } }
    ],

    network: [
      { id: 'subnet', name: 'Subnetting — Host Valid', formula: 'Host = 2^(32−prefix) − 2', desc: 'Host IPv4 dari prefix CIDR. /31 = 2 (RFC 3021), /32 = 1.',
        inputs: [{ key: 'prefix', label: 'Prefix CIDR', unit: '/xx', placeholder: 'cth: 24' }],
        compute: function (v) {
          var info = getModules().network.subnetInfo(Math.round(v.prefix));
          return { main: formatInt(info.usable), unit: 'host valid (/' + info.prefix + ')', steps: ['Host bit = ' + info.hostBits, 'Total = ' + formatInt(info.total), 'Valid = ' + formatInt(info.usable)], extras: [{ label: 'Subnet mask', value: info.mask }, { label: 'Wildcard', value: info.wildcard }] };
        } },
      { id: 'download', name: 'Waktu Download', formula: 't = (Ukuran × 8) ÷ Kecepatan', desc: '1 Byte = 8 bit.',
        inputs: [
          { key: 'ukuran', label: 'Ukuran file', unit: 'angka', placeholder: 'cth: 1500' },
          { key: 'satuanUkuran', label: 'Satuan ukuran', unit: '', type: 'select', options: [{ value: 'MB', label: 'MB' }, { value: 'GB', label: 'GB' }], defaultValue: 'MB' },
          { key: 'cepat', label: 'Kecepatan', unit: 'angka', placeholder: 'cth: 50' },
          { key: 'satuanCepat', label: 'Satuan kecepatan', unit: '', type: 'select', options: [{ value: 'Mbps', label: 'Mbps' }, { value: 'Gbps', label: 'Gbps' }], defaultValue: 'Mbps' }
        ],
        compute: function (v) {
          var net = getModules().network;
          var mb = v.satuanUkuran === 'GB' ? v.ukuran * 1024 : v.ukuran;
          var mbps = v.satuanCepat === 'Gbps' ? v.cepat * 1000 : v.cepat;
          var r = net.downloadTime(mb, mbps);
          return { main: net.formatDuration(r.seconds), unit: formatNumber(r.seconds, 1) + ' detik', steps: ['Ukuran = ' + formatInt(mb) + ' MB, Kec = ' + formatInt(mbps) + ' Mbps', 't = ' + formatNumber(r.seconds, 1) + ' detik'], extras: [{ label: 'Menit', value: formatNumber(r.seconds / 60, 2) }, { label: 'Jam', value: formatNumber(r.seconds / 3600, 3) }] };
        } },
      { id: 'bandwidth', name: 'Bandwidth Server', formula: 'Bulanan = Ukuran × Kunjungan × 30', desc: 'Estimasi trafik server web/API per bulan.',
        inputs: [{ key: 'page', label: 'Ukuran per request', unit: 'MB', placeholder: 'cth: 2' }, { key: 'visit', label: 'Kunjungan per hari', unit: '/hari', placeholder: 'cth: 10000' }],
        compute: function (v) {
          var r = getModules().network.bandwidthUsage(v.page, v.visit);
          return { main: formatNumber(r.monthlyGB, 2) + ' GB', unit: 'per bulan', steps: ['Harian = ' + formatNumber(v.page) + ' × ' + formatInt(v.visit) + ' = ' + formatNumber(r.dailyGB, 2) + ' GB', 'Bulanan = × 30 = ' + formatNumber(r.monthlyGB, 2) + ' GB'], extras: [{ label: 'Harian', value: formatNumber(r.dailyGB, 2) + ' GB' }, { label: 'Rata-rata', value: formatNumber(r.avgMbps, 2) + ' Mbps' }] };
        } },
      { id: 'mcram', name: 'RAM Server Minecraft', formula: 'RAM ≈ 1,5 + 0,08×pemain + 0,12×mod', desc: 'Heuristik RAM Paper/Spigot. Hasil dibulatkan ke 0,5 GB.',
        inputs: [{ key: 'pemain', label: 'Pemain bersamaan', unit: 'org', placeholder: 'cth: 20' }, { key: 'mod', label: 'Mod/plugin berat', unit: 'pcs', placeholder: 'cth: 30' }],
        compute: function (v) {
          var r = getModules().network.minecraftRam(Math.round(v.pemain), Math.round(v.mod));
          return { main: formatNumber(r.recommendedGB, 1) + ' GB', unit: 'paket disarankan', steps: ['Kebutuhan mentah = ' + formatNumber(r.rawGB, 2) + ' GB', 'Rekomendasi = ' + formatNumber(r.recommendedGB, 1) + ' GB'], extras: [{ label: 'Saran', value: r.plan }, { label: 'Flag JVM', value: '-Xms' + r.recommendedGB + 'G -Xmx' + r.recommendedGB + 'G' }] };
        } }
    ],

    ai: [
      { id: 'vram', name: 'VRAM LLM', formula: 'VRAM ≈ Param × bit/8 × overhead', desc: 'Kebutuhan GPU untuk inference. Overhead 1,2 default.',
        inputs: [
          { key: 'param', label: 'Parameter model', unit: 'B', placeholder: 'cth: 7' },
          { key: 'bits', label: 'Kuantisasi', unit: 'bit', type: 'select', options: [{ value: '4', label: '4-bit (QLoRA)' }, { value: '8', label: '8-bit' }, { value: '16', label: '16-bit (FP16)' }, { value: '32', label: '32-bit (FP32)' }], defaultValue: '4' },
          { key: 'overhead', label: 'Overhead', unit: '×', placeholder: 'cth: 1,2', defaultValue: '1.2' }
        ],
        compute: function (v) {
          var ai = getModules().ai;
          var r = ai.llmVram(v.param, parseInt(v.bits, 10), v.overhead);
          var saran = r.totalGB <= 8 ? 'Muat di 8 GB.' : r.totalGB <= 12 ? 'Butuh ≥ 12 GB.' : r.totalGB <= 24 ? 'Butuh ≥ 24 GB.' : 'Butuh datacenter/multi-GPU.';
          return { main: formatNumber(r.totalGB, 2) + ' GB', unit: 'VRAM', steps: ['Bobot = ' + formatNumber(r.weightsGB, 2) + ' GiB', 'Total = × ' + formatNumber(v.overhead) + ' = ' + formatNumber(r.totalGB, 2) + ' GB'], extras: [{ label: 'Bobot saja', value: formatNumber(r.weightsGB, 2) + ' GiB' }, { label: 'Saran', value: saran }] };
        } },
      { id: 'gguf', name: 'Ukuran File GGUF', formula: 'Size ≈ Param × bit/8', desc: 'Estimasi file GGUF (llama.cpp/Ollama). RAM ≈ size × 1,3.',
        inputs: [
          { key: 'param', label: 'Parameter model', unit: 'B', placeholder: 'cth: 8' },
          { key: 'bits', label: 'Kuantisasi GGUF', unit: 'bit', type: 'select', options: [{ value: '2', label: 'Q2_K (~2 bit)' }, { value: '3', label: 'Q3_K (~3 bit)' }, { value: '4', label: 'Q4_K_M (~4 bit)' }, { value: '5', label: 'Q5_K_M (~5 bit)' }, { value: '6', label: 'Q6_K (~6 bit)' }, { value: '8', label: 'Q8_0 (~8 bit)' }, { value: '16', label: 'F16 (16 bit)' }], defaultValue: '4' }
        ],
        compute: function (v) {
          var r = getModules().ai.ggufSize(v.param, parseInt(v.bits, 10));
          return { main: formatNumber(r.gib, 2) + ' GiB', unit: '(' + formatNumber(r.gbDecimal, 2) + ' GB)', steps: ['Size = ' + formatNumber(v.param) + 'B × ' + v.bits + '/8 = ' + formatNumber(r.gib, 2) + ' GiB'], extras: [{ label: 'RAM saran', value: formatNumber(r.ramNeeded, 2) + ' GiB' }, { label: 'Bytes', value: formatInt(r.bytes) + ' B' }] };
        } }
    ],

    civil: [
      { id: 'debit', name: 'Debit Air', formula: 'Q = A × v', desc: 'A = luas penampang (m²), v = kecepatan (m/s).',
        inputs: [{ key: 'luas', label: 'Luas penampang (A)', unit: 'm²', placeholder: 'cth: 0,5' }, { key: 'cepat', label: 'Kecepatan (v)', unit: 'm/s', placeholder: 'cth: 2' }],
        compute: function (v) {
          var q = getModules().civil.discharge(v.luas, v.cepat);
          return { main: formatNumber(q), unit: 'm³/s', steps: ['Q = ' + formatNumber(v.luas) + ' × ' + formatNumber(v.cepat) + ' = ' + formatNumber(q) + ' m³/s'], extras: [{ label: 'L/detik', value: formatNumber(q * 1000) + ' L/s' }, { label: 'L/menit', value: formatNumber(q * 60000) + ' L/mnt' }] };
        } },
      { id: 'hidrostatis', name: 'Tekanan Hidrostatis', formula: 'P = ρ × g × h', desc: 'ρ (kg/m³), g gravitasi, h kedalaman (m).',
        inputs: [{ key: 'rho', label: 'Massa jenis (ρ)', unit: 'kg/m³', placeholder: 'cth: 1000', defaultValue: '1000' }, { key: 'grav', label: 'Gravitasi (g)', unit: 'm/s²', placeholder: 'cth: 9,81', defaultValue: '9.81' }, { key: 'kedalaman', label: 'Kedalaman (h)', unit: 'm', placeholder: 'cth: 10' }],
        compute: function (v) {
          var p = getModules().civil.hydrostaticPressure(v.rho, v.grav, v.kedalaman);
          return { main: formatNumber(p), unit: 'Pa', steps: ['P = ' + formatNumber(v.rho) + ' × ' + formatNumber(v.grav) + ' × ' + formatNumber(v.kedalaman) + ' = ' + formatNumber(p) + ' Pa'], extras: [{ label: 'kPa', value: formatNumber(p / 1000) }, { label: 'bar', value: formatNumber(p / 100000, 4) }] };
        } }
    ],

    automotive: [
      { id: 'cc', name: 'Kapasitas Mesin (CC)', formula: 'V = π/4 × bore² × stroke × n', desc: 'Bore & stroke mm, n = silinder.',
        inputs: [{ key: 'bore', label: 'Bore', unit: 'mm', placeholder: 'cth: 57,3' }, { key: 'stroke', label: 'Stroke', unit: 'mm', placeholder: 'cth: 57,9' }, { key: 'silinder', label: 'Silinder', unit: 'pcs', placeholder: 'cth: 1', defaultValue: '1' }],
        compute: function (v) {
          var r = getModules().automotive.engineDisplacement(v.bore, v.stroke, Math.round(v.silinder));
          return { main: formatNumber(r.cc, 1) + ' cc', unit: formatNumber(r.liters, 3) + ' L', steps: ['V = ' + formatNumber(r.cc, 1) + ' cc'], extras: [{ label: 'Per silinder', value: formatNumber(r.perCylinder, 1) + ' cc' }] };
        } },
      { id: 'gear', name: 'Final Gear Ratio', formula: 'Rasio = driven ÷ drive', desc: 'Gir motor/mobil: belakang ÷ depan. Rasio ↑ = akselerasi ↑, top-speed ↓.',
        inputs: [{ key: 'drive', label: 'Gigi depan (drive)', unit: 'mata', placeholder: 'cth: 15' }, { key: 'driven', label: 'Gigi belakang (driven)', unit: 'mata', placeholder: 'cth: 42' }, { key: 'stock', label: 'Rasio standar (opsional)', unit: '', placeholder: 'cth: 2,8', optional: true }],
        compute: function (v) {
          var stock = isNaN(v.stock) ? undefined : v.stock;
          var r = getModules().automotive.gearRatio(Math.round(v.drive), Math.round(v.driven), stock);
          var ex = [];
          if (r.changePct !== undefined) { ex.push({ label: 'Perubahan', value: formatNumber(r.changePct, 1) + ' %' }); ex.push({ label: 'Efek', value: r.effect }); }
          return { main: formatNumber(r.ratio, 3), unit: ': 1', steps: ['Rasio = ' + formatInt(v.driven) + ' ÷ ' + formatInt(v.drive) + ' = ' + formatNumber(r.ratio, 3)], extras: ex };
        } },
      { id: 'premix', name: 'Oli Samping 2-Tak', formula: 'Oli = Bensin ÷ Rasio', desc: 'Campuran bensin:oli (cth 1:25 → isi 25).',
        inputs: [{ key: 'bensin', label: 'Bensin', unit: 'L', placeholder: 'cth: 5' }, { key: 'rasio', label: 'Rasio (1:x)', unit: '1:x', type: 'select', options: [{ value: '25', label: '1 : 25' }, { value: '30', label: '1 : 30' }, { value: '40', label: '1 : 40' }, { value: '50', label: '1 : 50' }], defaultValue: '25' }],
        compute: function (v) {
          var r = getModules().automotive.premixOil(v.bensin, parseInt(v.rasio, 10));
          return { main: formatNumber(r.oilMl, 1) + ' ml', unit: 'oli untuk ' + formatNumber(v.bensin) + ' L (1:' + v.rasio + ')', steps: ['Oli = ' + formatNumber(v.bensin * 1000) + ' ml ÷ ' + v.rasio + ' = ' + formatNumber(r.oilMl, 1) + ' ml'], extras: [{ label: 'Dalam liter', value: formatNumber(r.oilLiters, 3) + ' L' }] };
        } }
    ],

    gaming: [
      { id: 'edpi', name: 'eDPI Converter', formula: 'eDPI = DPI × Sens', desc: 'Sensitivitas efektif lintas game/mouse.',
        inputs: [{ key: 'dpi', label: 'DPI mouse', unit: 'dpi', placeholder: 'cth: 800' }, { key: 'sens', label: 'Sens in-game', unit: '', placeholder: 'cth: 0,35' }],
        compute: function (v) {
          var r = getModules().gaming.edpi(v.dpi, v.sens);
          return { main: formatNumber(r.edpi, 1), unit: 'eDPI', steps: ['eDPI = ' + formatInt(v.dpi) + ' × ' + formatNumber(v.sens) + ' = ' + formatNumber(r.edpi, 1)], extras: [{ label: 'Karakter', value: r.feel }] };
        } },
      { id: 'gacha', name: 'Gacha / Pity', formula: 'P(≥1) = 1 − (1−p)^n', desc: 'Peluang dapat SSR/★5 dalam n pull. Pity = jaminan (0 = tanpa pity).',
        inputs: [{ key: 'rate', label: 'Rate per pull', unit: '%', placeholder: 'cth: 0,6' }, { key: 'pull', label: 'Jumlah pull', unit: '×', placeholder: 'cth: 90' }, { key: 'pity', label: 'Pity (0=tanpa)', unit: '×', placeholder: 'cth: 90', defaultValue: '90' }],
        compute: function (v) {
          var r = getModules().gaming.gacha(v.rate, Math.round(v.pull), Math.round(v.pity));
          return { main: formatNumber(r.probability, 2) + ' %', unit: r.guaranteed ? 'dijamin pity' : 'peluang ≥1 SSR', steps: ['p = ' + formatNumber(v.rate, 3) + '%, n = ' + formatInt(v.pull), 'P = ' + formatNumber(r.probability, 2) + ' %'], extras: [{ label: 'Ekspektasi', value: formatNumber(r.expectedPulls, 1) + ' pull' }, { label: 'Gagal', value: formatNumber(r.failChance, 2) + ' %' }], badgeColor: r.probability >= 50 ? 'green' : 'amber' };
        } },
      { id: 'topup', name: 'Efisiensi Top-Up', formula: 'Termurah = min(harga ÷ isi)', desc: 'Bandingkan 2 paket (diamond/UC/Genesis).',
        inputs: [{ key: 'hargaA', label: 'Harga paket A', unit: 'Rp', placeholder: 'cth: 15000' }, { key: 'isiA', label: 'Isi paket A', unit: '💎', placeholder: 'cth: 80' }, { key: 'hargaB', label: 'Harga paket B', unit: 'Rp', placeholder: 'cth: 75000' }, { key: 'isiB', label: 'Isi paket B', unit: '💎', placeholder: 'cth: 500' }],
        compute: function (v) {
          var r = getModules().gaming.topup(v.hargaA, v.isiA, v.hargaB, v.isiB);
          return { main: 'Paket ' + r.winner, unit: r.winner === 'Seri' ? 'sama hemat' : 'lebih hemat ' + formatNumber(r.savingPct, 1) + ' %', steps: ['A = ' + formatCurrency(v.hargaA) + ' ÷ ' + formatInt(v.isiA) + ' = ' + formatCurrency(r.perA) + '/💎', 'B = ' + formatCurrency(v.hargaB) + ' ÷ ' + formatInt(v.isiB) + ' = ' + formatCurrency(r.perB) + '/💎'], extras: [{ label: 'A per 💎', value: formatCurrency(r.perA) }, { label: 'B per 💎', value: formatCurrency(r.perB) }] };
        } }
    ],

    academic: [
      { id: 'gpa', name: 'IPK (5 MK)', formula: 'IPK = Σ(bobot×SKS) ÷ ΣSKS', desc: 'Bobot: A=4, AB=3,5, B=3, BC=2,5, C=2, D=1, E=0. Kosongkan MK yang tidak diambil (SKS=0/kosong).',
        inputs: [
          { key: 'sks1', label: 'SKS MK-1', unit: 'sks', placeholder: 'cth: 3' }, { key: 'grade1', label: 'Nilai MK-1', unit: '', type: 'select', options: [{ value: 'A', label: 'A (4,0)' }, { value: 'AB', label: 'AB (3,5)' }, { value: 'B', label: 'B (3,0)' }, { value: 'BC', label: 'BC (2,5)' }, { value: 'C', label: 'C (2,0)' }, { value: 'D', label: 'D (1,0)' }, { value: 'E', label: 'E (0)' }], defaultValue: 'A' },
          { key: 'sks2', label: 'SKS MK-2', unit: 'sks', placeholder: 'cth: 3', optional: true }, { key: 'grade2', label: 'Nilai MK-2', unit: '', type: 'select', options: [{ value: 'A', label: 'A (4,0)' }, { value: 'AB', label: 'AB (3,5)' }, { value: 'B', label: 'B (3,0)' }, { value: 'BC', label: 'BC (2,5)' }, { value: 'C', label: 'C (2,0)' }, { value: 'D', label: 'D (1,0)' }, { value: 'E', label: 'E (0)' }], defaultValue: 'A' },
          { key: 'sks3', label: 'SKS MK-3', unit: 'sks', placeholder: 'kosongkan bila tidak ada', optional: true }, { key: 'grade3', label: 'Nilai MK-3', unit: '', type: 'select', options: [{ value: 'A', label: 'A (4,0)' }, { value: 'AB', label: 'AB (3,5)' }, { value: 'B', label: 'B (3,0)' }, { value: 'BC', label: 'BC (2,5)' }, { value: 'C', label: 'C (2,0)' }, { value: 'D', label: 'D (1,0)' }, { value: 'E', label: 'E (0)' }], defaultValue: 'A' },
          { key: 'sks4', label: 'SKS MK-4', unit: 'sks', placeholder: 'kosongkan bila tidak ada', optional: true }, { key: 'grade4', label: 'Nilai MK-4', unit: '', type: 'select', options: [{ value: 'A', label: 'A (4,0)' }, { value: 'AB', label: 'AB (3,5)' }, { value: 'B', label: 'B (3,0)' }, { value: 'BC', label: 'BC (2,5)' }, { value: 'C', label: 'C (2,0)' }, { value: 'D', label: 'D (1,0)' }, { value: 'E', label: 'E (0)' }], defaultValue: 'A' },
          { key: 'sks5', label: 'SKS MK-5', unit: 'sks', placeholder: 'kosongkan bila tidak ada', optional: true }, { key: 'grade5', label: 'Nilai MK-5', unit: '', type: 'select', options: [{ value: 'A', label: 'A (4,0)' }, { value: 'AB', label: 'AB (3,5)' }, { value: 'B', label: 'B (3,0)' }, { value: 'BC', label: 'BC (2,5)' }, { value: 'C', label: 'C (2,0)' }, { value: 'D', label: 'D (1,0)' }, { value: 'E', label: 'E (0)' }], defaultValue: 'A' }
        ],
        compute: function (v) {
          var courses = [];
          for (var i = 1; i <= 5; i++) {
            var sks = v['sks' + i];
            if (isNaN(sks) || sks === 0) continue;
            courses.push({ sks: sks, grade: v['grade' + i] });
          }
          var r = getModules().academic.gpa(courses);
          return { main: formatNumber(r.ipk, 2), unit: r.predikat + ' · ' + r.totalSks + ' SKS', steps: ['ΣSKS = ' + r.totalSks, 'ΣBobot = ' + formatNumber(r.totalBobot, 2), 'IPK = ' + formatNumber(r.ipk, 2)], extras: [{ label: 'Predikat', value: r.predikat }, { label: 'Total SKS', value: String(r.totalSks) }] };
        } },
      { id: 'toefl', name: 'TOEFL PBT Predictor', formula: 'Total = (L+S+R) × 10 ÷ 3', desc: 'Skor seksi: Listening 31–68, Structure 31–68, Reading 31–67. Total 310–677.',
        inputs: [{ key: 'listen', label: 'Listening', unit: '31–68', placeholder: 'cth: 55' }, { key: 'struct', label: 'Structure', unit: '31–68', placeholder: 'cth: 53' }, { key: 'read', label: 'Reading', unit: '31–67', placeholder: 'cth: 56' }],
        compute: function (v) {
          var r = getModules().academic.toeflPbt(Math.round(v.listen), Math.round(v.struct), Math.round(v.read));
          return { main: String(r.total), unit: 'skor PBT', steps: ['Total = (' + v.listen + '+' + v.struct + '+' + v.read + ')×10÷3 = ' + r.total], extras: [{ label: 'Level', value: r.level }] };
        } },
      { id: 'subs', name: 'Agregator Langganan', formula: 'Bulanan = Σ harga/bulan', desc: 'Total Netflix/Spotify/GamePass/dll. Harga tahunan dibagi 12.',
        inputs: [
          { key: 'harga1', label: 'Harga langganan 1', unit: 'Rp', placeholder: 'cth: 65000' }, { key: 'periode1', label: 'Periode 1', unit: '', type: 'select', options: [{ value: 'bulan', label: 'Per bulan' }, { value: 'tahun', label: 'Per tahun' }], defaultValue: 'bulan' },
          { key: 'harga2', label: 'Harga langganan 2', unit: 'Rp', placeholder: 'opsional', optional: true }, { key: 'periode2', label: 'Periode 2', unit: '', type: 'select', options: [{ value: 'bulan', label: 'Per bulan' }, { value: 'tahun', label: 'Per tahun' }], defaultValue: 'bulan' },
          { key: 'harga3', label: 'Harga langganan 3', unit: 'Rp', placeholder: 'opsional', optional: true }, { key: 'periode3', label: 'Periode 3', unit: '', type: 'select', options: [{ value: 'bulan', label: 'Per bulan' }, { value: 'tahun', label: 'Per tahun' }], defaultValue: 'bulan' }
        ],
        compute: function (v) {
          var subs = [{ price: v.harga1, period: v.periode1 }];
          if (!isNaN(v.harga2) && v.harga2 > 0) subs.push({ price: v.harga2, period: v.periode2 });
          if (!isNaN(v.harga3) && v.harga3 > 0) subs.push({ price: v.harga3, period: v.periode3 });
          var r = getModules().academic.subscriptions(subs);
          return { main: formatCurrency(r.perMonth), unit: 'per bulan · ' + formatCurrency(r.perYear) + '/tahun', steps: ['Langganan aktif = ' + r.count, 'Per bulan = ' + formatCurrency(r.perMonth), 'Per tahun = ' + formatCurrency(r.perYear)], extras: [{ label: 'Per tahun', value: formatCurrency(r.perYear) }] };
        } }
    ]
  };

  var CATEGORY_META = {
    basic: { title: 'Dasar & Ilmiah', desc: 'Aritmetika, modulo, pangkat, akar, trigonometri, logaritma, faktorial (!).' },
    geometry: { title: 'Geometri', desc: 'Luas bangun datar & volume bangun ruang.' },
    physics: { title: 'Fisika', desc: 'Kecepatan (v=s/t), gaya (F=m·a), massa jenis (ρ=m/V).' },
    finance: { title: 'Keuangan & Kripto', desc: 'Bunga, ROI, DCA, dan profitabilitas mining.' },
    health: { title: 'Kesehatan', desc: 'Indeks Massa Tubuh (BMI) standar WHO.' },
    network: { title: 'IT & Server', desc: 'Subnetting, download, bandwidth, RAM Minecraft.' },
    ai: { title: 'AI Local Inference', desc: 'Estimasi VRAM LLM & ukuran file GGUF.' },
    civil: { title: 'Sipil & Air', desc: 'Debit air (Q=A·v) & tekanan hidrostatis (P=ρ·g·h).' },
    automotive: { title: 'Otomotif', desc: 'CC mesin, final gear, oli samping 2-tak.' },
    gaming: { title: 'Gaming', desc: 'eDPI, peluang gacha/pity, efisiensi top-up.' },
    academic: { title: 'Akademik & Personal', desc: 'IPK, prediksi TOEFL PBT, agregator langganan.' }
  };

  /* ---------- Navigasi ---------- */
  function setCategory(cat) {
    if (!CATEGORY_META[cat]) cat = 'basic';
    state.category = cat;
    $$('.nav-btn').forEach(function (b) {
      var active = b.getAttribute('data-cat') === cat;
      b.classList.toggle('bg-slate-900', active);
      b.classList.toggle('text-white', active);
      b.classList.toggle('bg-white', !active);
      b.classList.toggle('text-slate-700', !active);
      b.setAttribute('aria-current', active ? 'page' : 'false');
    });
    var mobileSel = $('mobileCategory');
    if (mobileSel) mobileSel.value = cat;
    var pBasic = $('panel-basic');
    var pForm = $('panel-formula');
    if (pBasic) pBasic.classList.toggle('hidden', cat !== 'basic');
    if (pForm) pForm.classList.toggle('hidden', cat === 'basic');
    var title = $('categoryTitle');
    var desc = $('categoryDesc');
    if (title) title.textContent = CATEGORY_META[cat].title;
    if (desc) desc.textContent = CATEGORY_META[cat].desc;
    if (cat !== 'basic') {
      var list = FORMULAS[cat] || [];
      if (!state.formulaId || !list.some(function (f) { return f.id === state.formulaId; })) {
        state.formulaId = list.length ? list[0].id : null;
      }
      renderFormulaList();
      renderInputs();
    }
    closeDrawer();
  }

  function getActiveFormula() {
    var list = FORMULAS[state.category] || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === state.formulaId) return list[i];
    return list[0] || null;
  }

  function renderFormulaList() {
    var wrap = $('formulaList');
    if (!wrap) return;
    var list = FORMULAS[state.category] || [];
    wrap.innerHTML = '';
    list.forEach(function (f) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = f.name;
      btn.setAttribute('data-formula', f.id);
      btn.className = 'px-3 py-2 rounded-lg text-sm font-medium border transition-colors whitespace-nowrap ' +
        (f.id === state.formulaId ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50');
      btn.addEventListener('click', function () { state.formulaId = f.id; renderFormulaList(); renderInputs(); });
      wrap.appendChild(btn);
    });
  }

  /* ---------- Form dinamis ---------- */
  function renderInputs() {
    var box = $('inputFields');
    var fTitle = $('formulaTitle');
    var fFormula = $('formulaText');
    var fDesc = $('formulaDesc');
    if (!box) return;
    var f = getActiveFormula();
    if (!f) { box.innerHTML = ''; return; }
    if (fTitle) fTitle.textContent = f.name;
    if (fFormula) fFormula.textContent = f.formula;
    if (fDesc) fDesc.textContent = f.desc;
    box.innerHTML = '';
    f.inputs.forEach(function (inp) {
      var div = document.createElement('div');
      if (inp.type === 'select') {
        var opts = (inp.options || []).map(function (o) {
          var sel = String(o.value) === String(inp.defaultValue) ? ' selected' : '';
          return '<option value="' + esc(o.value) + '"' + sel + '>' + esc(o.label) + '</option>';
        }).join('');
        div.innerHTML = '<label class="block text-sm font-medium text-slate-700 mb-1" for="in-' + esc(inp.key) + '">' + esc(inp.label) + '</label>' +
          '<select id="in-' + esc(inp.key) + '" data-key="' + esc(inp.key) + '" class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200">' + opts + '</select>';
      } else {
        var defVal = (inp.defaultValue !== undefined && inp.defaultValue !== null) ? ' value="' + esc(inp.defaultValue) + '"' : '';
        div.innerHTML = '<label class="block text-sm font-medium text-slate-700 mb-1" for="in-' + esc(inp.key) + '">' + esc(inp.label) + (inp.optional ? ' <span class="text-slate-400 font-normal">(opsional)</span>' : '') + '</label>' +
          '<div class="relative"><input id="in-' + esc(inp.key) + '" data-key="' + esc(inp.key) + '" type="number" step="any" inputmode="decimal" placeholder="' + esc(inp.placeholder || '') + '"' + defVal + ' class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 pr-16 text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200" />' +
          '<span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">' + esc(inp.unit) + '</span></div>';
      }
      box.appendChild(div);
    });
    $$('input[data-key], select[data-key]', box).forEach(function (el) {
      el.addEventListener('input', calculateAndRender);
      el.addEventListener('change', calculateAndRender);
    });
    calculateAndRender();
  }

  function readValues(f) {
    var vals = {};
    var emptyCount = 0;
    var requiredEmpty = 0;
    for (var i = 0; i < f.inputs.length; i++) {
      var def = f.inputs[i];
      var el = document.querySelector('[data-key="' + def.key + '"]');
      var raw = el ? el.value : '';
      if (def.type === 'select') { vals[def.key] = String(raw); continue; }
      if (raw === null || String(raw).trim() === '') {
        vals[def.key] = NaN;
        emptyCount++;
        if (!def.optional) requiredEmpty++;
        continue;
      }
      vals[def.key] = parseInput(raw);
    }
    return { vals: vals, emptyCount: emptyCount, requiredEmpty: requiredEmpty };
  }

  function requiredCount(f) {
    return f.inputs.filter(function (x) { return x.type !== 'select' && !x.optional; }).length;
  }

  function calculateAndRender() {
    var f = getActiveFormula();
    if (!f) return;
    var resultBox = $('resultBox');
    var resultValue = $('resultValue');
    var resultUnit = $('resultUnit');
    var resultSteps = $('resultSteps');
    var resultExtras = $('resultExtras');
    if (!resultBox) return;
    var read = readValues(f);
    var reqEmpty = read.requiredEmpty;
    var reqTotal = requiredCount(f);
    if (reqTotal > 0 && reqEmpty === reqTotal) {
      resultValue.textContent = '—';
      resultUnit.textContent = 'isi input untuk melihat hasil';
      resultUnit.className = 'text-sm text-slate-500';
      resultSteps.innerHTML = '<li class="text-slate-400">Hasil akan muncul otomatis saat Anda mengetik.</li>';
      resultExtras.innerHTML = '';
      resultBox.classList.remove('border-red-200', 'bg-red-50');
      resultBox.setAttribute('data-last-result', '');
      return;
    }
    for (var i = 0; i < f.inputs.length; i++) {
      var def = f.inputs[i];
      if (def.type === 'select') continue;
      var val = read.vals[def.key];
      if (isNaN(val) && !def.optional) {
        showResultError('Input "' + def.label + '" belum valid. Masukkan angka yang benar.');
        return;
      }
    }
    try {
      var out = f.compute(read.vals);
      resultBox.classList.remove('border-red-200', 'bg-red-50');
      resultValue.textContent = out.main;
      resultUnit.textContent = out.unit || '';
      resultUnit.className = out.badgeColor ? 'inline-block mt-1 text-xs font-semibold px-2.5 py-1 rounded-full ' + badgeClass(out.badgeColor) : 'text-sm text-slate-500';
      resultSteps.innerHTML = (out.steps || []).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('');
      resultExtras.innerHTML = (out.extras || []).map(function (e) {
        return '<div class="flex items-start justify-between gap-3 py-1.5 border-b border-slate-100 last:border-0"><span class="text-sm text-slate-500">' + esc(e.label) + '</span><span class="text-sm font-semibold text-slate-800 text-right">' + esc(e.value) + '</span></div>';
      }).join('');
      resultBox.setAttribute('data-last-result', f.name + ' = ' + out.main + ' ' + (out.unit || ''));
    } catch (err) {
      showResultError(err.message || 'Terjadi kesalahan perhitungan.');
    }
  }

  function badgeClass(color) {
    if (color === 'green') return 'bg-green-100 text-green-800';
    if (color === 'blue') return 'bg-blue-100 text-blue-800';
    if (color === 'amber') return 'bg-amber-100 text-amber-800';
    if (color === 'red') return 'bg-red-100 text-red-800';
    return 'bg-slate-100 text-slate-700';
  }

  function showResultError(msg) {
    var resultBox = $('resultBox');
    $('resultValue').textContent = 'Error';
    var ru = $('resultUnit');
    ru.textContent = '';
    ru.className = 'text-sm text-slate-500';
    $('resultSteps').innerHTML = '<li class="text-red-600">' + esc(msg) + '</li>';
    $('resultExtras').innerHTML = '';
    resultBox.classList.add('border-red-200', 'bg-red-50');
    resultBox.setAttribute('data-last-result', '');
  }

  /* ---------- Kalkulator dasar ---------- */
  function basicInit() {
    var display = $('basicDisplay');
    var exprPrev = $('basicPrev');
    if (!display) return;
    function insert(text) {
      display.value = (display.value === '0' && /^[0-9]$/.test(text)) ? text : display.value + text;
      autoEvaluate();
      display.focus();
    }
    function clearAll() { display.value = ''; if (exprPrev) exprPrev.textContent = 'Siap menghitung…'; $('basicLive').textContent = '—'; }
    function backspace() { display.value = display.value.slice(0, -1); autoEvaluate(); }
    function setAngle(u) {
      state.angleUnit = u;
      var bD = $('angleDeg'), bR = $('angleRad');
      if (bD && bR) {
        bD.className = 'px-3 py-1.5 text-xs font-semibold rounded-md ' + (u === 'deg' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100');
        bR.className = 'px-3 py-1.5 text-xs font-semibold rounded-md ' + (u === 'rad' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100');
      }
      autoEvaluate();
    }
    function autoEvaluate() {
      var live = $('basicLive');
      var expr = display.value.trim();
      if (!expr) { if (live) live.textContent = '—'; return; }
      try {
        var val = getModules().basic.evaluateExpression(expr, state.angleUnit);
        if (live) { live.textContent = '= ' + formatNumber(val); live.classList.remove('text-red-600'); live.classList.add('text-slate-700'); }
      } catch (e) {
        if (live) { live.textContent = e.message; live.classList.remove('text-slate-700'); live.classList.add('text-red-600'); }
      }
    }
    function equals() {
      var expr = display.value.trim();
      if (!expr) return;
      try {
        var val = getModules().basic.evaluateExpression(expr, state.angleUnit);
        if (exprPrev) exprPrev.textContent = expr + ' =';
        display.value = String(parseFloat(val.toFixed(10)));
        if ($('basicLive')) { $('basicLive').textContent = '= ' + formatNumber(val); $('basicLive').classList.remove('text-red-600'); }
        pushHistory(expr + ' = ' + formatNumber(val));
      } catch (e) {
        if (exprPrev) exprPrev.textContent = expr;
        if ($('basicLive')) { $('basicLive').textContent = e.message; $('basicLive').classList.add('text-red-600'); }
      }
    }
    $$('[data-insert]').forEach(function (b) {
      b.addEventListener('click', function () { insert(b.getAttribute('data-insert')); });
    });
    var bEq = $('btnEquals'); if (bEq) bEq.addEventListener('click', equals);
    var bCl = $('btnClear'); if (bCl) bCl.addEventListener('click', clearAll);
    var bBs = $('btnBack'); if (bBs) bBs.addEventListener('click', backspace);
    var bD = $('angleDeg'); if (bD) bD.addEventListener('click', function () { setAngle('deg'); });
    var bR = $('angleRad'); if (bR) bR.addEventListener('click', function () { setAngle('rad'); });
    display.addEventListener('input', autoEvaluate);
    display.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); equals(); } });
    window.SuperCalcBasic = { insert: insert, clearAll: clearAll, backspace: backspace, equals: equals, setAngle: setAngle };
  }

  /* ---------- Riwayat & misc ---------- */
  function renderHistory() {
    var list = $('historyList');
    var empty = $('historyEmpty');
    if (!list) return;
    list.innerHTML = '';
    if (!state.history.length) { if (empty) empty.classList.remove('hidden'); return; }
    if (empty) empty.classList.add('hidden');
    state.history.forEach(function (h) {
      var li = document.createElement('li');
      li.className = 'flex items-start justify-between gap-2 py-1.5 border-b border-slate-100 last:border-0 text-sm';
      li.innerHTML = '<span class="text-slate-700 break-all">' + esc(h.text) + '</span><span class="text-[11px] text-slate-400 whitespace-nowrap">' + esc(h.t) + '</span>';
      list.appendChild(li);
    });
  }

  function bindMisc() {
    var bCopy = $('btnCopy');
    if (bCopy) bCopy.addEventListener('click', function () {
      var box = $('resultBox');
      var txt = box ? box.getAttribute('data-last-result') : '';
      if (!txt) txt = $('basicDisplay') ? $('basicDisplay').value + ' = ' + $('basicLive').textContent : '';
      if (!txt || txt.trim() === '' || txt.trim() === '=') return;
      var done = function () { bCopy.textContent = ' tersalin!'; setTimeout(function () { bCopy.textContent = 'Salin hasil'; }, 1500); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, done);
      else { var ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} document.body.removeChild(ta); done(); }
      pushHistory('[salin] ' + txt);
    });
    var bReset = $('btnReset');
    if (bReset) bReset.addEventListener('click', function () {
      var f = getActiveFormula();
      $$('input[data-key]').forEach(function (i) { i.value = ''; });
      if (f) f.inputs.forEach(function (inp) {
        if (inp.type === 'select') {
          var sel = document.querySelector('select[data-key="' + inp.key + '"]');
          if (sel) sel.value = inp.defaultValue;
        } else if (inp.defaultValue !== undefined) {
          var el = document.querySelector('input[data-key="' + inp.key + '"]');
          if (el) el.value = inp.defaultValue;
        }
      });
      var d = $('basicDisplay'); if (d) d.value = '';
      var l = $('basicLive'); if (l) l.textContent = '—';
      calculateAndRender();
    });
    var bClearH = $('btnClearHistory');
    if (bClearH) bClearH.addEventListener('click', function () { state.history = []; saveHistory(); renderHistory(); });
    var bBurger = $('btnMenu');
    var drawer = $('sidebar');
    var overlay = $('overlay');
    if (bBurger && drawer) bBurger.addEventListener('click', function () {
      drawer.classList.toggle('-translate-x-full');
      if (overlay) overlay.classList.toggle('hidden');
    });
    if (overlay) overlay.addEventListener('click', closeDrawer);
    $$('.nav-btn').forEach(function (b) {
      b.addEventListener('click', function () { setCategory(b.getAttribute('data-cat')); });
    });
    var mobileSel = $('mobileCategory');
    if (mobileSel) mobileSel.addEventListener('change', function () { setCategory(mobileSel.value); });
  }

  function closeDrawer() {
    var drawer = $('sidebar');
    var overlay = $('overlay');
    if (!drawer) return;
    if (window.innerWidth < 1024) {
      drawer.classList.add('-translate-x-full');
      if (overlay) overlay.classList.add('hidden');
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    basicInit();
    bindMisc();
    renderHistory();
    setCategory('basic');
  });
})();
