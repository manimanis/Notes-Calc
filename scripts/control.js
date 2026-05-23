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

function parseItemIndex(id) {
  if (!id || !id.startsWith('item-')) {
    return null;
  }
  const idx = +id.substring(5);
  return Number.isNaN(idx) ? null : idx;
}

function getItemFromEvent(ev) {
  const el = ev.target.closest('.item');
  return el && el.id ? el : null;
}

function dragstartHandler(ev) {
  const item = getItemFromEvent(ev);
  if (!item) {
    return;
  }
  ev.dataTransfer.setData('text/plain', item.id);
  ev.dataTransfer.effectAllowed = 'move';
  item.classList.add('dragging');
}

function dragendHandler(ev) {
  const item = getItemFromEvent(ev) || document.querySelector('.item.dragging');
  if (item) {
    item.classList.remove('dragging');
  }
  const trash = document.getElementById('btn-trash');
  if (trash) {
    trash.classList.remove('drag-over');
  }
}

function dragoverHandler(ev) {
  ev.preventDefault();
  if (ev.dataTransfer) {
    ev.dataTransfer.dropEffect = 'move';
  }
}

function trashDragEnterHandler(ev) {
  ev.preventDefault();
  ev.stopPropagation();
  const trash = document.getElementById('btn-trash');
  if (trash && !trash.disabled) {
    trash.classList.add('drag-over');
  }
}

function trashDragLeaveHandler(ev) {
  const trash = document.getElementById('btn-trash');
  if (!trash || trash.disabled) {
    return;
  }
  if (!trash.contains(ev.relatedTarget)) {
    trash.classList.remove('drag-over');
  }
}

function dropHandler(ev) {
  ev.preventDefault();
  ev.stopPropagation();
  const trash = document.getElementById('btn-trash');
  if (trash) {
    trash.classList.remove('drag-over');
  }
  if (trash && trash.disabled) {
    return;
  }
  const idx = parseItemIndex(ev.dataTransfer.getData('text/plain'));
  if (idx !== null) {
    app.removeItem(idx);
  }
}

function dropHandlerMoveLast(ev) {
  ev.preventDefault();
  ev.stopPropagation();
  const idx = parseItemIndex(ev.dataTransfer.getData('text/plain'));
  if (idx !== null) {
    app.moveLast(idx);
  }
}

function dropHandlerMoveBefore(ev) {
  ev.preventDefault();
  ev.stopPropagation();
  const sourceIdx = parseItemIndex(ev.dataTransfer.getData('text/plain'));
  const targetEl = ev.target.closest('.item');
  const targetIdx = targetEl ? parseItemIndex(targetEl.id) : null;
  if (sourceIdx !== null && targetIdx !== null && sourceIdx !== targetIdx) {
    app.moveItem(sourceIdx, targetIdx);
  }
}

let touchDragIndex = null;

function touchDragStart(ev) {
  const item = getItemFromEvent(ev);
  if (!item) {
    return;
  }
  touchDragIndex = parseItemIndex(item.id);
  item.classList.add('dragging');
}

function touchDragMove(ev) {
  if (touchDragIndex === null) {
    return;
  }
  ev.preventDefault();
  const touch = ev.touches[0];
  const trash = document.getElementById('btn-trash');
  if (!trash || trash.disabled) {
    return;
  }
  const rect = trash.getBoundingClientRect();
  const over = touch.clientX >= rect.left && touch.clientX <= rect.right
    && touch.clientY >= rect.top && touch.clientY <= rect.bottom;
  trash.classList.toggle('drag-over', over);
}

function touchDragEnd(ev) {
  const dragging = document.querySelector('.item.dragging');
  if (dragging) {
    dragging.classList.remove('dragging');
  }
  const trash = document.getElementById('btn-trash');
  if (touchDragIndex !== null && trash && !trash.disabled) {
    const touch = ev.changedTouches[0];
    const rect = trash.getBoundingClientRect();
    const over = touch.clientX >= rect.left && touch.clientX <= rect.right
      && touch.clientY >= rect.top && touch.clientY <= rect.bottom;
    if (over) {
      app.removeItem(touchDragIndex);
    }
  }
  if (trash) {
    trash.classList.remove('drag-over');
  }
  touchDragIndex = null;
}

function roundTo(value, roundVal = 0.25) {
  return Math.ceil(value / roundVal) * roundVal;
}

function roundToHundredth(value) {
  return Math.round(value * 100) / 100;
}

const BAREME_MIN = 5;
const BAREME_MAX = 100;
const LEGACY_COMPUTE_METHODS = [
  { examBareme: 10, finalBareme: 20, roundingMode: 'none' },
  { examBareme: 20, finalBareme: 20, roundingMode: 'none' },
  { examBareme: 30, finalBareme: 20, roundingMode: 'quarter' },
  { examBareme: 30, finalBareme: 20, roundingMode: 'none' },
  { examBareme: 40, finalBareme: 20, roundingMode: 'quarter' },
  { examBareme: 40, finalBareme: 20, roundingMode: 'none' },
];

const VALID_ROUNDING_MODES = ['none', 'quarter', 'hundredth'];

const NOTE_PRESETS = [
  { label: '10/10', examBareme: 10, finalBareme: 10 },
  { label: '20/20', examBareme: 20, finalBareme: 20 },
  { label: '30/20', examBareme: 30, finalBareme: 20 },
  { label: '40/20', examBareme: 40, finalBareme: 20 },
];

const ROUNDING_PRESETS = [
  { label: 'Aucun', mode: 'none' },
  { label: '0.25 près', mode: 'quarter' },
  { label: '2ème décimale', mode: 'hundredth' },
];

function normalizeRoundingMode(mode, fallback = 'none') {
  return VALID_ROUNDING_MODES.includes(mode) ? mode : fallback;
}

function clampBareme(value, fallback = 20) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return fallback;
  }
  return Math.min(BAREME_MAX, Math.max(BAREME_MIN, Math.round(n)));
}

function applyRounding(value, roundingMode) {
  if (roundingMode === 'quarter') {
    return roundTo(value, 0.25);
  }
  if (roundingMode === 'hundredth') {
    return roundToHundredth(value);
  }
  return value;
}

function computeFinalTotal(runningTotal, examBareme, finalBareme, roundingMode) {
  if (examBareme <= 0) {
    return 0;
  }
  const scaled = runningTotal * finalBareme / examBareme;
  return applyRounding(scaled, roundingMode);
}

const STORAGE_KEY = 'notes-calc-state';

function noteToJson(note) {
  return { intPart: note.intPart, decPart: note.decPart };
}

function noteFromJson(o) {
  return new DecimalNumber(o.intPart, o.decPart);
}

function saveState(vm) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      listNotes: vm.listNotes.map(noteToJson),
      examBareme: vm.examBareme,
      finalBareme: vm.finalBareme,
      roundingMode: vm.roundingMode,
      selValue: vm.selValue,
      currNum: noteToJson(vm.currNum),
    }));
  } catch (e) {
    console.warn('Impossible d\'enregistrer les notes', e);
  }
}

function migrateLegacySettings(data) {
  if (data.examBareme != null && data.finalBareme != null && data.roundingMode) {
    return {
      examBareme: clampBareme(data.examBareme, 40),
      finalBareme: clampBareme(data.finalBareme, 20),
      roundingMode: normalizeRoundingMode(data.roundingMode, 'none'),
    };
  }
  const idx = Number(data.computeMethod);
  const legacy = LEGACY_COMPUTE_METHODS[idx] || LEGACY_COMPUTE_METHODS[5];
  return legacy;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const data = JSON.parse(raw);
    if (!Array.isArray(data.listNotes)) {
      return null;
    }
    const settings = migrateLegacySettings(data);
    return {
      listNotes: data.listNotes.map(noteFromJson),
      examBareme: settings.examBareme,
      finalBareme: settings.finalBareme,
      roundingMode: settings.roundingMode,
      selValue: data.selValue ?? 0,
      currNum: data.currNum ? noteFromJson(data.currNum) : new DecimalNumber(),
    };
  } catch (e) {
    console.warn('Impossible de charger les notes', e);
    return null;
  }
}

const app = new Vue({
  el: "#app",
  data: {
    currNum: new DecimalNumber(),
    listNotes: [],
    notePresets: NOTE_PRESETS,
    roundingPresets: ROUNDING_PRESETS,
    examBareme: 40,
    finalBareme: 20,
    roundingMode: 'none',
    selValue: 0,
    runningTotal: 0.0,
    finalTotal: 0.0,
    selectedNote: -1,
    showSettings: false,
  },
  mounted: function () {
    const saved = loadState();
    if (saved) {
      this.listNotes = saved.listNotes;
      this.examBareme = saved.examBareme;
      this.finalBareme = saved.finalBareme;
      this.roundingMode = saved.roundingMode;
      this.selValue = saved.selValue;
      this.currNum = saved.currNum;
      this.updateTotal();
    }
    const list = document.getElementById('list');
    if (list) {
      list.addEventListener('touchmove', touchDragMove, { passive: false });
    }
    const btnSettings = document.getElementById('btn-settings');
    if (btnSettings) {
      btnSettings.addEventListener('click', () => {
        this.showSettings = true;
      });
    }
  },
  watch: {
    listNotes: {
      handler: function () {
        saveState(this);
      },
      deep: true,
    },
    examBareme: function () {
      saveState(this);
    },
    finalBareme: function () {
      saveState(this);
    },
    roundingMode: function () {
      saveState(this);
    },
    selValue: function () {
      saveState(this);
    },
    currNum: {
      handler: function () {
        saveState(this);
      },
      deep: true,
    },
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
      this.finalTotal = computeFinalTotal(
        this.runningTotal,
        this.examBareme,
        this.finalBareme,
        this.roundingMode,
      );
    },
    openSettings: function () {
      this.showSettings = true;
    },
    closeSettings: function () {
      this.showSettings = false;
    },
    applyNotePreset: function (preset) {
      this.examBareme = preset.examBareme;
      this.finalBareme = preset.finalBareme;
      this.updateTotal();
    },
    isNotePresetActive: function (preset) {
      return this.examBareme === preset.examBareme
        && this.finalBareme === preset.finalBareme;
    },
    applyRoundingPreset: function (mode) {
      this.roundingMode = mode;
      this.updateTotal();
    },
    isRoundingPresetActive: function (mode) {
      return this.roundingMode === mode;
    },
    resetCalc: function () {
      if (!confirm("Effacer les données ?")) {
        return;
      }
      this.listNotes = [];
      this.currNum = new DecimalNumber();
      this.selectedNote = -1;
      this.updateTotal();
      saveState(this);
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
      if (idx < 0 || idx >= this.listNotes.length) {
        return;
      }
      this.listNotes.splice(idx, 1);
      if (this.selectedNote === idx) {
        this.selectedNote = -1;
      } else if (this.selectedNote > idx) {
        this.selectedNote--;
      }
      this.updateTotal();
      this.$forceUpdate();
    },
  }
});

