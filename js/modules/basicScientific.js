(function () {
  'use strict';

  window.SuperCalcModules = window.SuperCalcModules || {};

  /* ---------- Fungsi dasar murni ---------- */
  function add(a, b) { return a + b; }
  function subtract(a, b) { return a - b; }
  function multiply(a, b) { return a * b; }
  function divide(a, b) {
    if (b === 0) throw new Error('Pembagian dengan nol tidak terdefinisi.');
    return a / b;
  }
  function modulo(a, b) {
    if (b === 0) throw new Error('Modulo dengan nol tidak terdefinisi.');
    return a % b;
  }
  function power(base, exp) { return Math.pow(base, exp); }
  function squareRoot(x) {
    if (x < 0) throw new Error('Akar kuadrat dari bilangan negatif tidak terdefinisi (bilangan real).');
    return Math.sqrt(x);
  }
  function nthRoot(x, n) {
    if (n === 0) throw new Error('Indeks akar tidak boleh nol.');
    if (x < 0 && n % 2 === 0) throw new Error('Akar genap dari bilangan negatif tidak terdefinisi.');
    if (x < 0) return -Math.pow(Math.abs(x), 1 / n);
    return Math.pow(x, 1 / n);
  }
  function toRadians(deg) { return (deg * Math.PI) / 180; }
  function sinDeg(deg) { return Math.sin(toRadians(deg)); }
  function cosDeg(deg) { return Math.cos(toRadians(deg)); }
  function tanDeg(deg) {
    var c = Math.cos(toRadians(deg));
    if (Math.abs(c) < 1e-12) throw new Error('Tangen tidak terdefinisi pada sudut ini (asymptote 90° + k·180°).');
    return Math.tan(toRadians(deg));
  }
  function log10(x) {
    if (x <= 0) throw new Error('Logaritma hanya terdefinisi untuk x > 0.');
    return Math.log10 ? Math.log10(x) : Math.log(x) / Math.LN10;
  }
  function ln(x) {
    if (x <= 0) throw new Error('Logaritma natural hanya terdefinisi untuk x > 0.');
    return Math.log(x);
  }
  function factorial(n) {
    if (typeof n !== 'number' || isNaN(n)) throw new Error('Faktorial membutuhkan angka.');
    if (!isFinite(n)) throw new Error('Faktorial terlalu besar.');
    if (Math.abs(n - Math.round(n)) > 1e-9) throw new Error('Faktorial hanya terdefinisi untuk bilangan bulat (cth: 5!).');
    var k = Math.round(n);
    if (k < 0) throw new Error('Faktorial tidak terdefinisi untuk bilangan negatif.');
    if (k > 170) throw new Error('Faktorial overflow: maksimal 170! (hasil melebihi batas double).');
    var r = 1;
    for (var i = 2; i <= k; i++) r *= i;
    return r;
  }

  /* ---------- Evaluator ekspresi aman (Shunting-Yard) ---------- */
  var FUNCTIONS = ['sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'cbrt', 'fact'];
  var CONSTANTS = { pi: Math.PI, e: Math.E };

  function isDigit(ch) { return ch >= '0' && ch <= '9'; }
  function isLetter(ch) { return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z'); }

  function tokenize(expr) {
    var tokens = [];
    var i = 0;
    var prev = null;
    expr = String(expr).replace(/,/g, '.').replace(/\s+/g, '');
    // Normalisasi simbol UI
    expr = expr.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/\*\*/g, '^');
    while (i < expr.length) {
      var ch = expr[i];
      if (isDigit(ch) || ch === '.') {
        var num = '';
        var dots = 0;
        while (i < expr.length && (isDigit(expr[i]) || expr[i] === '.')) {
          if (expr[i] === '.') dots++;
          if (dots > 1) throw new Error('Format angka tidak valid (titik desimal ganda).');
          num += expr[i++];
        }
        if (num === '.' || num === '') throw new Error('Format angka tidak valid.');
        tokens.push({ type: 'num', value: parseFloat(num) });
        prev = tokens[tokens.length - 1];
        continue;
      }
      if (isLetter(ch)) {
        var word = '';
        while (i < expr.length && isLetter(expr[i])) word += expr[i++];
        word = word.toLowerCase();
        if (word === 'mod') { tokens.push({ type: 'op', value: '%' }); }
        else if (FUNCTIONS.indexOf(word) !== -1) { tokens.push({ type: 'func', value: word }); }
        else if (word === 'pi' || word === 'e') { tokens.push({ type: 'num', value: CONSTANTS[word] }); }
        else { throw new Error('Fungsi/konstanta tidak dikenal: "' + word + '".'); }
        prev = tokens[tokens.length - 1];
        continue;
      }
      if (ch === '(' || ch === ')') {
        tokens.push({ type: 'paren', value: ch });
        i++;
        prev = tokens[tokens.length - 1];
        continue;
      }
      if ('+-*/%^'.indexOf(ch) !== -1) {
        // Deteksi unary minus/plus: di awal, setelah '(' atau operator lain
        var isUnary = (ch === '-' || ch === '+') &&
          (prev === null || (prev.type === 'op') || (prev.type === 'paren' && prev.value === '('));
        if (isUnary) {
          // Ubah "-x" menjadi "0 - x", "+x" menjadi "0 + x" kecuali diikuti angka langsung
          var j = i + 1;
          var numStr = '';
          var k = j;
          var dotCount = 0;
          while (k < expr.length && (isDigit(expr[k]) || expr[k] === '.')) {
            if (expr[k] === '.') dotCount++;
            numStr += expr[k++];
          }
          if (numStr.length > 0 && dotCount <= 1) {
            var v = parseFloat(numStr);
            if (ch === '-') v = -v;
            tokens.push({ type: 'num', value: v });
            i = k;
            prev = tokens[tokens.length - 1];
            continue;
          }
          tokens.push({ type: 'num', value: 0 });
          tokens.push({ type: 'op', value: ch });
          i++;
          prev = tokens[tokens.length - 1];
          continue;
        }
        tokens.push({ type: 'op', value: ch });
        i++;
        prev = tokens[tokens.length - 1];
        continue;
      }
      if (ch === '!') {
        tokens.push({ type: 'fact', value: '!' });
        i++;
        prev = tokens[tokens.length - 1];
        continue;
      }
      throw new Error('Karakter tidak valid: "' + ch + '".');
    }
    return tokens;
  }

  function precedence(op) {
    if (op === '+' || op === '-') return 1;
    if (op === '*' || op === '/' || op === '%') return 2;
    if (op === '^') return 3;
    return 0;
  }
  function isRightAssoc(op) { return op === '^'; }

  function toRPN(tokens) {
    var out = [];
    var stack = [];
    for (var t = 0; t < tokens.length; t++) {
      var tk = tokens[t];
      if (tk.type === 'num') out.push(tk);
      else if (tk.type === 'fact') out.push(tk);
      else if (tk.type === 'func') stack.push(tk);
      else if (tk.type === 'op') {
        while (stack.length > 0) {
          var top = stack[stack.length - 1];
          if (top.type === 'func') { out.push(stack.pop()); continue; }
          if (top.type === 'op' &&
            (precedence(top.value) > precedence(tk.value) ||
              (precedence(top.value) === precedence(tk.value) && !isRightAssoc(tk.value)))) {
            out.push(stack.pop());
            continue;
          }
          break;
        }
        stack.push(tk);
      } else if (tk.type === 'paren') {
        if (tk.value === '(') stack.push(tk);
        else {
          var found = false;
          while (stack.length > 0) {
            var p = stack.pop();
            if (p.type === 'paren' && p.value === '(') { found = true; break; }
            out.push(p);
          }
          if (!found) throw new Error('Kurung tidak seimbang: ")" berlebih.');
          if (stack.length > 0 && stack[stack.length - 1].type === 'func') out.push(stack.pop());
        }
      }
    }
    while (stack.length > 0) {
      var r = stack.pop();
      if (r.type === 'paren') throw new Error('Kurung tidak seimbang: "(" belum ditutup.');
      out.push(r);
    }
    return out;
  }

  function evalRPN(rpn, angleUnit) {
    var st = [];
    for (var i = 0; i < rpn.length; i++) {
      var tk = rpn[i];
      if (tk.type === 'num') { st.push(tk.value); continue; }
      if (tk.type === 'fact') {
        if (st.length < 1) throw new Error('Operator "!" butuh angka di depannya (cth: 5!).');
        st.push(factorial(st.pop()));
        continue;
      }
      if (tk.type === 'func') {
        if (st.length < 1) throw new Error('Argumen fungsi "' + tk.value + '" kurang.');
        var a = st.pop();
        var res;
        var useDeg = (angleUnit === 'deg');
        if (tk.value === 'sin') res = useDeg ? sinDeg(a) : Math.sin(a);
        else if (tk.value === 'cos') res = useDeg ? cosDeg(a) : Math.cos(a);
        else if (tk.value === 'tan') res = useDeg ? tanDeg(a) : Math.tan(a);
        else if (tk.value === 'log') res = log10(a);
        else if (tk.value === 'ln') res = ln(a);
        else if (tk.value === 'sqrt') res = squareRoot(a);
        else if (tk.value === 'cbrt') res = Math.cbrt ? Math.cbrt(a) : nthRoot(a, 3);
        else if (tk.value === 'fact') res = factorial(a);
        else throw new Error('Fungsi tidak dikenal: ' + tk.value);
        st.push(res);
        continue;
      }
      if (tk.type === 'op') {
        if (st.length < 2) throw new Error('Ekspresi tidak lengkap di sekitar operator "' + tk.value + '".');
        var b = st.pop();
        var x = st.pop();
        var o;
        if (tk.value === '+') o = x + b;
        else if (tk.value === '-') o = x - b;
        else if (tk.value === '*') o = x * b;
        else if (tk.value === '/') {
          if (b === 0) throw new Error('Pembagian dengan nol tidak terdefinisi.');
          o = x / b;
        } else if (tk.value === '%') {
          if (b === 0) throw new Error('Modulo dengan nol tidak terdefinisi.');
          o = x % b;
        } else if (tk.value === '^') o = Math.pow(x, b);
        else throw new Error('Operator tidak dikenal: ' + tk.value);
        st.push(o);
      }
    }
    if (st.length !== 1) throw new Error('Ekspresi tidak valid. Periksa operator dan kurung.');
    return st[0];
  }

  function evaluateExpression(expr, angleUnit) {
    if (expr === null || expr === undefined || String(expr).trim() === '') {
      throw new Error('Ekspresi masih kosong. Ketik atau tekan tombol angka.');
    }
    var tokens = tokenize(expr);
    if (tokens.length === 0) throw new Error('Ekspresi masih kosong.');
    var rpn = toRPN(tokens);
    var val = evalRPN(rpn, angleUnit || 'deg');
    if (typeof val !== 'number' || !isFinite(val)) {
      throw new Error('Hasil tidak terhingga (overflow / pembagian nol).');
    }
    return val;
  }

  window.SuperCalcModules.basic = {
    add: add,
    subtract: subtract,
    multiply: multiply,
    divide: divide,
    modulo: modulo,
    power: power,
    squareRoot: squareRoot,
    nthRoot: nthRoot,
    sinDeg: sinDeg,
    cosDeg: cosDeg,
    tanDeg: tanDeg,
    log10: log10,
    ln: ln,
    factorial: factorial,
    evaluateExpression: evaluateExpression
  };
})();
