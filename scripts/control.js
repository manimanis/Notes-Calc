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

  static random() {
    let rnd;
    do {
      rnd = new DecimalNumber(randint(0, 3), randint(0, 3) * 25);
    } while (rnd.getVal() == 0);
    return rnd;
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

function randint(a, b) {
  return Math.floor(a + (b - a + 1) * Math.random());
}

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
  app.removeItem(+data.substring(5));
}

function dropHandlerMoveLast(ev) {
  ev.stopPropagation();
  const data = ev.dataTransfer.getData("text");
  app.moveLast(+data.substring(5));
}

function dropHandlerMoveBefore(ev) {
  ev.stopPropagation();
  const data = ev.dataTransfer.getData("text");
  const target = ev.target;
  const firstIdx = +data.substring(5);
  const targetIdx = +ev.target.id.substring(5);
  app.moveItem(firstIdx, targetIdx);
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
  mounted: function () {
    // for (let i = 0; i < 10; i++) {
    //   this.appendNumber(DecimalNumber.random());
    // }
  },
  methods: {
    appendNumber: function (number) {
      if (number == null) {
        number = this.currNum;
      }
      if (number.getVal() == 0) {
        return;
      }
      this.listNotes.push(number);
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
    moveLast: function (index) {
      this.moveItem(index, this.listNotes.length - 1);
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
      console.log("Move from", from, 'to', to);
      const el1 = this.listNotes[from];
      this.listNotes.splice(from, 1);
      this.listNotes.splice(to, 0, el1);
      this.$forceUpdate();
    },
    removeItem: function (idx) {
      this.listNotes.splice(idx, 1);
      this.updateTotal();
      this.$forceUpdate();
    },
  }
});

