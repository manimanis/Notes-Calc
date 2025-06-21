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

function dragstartHandler(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function dragoverHandler(ev) {
  ev.preventDefault();
}

function dropHandler(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text");
  // ev.target.appendChild(document.getElementById(data));
  app.removeItem(data);
}

function over40RoundTo2ndDec(value) {
  return value / 2;
}

function over40RoundTo025(value) {
  return roundTo(value / 2, 0.25);
}

function roundTo(value, roundVal = 0.25) {
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
    baremes: [10, 20, 30, 30, 40, 40],
    selValue: 0,
    runningTotal: 0.0,
    finalTotal: 0.0,
    computeMethod: 5,
    bareme: 40,
    selectedNote: -1
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
    },
    setBaseValue: function (selValue) {
      this.selValue = selValue;
    },
    selectNote: function (idx) {
      this.selectedNote = idx;
    },
    moveLeft: function () {
      if (this.selectedNote <= 0) {
        return;
      }
      this.moveItem(this.selectedNote, this.selectedNote - 1);
      this.selectedNote--;
    },
    moveRight: function () {
      if (this.selectedNote >= this.listNotes.length - 1) {
        return;
      }
      this.moveItem(this.selectedNote, this.selectedNote + 1);
      this.selectedNote++;
    },
    moveItem: function (from, to) {
      const el1 = this.listNotes[from];
      const el2 = this.listNotes[to];
      this.listNotes[from] = el2;
      this.listNotes[to] = el1;
      this.$forceUpdate();
    },
    removeItem: function (itemId) {
      const idx = +itemId.substring(5);
      this.listNotes.splice(idx, 1);
      this.updateTotal();
      this.$forceUpdate();
    }
  }
});

