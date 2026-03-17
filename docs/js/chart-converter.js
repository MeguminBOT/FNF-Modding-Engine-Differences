document.addEventListener("DOMContentLoaded", function () {
  var btnConvert = document.getElementById("chart-btn-convert");
  var btnCopy = document.getElementById("chart-btn-copy");
  var btnClear = document.getElementById("chart-btn-clear");
  var btnDownload = document.getElementById("chart-btn-download");
  var btnCopyMeta = document.getElementById("chart-btn-copy-meta");
  var btnDownloadMeta = document.getElementById("chart-btn-download-meta");
  var fileUpload = document.getElementById("chart-file-upload");
  var eventsUpload = document.getElementById("chart-events-upload");
  var fileNameEl = document.getElementById("chart-file-name");
  var eventsFileNameEl = document.getElementById("chart-events-file-name");
  if (!btnConvert) return;

  var inputEl = document.getElementById("chart-input-data");
  var outputEl = document.getElementById("chart-output-data");
  var outputSecondaryEl = document.getElementById("chart-output-secondary");
  var secondaryContainer = document.getElementById("chart-output-secondary-container");
  var statusEl = document.getElementById("chart-converter-status");
  var sourceSelect = document.getElementById("chart-source-engine");
  var targetSelect = document.getElementById("chart-target-engine");
  var stripNoteTypes = document.getElementById("chart-strip-note-types");
  var stripEvents = document.getElementById("chart-strip-events");
  var stripMetadata = document.getElementById("chart-strip-metadata");
  var uploadedFileName = "";
  var eventsData = null;

  // --- Convert ---
  btnConvert.addEventListener("click", function () {
    statusEl.style.color = "";
    statusEl.textContent = "";
    outputEl.value = "";
    outputSecondaryEl.value = "";
    secondaryContainer.style.display = "none";

    var raw = inputEl.value.trim();
    if (!raw) {
      setError("Please paste chart data in the input box.");
      return;
    }

    var sourceEngine = sourceSelect.value;
    if (sourceEngine === "auto") {
      sourceEngine = detectEngine(raw);
      if (!sourceEngine) {
        setError("Could not auto-detect the source engine. Please select it manually.");
        return;
      }
    }

    var targetEngine = targetSelect.value;
    if (sourceEngine === targetEngine) {
      setError("Source and target engine are the same.");
      return;
    }

    var options = {
      stripNoteTypes: stripNoteTypes.checked,
      stripEvents: stripEvents.checked,
      stripMetadata: stripMetadata.checked,
      eventsData: eventsData
    };

    try {
      var intermediate = parseToIntermediate(raw, sourceEngine, options);
      if (options.stripMetadata) {
        intermediate.player = "bf";
        intermediate.opponent = "dad";
        intermediate.girlfriend = "gf";
        intermediate.stage = "stage";
        intermediate.needsVoices = true;
        intermediate.speed = 1;
      }
      var result = intermediateToTarget(intermediate, targetEngine, options);

      if (targetEngine === "funkin") {
        outputEl.value = result.chart;
        outputSecondaryEl.value = result.metadata;
        secondaryContainer.style.display = "block";
      } else {
        outputEl.value = result.chart;
      }

      statusEl.style.color = "#4caf50";
      statusEl.textContent = "Converted " + engineLabel(sourceEngine) + " -> " + engineLabel(targetEngine) + " successfully.";
    } catch (e) {
      setError("Conversion error: " + e.message);
    }
  });

  // --- Copy ---
  btnCopy.addEventListener("click", function () {
    if (!outputEl.value) return;
    navigator.clipboard.writeText(outputEl.value).then(function () {
      statusEl.style.color = "#4caf50";
      statusEl.textContent = "Copied to clipboard!";
    });
  });

  btnCopyMeta.addEventListener("click", function () {
    if (!outputSecondaryEl.value) return;
    navigator.clipboard.writeText(outputSecondaryEl.value).then(function () {
      statusEl.style.color = "#4caf50";
      statusEl.textContent = "Copied metadata to clipboard!";
    });
  });

  // --- Clear ---
  btnClear.addEventListener("click", function () {
    inputEl.value = "";
    outputEl.value = "";
    outputSecondaryEl.value = "";
    secondaryContainer.style.display = "none";
    statusEl.textContent = "";
    fileNameEl.textContent = "";
    eventsFileNameEl.textContent = "";
    uploadedFileName = "";
    eventsData = null;
    fileUpload.value = "";
    eventsUpload.value = "";
  });

  // --- File upload ---
  fileUpload.addEventListener("change", function (e) {
    var file = e.target.files[0];
    if (!file) return;
    uploadedFileName = file.name;
    fileNameEl.textContent = "Loaded: " + file.name;
    var reader = new FileReader();
    reader.onload = function (ev) { inputEl.value = ev.target.result; };
    reader.readAsText(file);
  });

  var uploadLabel = fileUpload.parentElement;
  uploadLabel.addEventListener("dragover", function (e) { e.preventDefault(); uploadLabel.style.borderColor = "#7e57c2"; });
  uploadLabel.addEventListener("dragleave", function () { uploadLabel.style.borderColor = ""; });
  uploadLabel.addEventListener("drop", function (e) {
    e.preventDefault();
    uploadLabel.style.borderColor = "";
    var file = e.dataTransfer.files[0];
    if (!file) return;
    uploadedFileName = file.name;
    fileNameEl.textContent = "Loaded: " + file.name;
    var reader = new FileReader();
    reader.onload = function (ev) { inputEl.value = ev.target.result; };
    reader.readAsText(file);
  });

  // --- Events file upload ---
  eventsUpload.addEventListener("change", function (e) {
    var file = e.target.files[0];
    if (!file) return;
    eventsFileNameEl.textContent = "Loaded: " + file.name;
    var reader = new FileReader();
    reader.onload = function (ev) {
      try {
        eventsData = JSON.parse(ev.target.result);
      } catch (err) {
        setError("Could not parse events.json: " + err.message);
        eventsData = null;
      }
    };
    reader.readAsText(file);
  });

  var eventsLabel = eventsUpload.parentElement;
  eventsLabel.addEventListener("dragover", function (e) { e.preventDefault(); eventsLabel.style.borderColor = "#7e57c2"; });
  eventsLabel.addEventListener("dragleave", function () { eventsLabel.style.borderColor = ""; });
  eventsLabel.addEventListener("drop", function (e) {
    e.preventDefault();
    eventsLabel.style.borderColor = "";
    var file = e.dataTransfer.files[0];
    if (!file) return;
    eventsFileNameEl.textContent = "Loaded: " + file.name;
    var reader = new FileReader();
    reader.onload = function (ev) {
      try {
        eventsData = JSON.parse(ev.target.result);
      } catch (err) {
        setError("Could not parse events.json: " + err.message);
        eventsData = null;
      }
    };
    reader.readAsText(file);
  });

  // --- Download ---
  btnDownload.addEventListener("click", function () {
    if (!outputEl.value) { setError("Nothing to download. Convert something first."); return; }
    var targetEngine = targetSelect.value;
    var baseName = uploadedFileName ? uploadedFileName.replace(/\.[^.]+$/, "") : "chart";
    var downloadName;
    if (targetEngine === "funkin") {
      downloadName = baseName + "-chart.json";
    } else {
      downloadName = baseName + ".json";
    }
    downloadBlob(outputEl.value, downloadName, "application/json");
    statusEl.style.color = "#4caf50";
    statusEl.textContent = "Downloaded " + downloadName;
  });

  btnDownloadMeta.addEventListener("click", function () {
    if (!outputSecondaryEl.value) { setError("Nothing to download."); return; }
    var baseName = uploadedFileName ? uploadedFileName.replace(/\.[^.]+$/, "") : "chart";
    var downloadName = baseName + "-metadata.json";
    downloadBlob(outputSecondaryEl.value, downloadName, "application/json");
    statusEl.style.color = "#4caf50";
    statusEl.textContent = "Downloaded " + downloadName;
  });

  // --- Helpers ---
  function setError(msg) {
    statusEl.style.color = "#f44336";
    statusEl.textContent = msg;
  }

  function engineLabel(key) {
    return { funkin: "Official Funkin", psych: "Psych Engine" }[key] || key;
  }

  function downloadBlob(text, name, mime) {
    var blob = new Blob([text], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // --- Auto-detection ---
  function detectEngine(raw) {
    try {
      var obj = JSON.parse(raw);
      // Funkin chart: has "notes" as object with difficulty keys, or "scrollSpeed"
      if (obj.scrollSpeed !== undefined || (obj.notes && !Array.isArray(obj.notes))) return "funkin";
      // Funkin metadata: has "playData" or "timeChanges"
      if (obj.playData !== undefined || obj.timeChanges !== undefined) return "funkin";
      // Psych: has "song" wrapper with "notes" array
      if (obj.song && obj.song.notes && Array.isArray(obj.song.notes)) return "psych";
      // Psych without wrapper
      if (obj.notes && Array.isArray(obj.notes) && obj.notes.length > 0 && obj.notes[0].sectionNotes !== undefined) return "psych";
      return null;
    } catch (e) {
      return null;
    }
  }

  // =============================================
  // INTERMEDIATE REPRESENTATION
  // =============================================
  // {
  //   songName: string,
  //   bpm: number,
  //   speed: number,
  //   needsVoices: bool,
  //   player: string,
  //   opponent: string,
  //   girlfriend: string,
  //   stage: string,
  //   notes: [ { t: ms, d: 0-7 absolute, l: sustainMs, k: noteType } ],
  //   events: [ { t: ms, name: string, values: any } ],
  //   bpmChanges: [ { t: ms, bpm: number } ],
  //   sectionCameraTargets: [ { t: ms, target: 0|1 } ]  // 0=opponent, 1=player
  // }

  function parseToIntermediate(raw, engine, options) {
    if (engine === "funkin") return parseFunkin(raw, options);
    if (engine === "psych") return parsePsych(raw, options);
    throw new Error("Unknown source engine: " + engine);
  }

  // --- Parse Funkin ---
  function parseFunkin(raw, options) {
    var obj = JSON.parse(raw);

    // Could be metadata or chart - try to handle both in one paste
    // If it has playData, it's metadata. If it has scrollSpeed/notes, it's chart.
    // User might paste chart data (we need metadata too for full conversion, but we'll do best-effort)
    var chart = null;
    var meta = null;

    if (obj.scrollSpeed !== undefined || (obj.notes && !Array.isArray(obj.notes))) {
      chart = obj;
    }
    if (obj.playData !== undefined || obj.timeChanges !== undefined) {
      meta = obj;
    }

    // If user pasted metadata only
    if (meta && !chart) {
      throw new Error("This looks like Funkin metadata. Please paste the chart data (-chart.json) instead. Metadata fields (song name, characters, BPM) will be set to defaults.");
    }

    if (!chart) {
      throw new Error("Could not identify this as a Funkin chart file.");
    }

    var bpm = 100;
    var songName = "";
    var player = "bf";
    var opponent = "dad";
    var girlfriend = "gf";
    var stage = "mainStage";
    var bpmChanges = [];

    if (meta) {
      songName = meta.songName || "";
      bpm = (meta.timeChanges && meta.timeChanges.length > 0) ? meta.timeChanges[0].bpm : 100;
      bpmChanges = (meta.timeChanges || []).map(function (tc) {
        return { t: tc.t || 0, bpm: tc.bpm || 100 };
      });
      if (meta.playData) {
        var chars = meta.playData.characters || {};
        player = chars.player || "bf";
        opponent = chars.opponent || "dad";
        girlfriend = chars.girlfriend || "gf";
        stage = meta.playData.stage || "mainStage";
      }
    }

    var speed = 1.0;
    if (chart.scrollSpeed) {
      speed = chart.scrollSpeed["default"] || chart.scrollSpeed[Object.keys(chart.scrollSpeed)[0]] || 1.0;
    }

    // Parse notes - get the "default" difficulty or first available
    var rawNotes = [];
    if (chart.notes) {
      var diffKey = chart.notes["default"] ? "default" : Object.keys(chart.notes)[0];
      rawNotes = chart.notes[diffKey] || [];
    }

    var notes = rawNotes.map(function (n) {
      var noteType = n.k || "";
      if (options.stripNoteTypes && noteType !== "") {
        noteType = "";
      }
      return {
        t: n.t || 0,
        d: n.d || 0,  // already absolute in Funkin: 0-3 player, 4-7 opponent
        l: n.l || 0,
        k: noteType
      };
    });

    // Parse events
    var events = [];
    var cameraTargets = [];
    if (!options.stripEvents && chart.events) {
      for (var i = 0; i < chart.events.length; i++) {
        var ev = chart.events[i];
        if (ev.e === "FocusCamera") {
          var charVal = (ev.v && ev.v.char !== undefined) ? ev.v.char : 0;
          cameraTargets.push({ t: ev.t, target: charVal === 0 ? 0 : 1 });
        }
        events.push({
          t: ev.t || 0,
          name: ev.e || "",
          values: ev.v
        });
      }
    }

    return {
      songName: songName,
      bpm: bpm,
      speed: speed,
      needsVoices: true,
      player: player,
      opponent: opponent,
      girlfriend: girlfriend,
      stage: stage,
      notes: notes,
      events: events,
      bpmChanges: bpmChanges,
      sectionCameraTargets: cameraTargets
    };
  }

  // --- Parse Psych ---
  function parsePsych(raw, options) {
    var obj = JSON.parse(raw);
    var song = obj.song || obj;

    var bpm = song.bpm || 100;
    var songName = song.song || "";
    var speed = song.speed || 1.0;
    var needsVoices = song.needsVoices !== false;
    var player = song.player1 || "bf";
    var opponent = song.player2 || "dad";
    var girlfriend = song.gfVersion || song.player3 || "gf";
    var stage = song.stage || "stage";

    var sections = song.notes || [];
    var notes = [];
    var cameraTargets = [];
    var bpmChanges = [{ t: 0, bpm: bpm }];

    // We need to track time per section to resolve mustHitSection
    var currentTime = 0;
    var currentBpm = bpm;
    var lastMustHit = null;

    for (var s = 0; s < sections.length; s++) {
      var sec = sections[s];
      var mustHit = !!sec.mustHitSection;

      // BPM change
      if (sec.changeBPM && sec.bpm) {
        currentBpm = sec.bpm;
        bpmChanges.push({ t: currentTime, bpm: currentBpm });
      }

      // Camera target from mustHitSection
      if (mustHit !== lastMustHit) {
        cameraTargets.push({ t: currentTime, target: mustHit ? 1 : 0 });
        lastMustHit = mustHit;
      }

      // Parse section notes
      var sectionNotes = sec.sectionNotes || [];
      for (var n = 0; n < sectionNotes.length; n++) {
        var sn = sectionNotes[n];
        var time = sn[0] || 0;
        var data = sn[1] || 0;
        var sustain = sn[2] || 0;
        var noteType = (sn.length > 3) ? (sn[3] || "") : "";

        if (options.stripNoteTypes) {
          noteType = "";
        }

        // Resolve direction to absolute (0-3 player, 4-7 opponent)
        var absDir;
        if (data >= 0 && data <= 3) {
          // In mustHitSection: 0-3 = player. Otherwise: 0-3 = opponent
          absDir = mustHit ? data : (data + 4);
        } else if (data >= 4 && data <= 7) {
          // In mustHitSection: 4-7 = opponent. Otherwise: 4-7 = player
          absDir = mustHit ? data : (data - 4);
        } else {
          absDir = data;
        }

        notes.push({ t: time, d: absDir, l: sustain, k: noteType });
      }

      // Advance time by section length
      var stepsInSection = sec.lengthInSteps || 16;
      var beatsInSection = stepsInSection / 4;
      var msPerBeat = 60000 / currentBpm;
      currentTime += beatsInSection * msPerBeat;
    }

    // Parse events from chart
    var events = [];
    if (!options.stripEvents) {
      var chartEvents = song.events || [];
      events = events.concat(parsePsychEvents(chartEvents));

      // Merge external events.json if provided
      if (options.eventsData) {
        var extEvents = [];
        if (options.eventsData.song && options.eventsData.song.events) {
          extEvents = options.eventsData.song.events;
        } else if (Array.isArray(options.eventsData.events)) {
          extEvents = options.eventsData.events;
        } else if (Array.isArray(options.eventsData)) {
          extEvents = options.eventsData;
        }
        events = events.concat(parsePsychEvents(extEvents));
      }

      events.sort(function (a, b) { return a.t - b.t; });
    }

    // Sort notes by time
    notes.sort(function (a, b) { return a.t - b.t; });

    return {
      songName: songName,
      bpm: bpm,
      speed: speed,
      needsVoices: needsVoices,
      player: player,
      opponent: opponent,
      girlfriend: girlfriend,
      stage: stage,
      notes: notes,
      events: events,
      bpmChanges: bpmChanges,
      sectionCameraTargets: cameraTargets
    };
  }

  function parsePsychEvents(evArr) {
    var result = [];
    for (var i = 0; i < evArr.length; i++) {
      var entry = evArr[i];
      // Psych events format: [time, [[eventName, value1, value2], ...]]
      var time = entry[0] || 0;
      var eventList = entry[1] || [];
      for (var j = 0; j < eventList.length; j++) {
        var ev = eventList[j];
        result.push({
          t: time,
          name: ev[0] || "",
          values: { v1: ev[1] || "", v2: ev[2] || "" }
        });
      }
    }
    return result;
  }

  // =============================================
  // OUTPUT GENERATORS
  // =============================================

  function intermediateToTarget(data, engine, options) {
    if (engine === "funkin") return toFunkin(data);
    if (engine === "psych") return toPsych(data);
    throw new Error("Unknown target engine: " + engine);
  }

  // --- To Funkin ---
  function toFunkin(d) {
    // Build chart JSON
    var chartNotes = d.notes.map(function (n) {
      var obj = { t: n.t, d: n.d, l: n.l };
      if (n.k) obj.k = n.k;
      return obj;
    });

    var chartEvents = [];
    // Add camera focus events from section targets
    for (var i = 0; i < d.sectionCameraTargets.length; i++) {
      var ct = d.sectionCameraTargets[i];
      chartEvents.push({
        t: ct.t,
        e: "FocusCamera",
        v: { char: ct.target === 0 ? 0 : 1 }
      });
    }
    // Add other events (skip if already a FocusCamera from sectionCameraTargets)
    for (var j = 0; j < d.events.length; j++) {
      var ev = d.events[j];
      if (ev.name === "FocusCamera") continue; // already handled above
      // Convert Psych event format to Funkin
      var funkinValue = ev.values;
      if (ev.values && ev.values.v1 !== undefined) {
        // Psych-style values, keep as-is in a value object
        funkinValue = { value1: ev.values.v1, value2: ev.values.v2 };
      }
      chartEvents.push({
        t: ev.t,
        e: ev.name,
        v: funkinValue
      });
    }
    chartEvents.sort(function (a, b) { return a.t - b.t; });

    var chart = {
      version: "2.1.0",
      scrollSpeed: { "default": d.speed },
      notes: { "default": chartNotes },
      events: chartEvents
    };

    // Build metadata JSON
    var timeChanges = d.bpmChanges.length > 0 ? d.bpmChanges.map(function (bc) {
      return { t: bc.t, bpm: bc.bpm, n: 4, d: 4, bt: [4, 4, 4, 4] };
    }) : [{ t: 0, bpm: d.bpm, n: 4, d: 4, bt: [4, 4, 4, 4] }];

    var metadata = {
      version: "2.2.4",
      songName: d.songName,
      artist: "",
      charter: "",
      playData: {
        difficulties: ["easy", "normal", "hard"],
        characters: {
          player: d.player,
          opponent: d.opponent,
          girlfriend: d.girlfriend
        },
        stage: d.stage,
        noteStyle: "funkin",
        ratings: { "default": 0 }
      },
      timeFormat: "ms",
      timeChanges: timeChanges
    };

    return {
      chart: JSON.stringify(chart, null, 4),
      metadata: JSON.stringify(metadata, null, 4)
    };
  }

  // --- To Psych ---
  function toPsych(d) {
    var bpm = d.bpm;

    // Build BPM timeline for time calculations
    var bpmTimeline = d.bpmChanges.length > 0 ? d.bpmChanges.slice() : [{ t: 0, bpm: bpm }];
    bpmTimeline.sort(function (a, b) { return a.t - b.t; });

    // Build camera target timeline
    var camTimeline = d.sectionCameraTargets.slice();
    camTimeline.sort(function (a, b) { return a.t - b.t; });

    // Find the end time (last note or event)
    var endTime = 0;
    for (var i = 0; i < d.notes.length; i++) {
      var nt = d.notes[i].t + d.notes[i].l;
      if (nt > endTime) endTime = nt;
    }
    for (var j = 0; j < d.events.length; j++) {
      if (d.events[j].t > endTime) endTime = d.events[j].t;
    }
    endTime += 1000; // add a buffer

    // Generate sections
    var sections = [];
    var currentTime = 0;
    var currentBpm = bpmTimeline[0].bpm;
    var bpmIdx = 0;
    var camIdx = 0;
    var currentMustHit = true;

    // Determine initial mustHit from camera targets
    if (camTimeline.length > 0 && camTimeline[0].t <= 0) {
      currentMustHit = camTimeline[0].target === 1;
      camIdx = 1;
    }

    while (currentTime < endTime) {
      var stepsInSection = 16;
      var beatsInSection = stepsInSection / 4;
      var msPerBeat = 60000 / currentBpm;
      var sectionDuration = beatsInSection * msPerBeat;
      var sectionEnd = currentTime + sectionDuration;

      // Check for BPM change at or within this section
      var changeBPM = false;
      var newBpm = currentBpm;
      while (bpmIdx < bpmTimeline.length && bpmTimeline[bpmIdx].t <= currentTime + 1) {
        newBpm = bpmTimeline[bpmIdx].bpm;
        bpmIdx++;
      }
      if (newBpm !== currentBpm) {
        changeBPM = true;
        currentBpm = newBpm;
        msPerBeat = 60000 / currentBpm;
        sectionDuration = beatsInSection * msPerBeat;
        sectionEnd = currentTime + sectionDuration;
      }

      // Check for camera target change
      while (camIdx < camTimeline.length && camTimeline[camIdx].t < sectionEnd) {
        currentMustHit = camTimeline[camIdx].target === 1;
        camIdx++;
      }

      // Collect notes for this section
      var sectionNotes = [];
      for (var ni = 0; ni < d.notes.length; ni++) {
        var note = d.notes[ni];
        if (note.t >= currentTime && note.t < sectionEnd) {
          // Convert absolute direction back to section-relative
          var absD = note.d;
          var relD;
          if (currentMustHit) {
            relD = absD; // 0-3 = player, 4-7 = opponent (same in mustHitSection)
          } else {
            // Swap: player notes (0-3) become 4-7, opponent notes (4-7) become 0-3
            if (absD >= 0 && absD <= 3) {
              relD = absD + 4;
            } else {
              relD = absD - 4;
            }
          }
          var noteArr = [note.t, relD, note.l];
          if (note.k) noteArr.push(note.k);
          sectionNotes.push(noteArr);
        }
      }

      var sec = {
        sectionNotes: sectionNotes,
        mustHitSection: currentMustHit,
        altAnim: false,
        gfSection: false,
        bpm: currentBpm,
        changeBPM: changeBPM,
        lengthInSteps: stepsInSection
      };
      sections.push(sec);
      currentTime = sectionEnd;
    }

    // Build Psych events
    var psychEvents = [];
    if (d.events.length > 0) {
      // Group events by time
      var evByTime = {};
      for (var ei = 0; ei < d.events.length; ei++) {
        var ev = d.events[ei];
        // Skip FocusCamera events since mustHitSection handles camera
        if (ev.name === "FocusCamera") continue;
        var timeKey = ev.t;
        if (!evByTime[timeKey]) evByTime[timeKey] = [];
        var v1 = "";
        var v2 = "";
        if (ev.values) {
          if (ev.values.v1 !== undefined) {
            v1 = ev.values.v1;
            v2 = ev.values.v2;
          } else if (ev.values.value1 !== undefined) {
            v1 = String(ev.values.value1);
            v2 = String(ev.values.value2 || "");
          } else {
            v1 = JSON.stringify(ev.values);
          }
        }
        evByTime[timeKey].push([ev.name, v1, v2]);
      }
      var timeKeys = Object.keys(evByTime).sort(function (a, b) { return parseFloat(a) - parseFloat(b); });
      for (var ti = 0; ti < timeKeys.length; ti++) {
        psychEvents.push([parseFloat(timeKeys[ti]), evByTime[timeKeys[ti]]]);
      }
    }

    var result = {
      song: {
        song: d.songName,
        bpm: d.bpm,
        speed: d.speed,
        needsVoices: d.needsVoices,
        player1: d.player,
        player2: d.opponent,
        gfVersion: d.girlfriend,
        stage: d.stage,
        notes: sections,
        events: psychEvents
      }
    };

    return { chart: JSON.stringify(result, null, 4) };
  }

  // --- Report Issue ---
  var btnReport = document.getElementById("chart-btn-report-issue");
  if (btnReport) {
    btnReport.addEventListener("click", function (e) {
      e.preventDefault();
      var engineNames = { funkin: "Funkin", psych: "Psych", auto: "Auto-detect" };
      var src = sourceSelect.value;
      var tgt = targetSelect.value;
      var direction = (engineNames[src] || src) + " -> " + (engineNames[tgt] || tgt);

      var inputVal = inputEl.value.trim();
      var outputVal = outputEl.value.trim();
      var maxLen = 1500;
      if (inputVal.length > maxLen) inputVal = inputVal.substring(0, maxLen) + "\n\n... (truncated, please paste full data)";
      if (outputVal.length > maxLen) outputVal = outputVal.substring(0, maxLen) + "\n\n... (truncated, please paste full data)";

      var opts = [];
      opts.push("Conversion direction: " + direction);
      if (stripNoteTypes.checked) opts.push("Strip custom note types: enabled");
      if (stripEvents.checked) opts.push("Strip events: enabled");
      if (stripMetadata.checked) opts.push("Strip metadata: enabled");
      if (eventsData) opts.push("Separate events.json was uploaded");

      var params = new URLSearchParams();
      params.set("template", "chart-converter-issue.yml");
      params.set("title", "Chart Converter: " + direction);
      if (inputVal) params.set("input", inputVal);
      if (outputVal) params.set("output", outputVal);
      params.set("additional", opts.join("\n"));

      window.open("https://github.com/MeguminBOT/FNF-Modding-Engine-Differences/issues/new?" + params.toString(), "_blank");
    });
  }
});
