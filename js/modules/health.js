(function () {
  'use strict';
  window.SuperCalcModules = window.SuperCalcModules || {};

  function bmi(weightKg, heightCm) {
    if (typeof weightKg !== 'number' || isNaN(weightKg)) throw new Error('Berat badan harus berupa angka.');
    if (typeof heightCm !== 'number' || isNaN(heightCm)) throw new Error('Tinggi badan harus berupa angka.');
    if (!isFinite(weightKg) || !isFinite(heightCm)) throw new Error('Input terlalu besar.');
    if (weightKg <= 0) throw new Error('Berat badan harus lebih dari nol.');
    if (heightCm <= 0) throw new Error('Tinggi badan harus lebih dari nol.');
    if (weightKg > 500) throw new Error('Berat badan tidak wajar (> 500 kg). Periksa kembali.');
    if (heightCm < 50 || heightCm > 250) throw new Error('Tinggi badan harus antara 50–250 cm.');
    var heightM = heightCm / 100;
    var value = weightKg / (heightM * heightM);
    return value;
  }

  function bmiCategory(value) {
    if (value < 18.5) return { label: 'Kurus (Underweight)', color: 'blue', advice: 'Pertimbangkan konsultasi gizi untuk menaikkan berat badan secara sehat.' };
    if (value < 25) return { label: 'Normal (Ideal)', color: 'green', advice: 'Pertahankan pola makan seimbang dan aktivitas fisik rutin.' };
    if (value < 30) return { label: 'Gemuk (Overweight)', color: 'amber', advice: 'Pertimbangkan pola makan lebih sehat dan olahraga teratur.' };
    return { label: 'Obesitas', color: 'red', advice: 'Disarankan berkonsultasi dengan tenaga kesehatan profesional.' };
  }

  function healthyWeightRange(heightCm) {
    var h = heightCm / 100;
    return { min: 18.5 * h * h, max: 24.9 * h * h };
  }

  window.SuperCalcModules.health = {
    bmi: bmi,
    bmiCategory: bmiCategory,
    healthyWeightRange: healthyWeightRange
  };
})();
