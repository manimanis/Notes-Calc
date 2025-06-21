class DecimalNumber {
  constructor(intPart = 0, decPart = 0) {
    this.intPart = intPart;
    this.decPart = decPart;
  }

  setDecimal(decPart) {
    this.decPart = decPart;
    return this;
  }

  setInteger(intPart) {
    this.intPart = intPart;
    return this;
  }

  getVal() {
    return (this.intPart + this.decPart / 100);
  }

  static getValue(num) {
    return num.getVal();
  }

  static getTotal(lst) {
    let s = 0.0;
    for (let note of lst) {
      s += note.getVal();
    }
    return s;
  }
};

function over40RoundTo2ndDec(value) {
  return value / 2;
}

function over40RoundTo025(value) {
  return roundTo(value / 2, 0.25);
}

function roundTo(value, roundVal=0.25) {
  return Math.ceil(value / roundVal) * roundVal;
}

const computeMethods = [
  (val) => val * 2,
  (val) => val,
  (val) => roundTo(val * 2 / 3, 0.25),
  (val) => val * 2 / 3,
  (val) => roundTo(val / 2, 0.25),
  (val) => val / 2,
];

const app = new Vue({
  el: "#app",
  data: {
    currNum: new DecimalNumber(),
    listNotes: [],
    runningTotal: 0.0,
    finalTotal: 0.0,
    computeMethod: 5
  },
  methods: {
    appendNumber: function () {
      if (this.currNum.getVal() == 0) {
        return;
      }
      this.listNotes.push(this.currNum);
      this.currNum = new DecimalNumber();
      this.updateTotal();
    },
    updateTotal: function () {
      this.runningTotal = 0;
      for (let note of this.listNotes) {
        this.runningTotal += note.getVal();
      }
      this.finalTotal = computeMethods[this.computeMethod](this.runningTotal);
    },
    resetCalc: function () {
      if (!confirm("Effacer les données ?")) {
        return;
      }
      this.listNotes = [];
      this.updateTotal();
    }
  }
});

