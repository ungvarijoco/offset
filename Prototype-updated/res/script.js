$(document).ready(function () {

    /*--Automation Config---------------------------*/

    let currentPhase = 'hidden';

    const autoConfig = {
        enabled: true,
        spacedToPuzzle: 3000,
        puzzleToPhysics: 10000,
        physicsToEmotion: 500,
        emotionToHidden: 30000,
        hiddenToSpaced: 500,
        minStateDuration: 500,
        countdownDelay: 2000
    };

    const appConfig = {
        enableMic: true
    };

    /*--Split Type---------------------------*/

    let poemSplitInstance = null;
    let poemIsVisible = false;

    /*--Rotation Config----------------------*/

    const ufoBaseRotations = { 1: 15, 2: 115, 3: -120, 4: 120, 5: 60, 6: -60 };
    const idleSwingRange   = 10;
    const ufoCurrentRotation = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    /*--Speech Config------------------------*/

    const speechAngles = {
        1:  -30,
        2:  150,
        3:  -30,
        4:  150,
        5:  -30,
        6:  150
    };
    const SPEECH_MARGIN = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--globalMargin')) || 100;

    const speechConfig = {
        duration: 600,
        easingOpen: 'outQuart',
        easingClose: 'inCubic',
        recoilDist: 30,
        recoilDur: '0.5s',
        recoilEase: 'ease-out',
        wordStaggerDelay: 250
    };

    const textBoxConfig = {
        1: { anchor: '0, 0',         bgSide: 'left',  primary: ['.edge-01', '.edge-03'], secondary: ['.edge-02', '.edge-04'] },
        2: { anchor: '0, -100%',     bgSide: 'left',  primary: ['.edge-01', '.edge-03'], secondary: ['.edge-02', '.edge-04'] },
        3: { anchor: '0, 0',         bgSide: 'left',  primary: ['.edge-01', '.edge-03'], secondary: ['.edge-02', '.edge-04'] },
        4: { anchor: '-100%, -100%', bgSide: 'right', primary: ['.edge-02', '.edge-04'], secondary: ['.edge-01', '.edge-03'] },
        5: { anchor: '-100%, 0',     bgSide: 'right', primary: ['.edge-02', '.edge-04'], secondary: ['.edge-01', '.edge-03'] },
        6: { anchor: '-100%, -100%', bgSide: 'right', primary: ['.edge-02', '.edge-04'], secondary: ['.edge-01', '.edge-03'] }
    };

    const Easing = {
        linear:   (t) => t,
        outQuad:  (t) => t * (2 - t),
        outCubic: (t) => 1 - Math.pow(1 - t, 3),
        outQuart: (t) => 1 - Math.pow(1 - t, 4),
        outExpo:  (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
        inQuad:   (t) => t * t,
        inCubic:  (t) => t * t * t,
        inQuart:  (t) => t * t * t * t
    };

    const VOLUME_THRESHOLD = 150;
    const GATE_HOLD_TIME = 2000;
    const VOLUME_DEBUG = true;
    let currentVolumeLevel = 0;
    let gateOpenUntil = 0;

    /*--EQ Config----------------------------*/

    const eqConfig = {
        volumeSensitivity: 4,
        idleAmplitude: 100,
        baseFlowSpeed: 0.2,
        flowSpeedBoost: 0.01,
        lines: [
            { sens: 1.2, speed: 0.05,  freq: 2.0, phase: 0,           strokeWidth: 2,   opacity: 1.0 },
            { sens: 0.8, speed: 0.03,  freq: 1.5, phase: Math.PI / 2, strokeWidth: 1.5, opacity: 0.8 },
            { sens: 0.5, speed: 0.02,  freq: 2.5, phase: Math.PI,     strokeWidth: 1,   opacity: 0.6 },
            { sens: 0.3, speed: 0.015, freq: 1.8, phase: Math.PI / 4, strokeWidth: 1.5, opacity: 0.4 },
            { sens: 0.1, speed: 0.01,  freq: 1.8, phase: Math.PI / 3, strokeWidth: 1.5, opacity: 0.2 }
        ]
    };

    /*--Puzzle Config------------------------*/

    const puzzleConfig = {
        spinDelay: 1500,
        rotationSpeed: 2000
    };

    const physicsConfig = {
        explosionForceY: -2,
        explosionForceX: 8,
        explosionSpin: 0.2
    };

    /*--Poem Config--------------------------*/

    const poemAppear = {
        initialDelay: 2000,
        wordStagger: 100
    };

    const poemDisappear = {
        wordStagger: 50
    };

    /*--Replacements-------------------------*/

    const stopWords = [
        "a","az","egy","és","de","hogy","ha","is","vagy","mert",
        "mint","meg","csak","akkor","most","majd","így","úgy",
        "itt","ott","ami","aki","ez","azt","ezt","arra","erre",
        "vele","rá","pedig","tehát","hát","na","nos","ugye",
        "amúgy","egyébként","igazából","gyakorlatilag","konkrétan",
        "szóval","valójában","persze","igen","jah","ja",
        "aha","öö","őő","ööö","hm","hmm","olyan","milyen",
        "ezek","azok","ebből","abból","valami","semmi","mind","ahogy",
        "e","ő","ö","ü","á","é","i","o","u",
        "én","te","ő","mi","ti","ők","az","ez",
        "fel","le","be","ki","el","át","rá","ide","oda",
        "nem","sem","se","se","már","még","bár","sőt",
        "talán","inkább","mindig","soha","sosem","néha",
        "épp","pont","éppen","szinte","nagyon","igen","nem"
    ];

    const profanities = [
        "fasz", "geci", "kurva", "szar", "basz", "bazd",
        "picsa", "pina", "pöcs", "köcsög", "lófasz", "kurafi",
        "rohadék", "rohad", "segg", "szopj", "szopo",
        "dug", "kúr", "idióta", "barom", "bunkó", "gyökér",
        "retard", "nyomorék", "féreg", "szemét", "takony", "taknyos",
        "buzi", "ribanc", "ringyó", "mocsok", "mocskos",
        "dögölj", "elpusztul", "hülye", "csicska", "büdös", "punci",
        "fuck", "motherfuck", "shit", "bitch", "cunt", "asshole",
        "dick", "pussy", "slut", "whore", "nigga", "nigger",
        "faggot", "bastard", "crap", "piss", "wank", "bollocks", "hoe"
    ];

    const easterEggs = {
        "banyek": ");",
        "bau":    ":o",
        "baú":    ":o",
        "balls":  ":3",
        "ballz":  ":3",
        "bebúr":  ":+",
        "bebur":  ":+"
    };

    const cuteWords = [
        "cica", "kiskutya", "nyuszi", "pillangó", "őzike",
        "süni", "mókus", "katicabogár", "kismadár", "méhecske",
        "virág", "tulipán", "napsugár", "csillag", "felhő",
        "szivárvány", "hajnal", "tavasz", "harmatcsepp", "hópehely",
        "szellő", "holdfény", "cseresznyevirág",
        "fagyi", "vattacukor", "habcsók", "palacsinta", "eper",
        "málna", "csokoládé", "méz", "süti",
        "szeretet", "aranyos", "cuki", "mosoly", "ölelés",
        "boldogság", "csoda", "varázslat","kacagás", "álom",
        "harmónia", "ragyogás"
    ];

    function removeAccents(str) {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    function matchesHungarian(poemWord, recognizedWord) {
        const cleanPoem = removeAccents(poemWord.toLowerCase());
        const cleanRoot = removeAccents(recognizedWord.toLowerCase());

        if (cleanPoem === cleanRoot) return true;
        if (!cleanPoem.startsWith(cleanRoot)) return false;

        const suffix = cleanPoem.slice(cleanRoot.length);
        if (suffix.length === 0 || suffix.length > 7) return false;

        // Ismert magyar grammatikai toldal\u00e9kok (eset, sz\u00e1m, birtok, igei szem\u00e9lyrag)
        return /^(a|e|at|et|ot|ot|ak|ek|ok|ok|kat|ket|oket|k|t|m|d|n|on|en|on|nak|nek|ban|ben|ba|be|bol|bol|ra|re|rol|rol|tol|tol|nal|nel|hoz|hez|hoz|ig|ert|val|vel|va|ve|kent|ul|ul|nk|unk|unk|uk|uk|om|em|om|od|ed|od|ja|je|tok|tek|tok|juk|juk|atok|etek|otok|im|id|ink|ik|itek|janak|jatol|jabol|jara|jarol|janal|jaban|jahoz|jaert|javal|tt|ott|ett|ott|unk|unk)$/.test(suffix);
    }

    /*--UFO Plugin---------------------------*/

    let physicsActive = false;

    (function ($) {
        $.fn.ufo = function () {
            return this.each(function (i, item) {
                let me = $(item);
                    function adjust() {
                    // Do not move elements on static resize if physics or puzzle is active
                    if (physicsActive || $('#puzzle-parking').hasClass('is-spinning')) return;

                    let pid     = 'h' + me.attr('data-parent');
                    let $parent = $('#' + pid);

                    if (!$parent.length) return;
                    let targetPos  = $parent.find('.target').offset();
                    let nativeEl   = document.getElementById(pid);

                    if (!nativeEl) return;
                    let tr = window.getComputedStyle(nativeEl, null).getPropertyValue('transform');

                    me.css({
                        top:    targetPos.top,
                        left:   targetPos.left,
                        width:  $parent.width(),
                        height: $parent.height(),
                        transform: tr
                    });
                }
                $(window).on('resize.ufo', function () { setTimeout(adjust, 3); });
                adjust();
            });
        };
    })(jQuery);

    $('.ufo').ufo();

    /*--Audio Visualizer---------------------*/

    let audioCtx = null;
    let analyser = null;
    let dataArray = null;
    let eqCurrentVol = 0;
    let eqTargetSens = 0;
    let eqCurrentSens = 0;
    let audioStream = null;

    let eqCanvas = null;
    let eqCtx = null;

    const eqPhases = eqConfig.lines.map(l => l.phase);

    function initEqCanvas() {
        eqCanvas = document.getElementById('eq-canvas');
        if (!eqCanvas) return;
        eqCtx = eqCanvas.getContext('2d');
        eqCanvas.width = window.innerWidth;
        eqCanvas.height = window.innerHeight;
    }

    $(window).on('resize.eq', function() {
        if (eqCanvas) {
            eqCanvas.width = window.innerWidth;
            eqCanvas.height = window.innerHeight;
        }
    });

    initEqCanvas();

    let eqRafId = null;
    function startEqDraw() {
        if (!eqRafId) eqRafId = requestAnimationFrame(drawEqualizer);
    }

    async function initAudioEq() {
        if (audioCtx && audioStream && audioStream.active) return;

        try {
            audioStream = await navigator.mediaDevices.getUserMedia({
            audio: {
            autoGainControl: false,
            echoCancellation: false,
            noiseSuppression: false
                }
            });

            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioCtx.createAnalyser();
                analyser.fftSize = 256;
                dataArray = new Uint8Array(analyser.frequencyBinCount);
            }

            const source = audioCtx.createMediaStreamSource(audioStream);
            source.connect(analyser);
            startEqDraw();
        } catch (err) {
            console.warn("EQ Microphone error:", err);
        }
    }

    function drawEqualizer() {
        let rawVol = 0;
        if (analyser && dataArray) {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            let currentMax = 0;

            for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
                if (dataArray[i] > currentMax) currentMax = dataArray[i];
            }
            rawVol = sum / dataArray.length;

            currentVolumeLevel = currentMax;

            if (currentMax >= VOLUME_THRESHOLD) {
                gateOpenUntil = Date.now() + GATE_HOLD_TIME;
            }
        }

        eqCurrentSens += (eqTargetSens - eqCurrentSens) * 0.03;
        eqCurrentVol += (rawVol - eqCurrentVol) * 0.15;

        if (eqTargetSens === 0 && eqCurrentSens < 0.01) {
            eqCurrentSens = 0;
            if (eqCtx) eqCtx.clearRect(0, 0, eqCanvas.width, eqCanvas.height);
            eqRafId = requestAnimationFrame(drawEqualizer);
            return;
        }

        if (!eqCtx) {
            eqRafId = null;
            return;
        }

        const w = eqCanvas.width;
        const h = eqCanvas.height;
        const midY = h / 2;

        const baseAmplitude = (eqConfig.idleAmplitude + (eqCurrentVol * eqConfig.volumeSensitivity)) * eqCurrentSens;
        const currentFlowSpeed = eqConfig.baseFlowSpeed + (eqCurrentVol * eqConfig.flowSpeedBoost);

        eqCtx.clearRect(0, 0, w, h);

        eqConfig.lines.forEach((line, index) => {
            eqPhases[index] += line.speed * currentFlowSpeed;

            const points = 50;

            eqCtx.save();
            eqCtx.globalAlpha = line.opacity;
            eqCtx.strokeStyle = '#ffffff';
            eqCtx.lineWidth = line.strokeWidth;
            eqCtx.setLineDash([6, 8]);
            eqCtx.beginPath();

            for (let i = 0; i <= points; i++) {
                const x = (i / points) * w;
                const normalizedX = i / points;
                const edgeTaper = Math.sin(normalizedX * Math.PI);
                const y = midY + Math.sin(normalizedX * Math.PI * line.freq + eqPhases[index]) * baseAmplitude * line.sens * edgeTaper;
                if (i === 0) { eqCtx.moveTo(x, y); } else { eqCtx.lineTo(x, y); }
            }

            eqCtx.stroke();
            eqCtx.restore();
        });

        eqRafId = requestAnimationFrame(drawEqualizer);
    }


    /*--Speech Lines-------------------------*/

    const $speechLines = {};
    for (let i = 1; i <= 6; i++) {
        const $line = $('<div class="speech-line" data-ufo="' + i + '"></div>');
        $('body').append($line);
        $speechLines[i] = $line;
    }

    let speechRaf = null;
    let visibleLineCount = 0;
    const lineData = {};
    let recognizedWords = [];
    let aiEmotionData = {};

    function getCubeCenter(ufoIndex) {
        const cube = $('.ufo[data-parent="' + ufoIndex + '"]').find('.ufo-cube')[0];
        if (!cube) return null;
        const rect = cube.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }

    function trackSpeechLines() {
        const now = performance.now();
        let anyActive = false;

        // Batch all DOM reads first to avoid interleaved read/write reflows
        const centers = {};
        for (let i = 1; i <= 6; i++) {
            const data = lineData[i];
            if (data && data.active) {
                anyActive = true;
                centers[i] = getCubeCenter(i);
            }
        }

        for (let i = 1; i <= 6; i++) {
            const data = lineData[i];
            if (!data || !data.active) continue;

            const lineEl = $speechLines[i][0];
            const center = centers[i];

            // Track cube center every frame so the line origin follows recoil and idle rotation
            if (center) {
                const dx = data.endX - center.x;
                const dy = data.endY - center.y;
                data.angleDeg = (Math.atan2(dy, dx) * 180 / Math.PI) - 90;
                lineEl.style.top    = center.y + 'px';
                lineEl.style.left   = center.x + 'px';
                lineEl.style.height = Math.sqrt(dx * dx + dy * dy) + 'px';
            }

            let t = (now - data.startTime) / speechConfig.duration;
            if (t > 1) t = 1;
            if (t < 0) t = 0;

            let eased;
            if (data.closing) {
                const easingFunc = Easing[speechConfig.easingClose] || Easing.inCubic;
                eased = 1 - easingFunc(t);
            } else {
                const easingFunc = Easing[speechConfig.easingOpen] || Easing.outCubic;
                eased = easingFunc(t);
            }

            lineEl.style.transform = `rotate(${data.angleDeg}deg) scaleY(${eased})`;
            lineEl.style.opacity = eased > 0.05 ? '1' : '0';

            if (data.closing && t >= 1) {
                data.active = false;
                lineEl.style.opacity = '0';
                lineEl.style.transform = `rotate(${data.angleDeg}deg) scaleY(0)`;
            }
        }

        if (anyActive) {
            speechRaf = requestAnimationFrame(trackSpeechLines);
        } else {
            speechRaf = null;
        }
    }

    function showNextSpeechLine(spokenWord = "HELLO") {

        if (visibleLineCount >= 6) return;

        recognizedWords.push(spokenWord);
        console.log(`Collected word (${recognizedWords.length}/6):`, recognizedWords);

        if (recognizedWords.length === 6) {
            // Trigger AI processing function (Defined at the bottom)
            if (typeof processAIPrompt === 'function') processAIPrompt(recognizedWords);

            // AUTOMATION HOOK: All 6 words collected
            if (typeof Automation !== 'undefined') Automation.onWordsCollected();
        }

        visibleLineCount++;
        const i = visibleLineCount;

        $(`#text-box-${i} p`).text(spokenWord);

        const center = getCubeCenter(i);
        if (!center) return;

        const angleRad = speechAngles[i] * Math.PI / 180;
        const dirY = Math.cos(angleRad);
        const boxH = $(`#text-box-${i}`).outerHeight() || 0;
        const fixEndY = dirY > 0
            ? window.innerHeight - SPEECH_MARGIN - boxH
            : SPEECH_MARGIN + boxH;
        const fullLength = Math.max(0, Math.abs((fixEndY - center.y) / Math.abs(dirY)));
        const fixEndX = center.x - Math.sin(angleRad) * fullLength;

        const ldx = fixEndX - center.x;
        const ldy = fixEndY - center.y;
        const lineMaxLen = Math.sqrt(ldx * ldx + ldy * ldy);
        const lineAngleDeg = (Math.atan2(ldy, ldx) * 180 / Math.PI) - 90;

        const lineEl = $speechLines[i][0];
        lineEl.style.top = center.y + 'px';
        lineEl.style.left = center.x + 'px';
        lineEl.style.height = lineMaxLen + 'px';
        lineEl.style.transform = `rotate(${lineAngleDeg}deg) scaleY(0)`;
        lineEl.style.opacity = '1';

        lineData[i] = {
            active: true,
            closing: false,
            endX: fixEndX,
            endY: fixEndY,
            angleDeg: lineAngleDeg,
            startTime: performance.now()
        };

        const recoilX = Math.sin(angleRad) * speechConfig.recoilDist;
        const recoilY = -Math.cos(angleRad) * speechConfig.recoilDist;

        let $currentUfo = $('.ufo[data-parent="' + i + '"]');

        $currentUfo.css({
            '--recoil-x': recoilX + 'px',
            '--recoil-y': recoilY + 'px',
            '--recoil-dur': speechConfig.recoilDur,
            '--recoil-ease': speechConfig.recoilEase
        });

        $currentUfo.addClass('ufo-active-speech');
        $currentUfo.find('.ufo-circle').addClass('ufo-circle-active');

        if (!speechRaf) {
            speechRaf = requestAnimationFrame(trackSpeechLines);
        }

        setTimeout(function() {
            if (lineData[i] && lineData[i].closing) return; // Safety break

            const config = textBoxConfig[i];
            const $box = $(`#text-box-${i}`);

            $box.css({
                left: fixEndX,
                top: fixEndY,
                transform: `translate(${config.anchor})`
            });

            $box.find('.floating-background').css({
                left: config.bgSide === 'left' ? '0' : 'auto',
                right: config.bgSide === 'right' ? '0' : 'auto'
            });

            $box.find(config.primary.join(', ')).addClass('floating-cube-appear');

            setTimeout(function() {
                if (lineData[i] && lineData[i].closing) return; // Safety break
                $box.find('.floating-background').addClass('floating-background-appear');
                $box.find('p').addClass('floating-text-p-appear');

                setTimeout(function() {
                    if (lineData[i] && lineData[i].closing) return; // Safety break
                    $box.find(config.secondary.join(', ')).addClass('floating-cube-appear');
                }, 700);

            }, 200);

        }, speechConfig.duration);
    }

    function retractSpeechLines(callback) {
        if (visibleLineCount === 0) {
            if (callback) callback();
            return;
        }

        for (let i = 1; i <= visibleLineCount; i++) {
            const config = textBoxConfig[i];
            const $box = $(`#text-box-${i}`);

            $box.find(config.secondary.join(', ')).removeClass('floating-cube-appear');

            setTimeout(function() {
                $box.find('p').removeClass('floating-text-p-appear');
                $box.find('.floating-background').removeClass('floating-background-appear');

                setTimeout(function() {
                    $box.find(config.primary.join(', ')).removeClass('floating-cube-appear');
                }, 700);
            }, 200);
        }

        setTimeout(function() {
            const now = performance.now();
            for (let i = 1; i <= 6; i++) {
                if (lineData[i] && lineData[i].active && !lineData[i].closing) {
                    lineData[i].closing = true;
                    lineData[i].startTime = now;
                }
            }

            $('.ufo').css({ '--recoil-x': '0px', '--recoil-y': '0px' });

            if (!speechRaf) {
                speechRaf = requestAnimationFrame(trackSpeechLines);
            }

            setTimeout(function () {
                visibleLineCount = 0;
                if (callback) callback();
            }, speechConfig.duration + 50);

        }, 900);
    }

    function handleSpeechButton() {
        if (currentPhase !== 'spaced') return;
        showNextSpeechLine();
    }

    /*--Rotation-----------------------------*/

    const SPEED = 700;
    let idleTimers = {};

    function stopIdleRotation() {
        for (let key in idleTimers) {
            clearTimeout(idleTimers[key]);
        }
        idleTimers = {};
        $('.ufo').removeClass('idle-mode');
    }

    function startIdleRotation() {
        $('.ufo').each(function () {
            const $ufo  = $(this);
            const index = parseInt($ufo.attr('data-parent'));
            const base  = ufoBaseRotations[index] || 0;
            const delay = parseFloat($ufo.css('--delay') || 0) * 1000;

            idleTimers[index] = setTimeout(function () {
                $ufo.addClass('idle-mode');
                function tick() {
                    if (currentPhase !== 'spaced') return;
                    const swing  = (Math.random() * idleSwingRange * 2) - idleSwingRange;
                    const newRot = base + swing;
                    ufoCurrentRotation[index] = newRot;
                    $ufo.css('--rotation', newRot + 'deg');
                    idleTimers[index] = setTimeout(tick, 2500 + Math.random() * 800);
                }
                tick();
            }, SPEED + delay);
        });
    }

    function applyRotationForPhase(phase) {
        stopIdleRotation();

        if (phase === 'hidden' || phase === 'puzzle') {
            $('.ufo').each(function () {
                const index = parseInt($(this).attr('data-parent'));
                ufoCurrentRotation[index] = 0;
                $(this).css('--rotation', '0deg');
            });
        } else if (phase === 'spaced') {
            $('.ufo').each(function () {
                const index = parseInt($(this).attr('data-parent'));
                const base  = ufoBaseRotations[index] || 0;
                ufoCurrentRotation[index] = base;
                $(this).css('--rotation', base + 'deg');
            });
            startIdleRotation();
        }
    }

    /*--Puzzle Animation---------------------*/

    let puzzleTrackingRaf = null;
    let puzzleLastTrackTime = 0;
    let puzzleSwapTimeout = null;
    let puzzleStartSpinTimeout = null;
    let puzzleUfoCache = [];
    let puzzleParkingCenter = { x: 0, y: 0 };

    function buildPuzzleUfoCache() {
        puzzleUfoCache = [];

        const parkingEl = document.getElementById('puzzle-parking');
        const parkingRect = parkingEl.getBoundingClientRect();
        puzzleParkingCenter = {
            x: parkingRect.left + parkingRect.width  / 2,
            y: parkingRect.top  + parkingRect.height / 2
        };

        document.querySelectorAll('.ufo').forEach(function(el) {
            const index = parseInt(el.getAttribute('data-parent'));
            const parentEl = document.getElementById('h' + index);
            if (!parentEl) return;
            const targetEl = parentEl.querySelector('.target');
            if (!targetEl) return;

            const targetRect = targetEl.getBoundingClientRect();
            const tcx = targetRect.left + targetRect.width  / 2;
            const tcy = targetRect.top  + targetRect.height / 2;

            puzzleUfoCache.push({
                el,
                index,
                w: parentEl.offsetWidth,
                h: parentEl.offsetHeight,
                baseLeft: parseFloat(el.style.left) || 0,
                baseTop:  parseFloat(el.style.top)  || 0,
                relX: tcx - puzzleParkingCenter.x,
                relY: tcy - puzzleParkingCenter.y
            });
        });
    }

    function getRotation(el) {
        if (!el) return 0;
        const st = window.getComputedStyle(el, null);
        const tr = st.getPropertyValue("transform");
        if (tr === 'none' || !tr) return 0;
        const values = tr.split('(')[1].split(')')[0].split(',');
        return Math.atan2(parseFloat(values[1]), parseFloat(values[0])) * (180 / Math.PI);
    }

    function trackPuzzleMovement(time) {
        if (currentPhase !== 'puzzle') return;

        puzzleLastTrackTime = time;

        const parentAngle = getRotation(document.getElementById('puzzle-parking'));
        const rad = parentAngle * Math.PI / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);

        for (let i = 0; i < puzzleUfoCache.length; i++) {
            const item = puzzleUfoCache[i];
            const rotX = item.relX * cos - item.relY * sin;
            const rotY = item.relX * sin + item.relY * cos;
            const targetLeft = puzzleParkingCenter.x + rotX - item.w / 2;
            const targetTop  = puzzleParkingCenter.y + rotY - item.h / 2;

            ufoCurrentRotation[item.index] = parentAngle;
            item.el.style.transform = `translate(${targetLeft - item.baseLeft}px, ${targetTop - item.baseTop}px)`;
            item.el.style.setProperty('--rotation', parentAngle + 'deg');
        }

        puzzleTrackingRaf = requestAnimationFrame(trackPuzzleMovement);
    }

    function doPuzzleSwap() {
        if (currentPhase !== 'puzzle') return;

        let indices = [1, 2, 3, 4, 5, 6].sort(() => 0.5 - Math.random());
        let activeOnes = indices.slice(0, 3);

        $('.ufo').removeClass('ufo-active-speech');
        $('.ufo .ufo-circle').removeClass('ufo-circle-active');

        activeOnes.forEach(i => {
            let $ufo = $('.ufo[data-parent="' + i + '"]');
            $ufo.addClass('ufo-active-speech');
            $ufo.find('.ufo-circle').addClass('ufo-circle-active');
        });
    }

    $('#puzzle-parking').on('animationiteration', function() {
        puzzleSwapTimeout = setTimeout(doPuzzleSwap, puzzleConfig.rotationSpeed / 2);
    });

    function startPuzzlePhase() {
        puzzleStartSpinTimeout = setTimeout(() => {
            if (currentPhase !== 'puzzle') return;

            $('.ufo').addClass('ufo-puzzle-tracking');

            buildPuzzleUfoCache();

            $('#puzzle-parking').css('animation-duration', puzzleConfig.rotationSpeed + 'ms');
            $('#puzzle-parking').addClass('is-spinning');

            puzzleLastTrackTime = performance.now();
            puzzleTrackingRaf = requestAnimationFrame(trackPuzzleMovement);

            puzzleSwapTimeout = setTimeout(doPuzzleSwap, puzzleConfig.rotationSpeed / 2);

        }, puzzleConfig.spinDelay);
    }

    function stopPuzzlePhase() {
        $('.ufo').removeClass('ufo-puzzle-tracking');
        $('#puzzle-parking').removeClass('is-spinning');
        $('#puzzle-parking').css('animation-duration', '');

        clearTimeout(puzzleStartSpinTimeout);
        clearTimeout(puzzleSwapTimeout);
        cancelAnimationFrame(puzzleTrackingRaf);
        $('.ufo').css('transform', '');
        $('.ufo').removeClass('ufo-active-speech');
        $('.ufo .ufo-circle').removeClass('ufo-circle-active');
    }

    /*--Phase Switching----------------------*/

    const parkingPrefix = { hidden: 'a', spaced: 'b', puzzle: 'c', emotion: 'a' };

    let spacedPhaseReadyTime = 0;

    function updateSpeechButtonState() {
        if (currentPhase === 'physics') {
            $('.button-step06').removeClass('button-disabled');
        } else {
            $('.button-step06').addClass('button-disabled');
        }

        if (currentPhase === 'emotion') {
            $('.button-step05').addClass('button-disabled');
        } else {
            $('.button-step05').removeClass('button-disabled');
        }
    }

    function doSwitchPhase(newPhase) {

        if (newPhase === 'hidden' || newPhase === 'spaced') {
            recognizedWords = [];
            aiEmotionData = {};
            console.log(`Memory cleared (${newPhase} phase).`);
        }

        if ((newPhase === 'hidden' || newPhase === 'spaced' || newPhase === 'puzzle') &&
            (poemIsVisible || $('#poem .word.word-active').length > 0)) {
            resetPoem(function() {
                finalizePhaseSwitch(newPhase);
            });
        } else {
            finalizePhaseSwitch(newPhase);
        }
    }

    function finalizePhaseSwitch(newPhase) {
        cancelAnimationFrame(speechRaf);
        cancelAnimationFrame(emotionLinesRaf);

        if (newPhase === 'hidden') {
            StateManager.reset();
            StateManager.hideBrackets();
            $('#logo').removeClass('header-element-active');
            setTimeout(function() { $('#current-volume').removeClass('header-element-active'); }, 100);
        } else if (newPhase === 'spaced') {
            StateManager.showBrackets(function() {
                StateManager.startListening();
            });
            setTimeout(function() { $('#logo').addClass('header-element-active'); }, 100);
            setTimeout(function() { $('#current-volume').addClass('header-element-active'); }, 250);
        } else if (newPhase === 'physics') {
            // Remove stuck puzzle states
            $('.puzzlePhase').each(function() { StateManager.hide($(this)); });
        }

        if (currentPhase === 'puzzle') {
            stopPuzzlePhase();
        }

        if (newPhase === 'physics') {
            stopIdleRotation();

            $('#eq-container').removeClass('is-active-eq');
            eqTargetSens = 0;

            if (currentPhase !== 'physics') {
                let oldPrefix = parkingPrefix[currentPhase];
                for (let i = 1; i <= 6; i++) {
                    $('#h' + i).attr('id', oldPrefix + i);
                }
            }
            currentPhase = 'physics';
            activatePhysics();
            updateSpeechButtonState();

            setTimeout(() => {
                if (currentPhase === 'physics') {
                    animatePoem();
                }
            }, poemAppear.initialDelay);

            return;
        }

        if (currentPhase === 'physics') {
            deactivatePhysics();
        }

        let oldPrefix = currentPhase === 'physics' ? null : parkingPrefix[currentPhase];
        let newPrefix = parkingPrefix[newPhase];

        if (oldPrefix !== null) {
            for (let i = 1; i <= 6; i++) {
                $('#h' + i).attr('id', oldPrefix + i);
            }
        }
        for (let i = 1; i <= 6; i++) {
            $('#' + newPrefix + i).attr('id', 'h' + i);
        }

        currentPhase = newPhase;
        $(window).trigger('resize');
        applyRotationForPhase(newPhase);
        updateSpeechButtonState();

        if (newPhase === 'puzzle') {
            startPuzzlePhase();
            // AUTOMATION HOOK: Entered Puzzle phase
            if (typeof Automation !== 'undefined') Automation.onPuzzleStarted();
        }

        if (newPhase === 'spaced') {
            $('#eq-container').addClass('is-active-eq');
            eqTargetSens = 1;
            startEqDraw();
            spacedPhaseReadyTime = Date.now() + 1000;
        } else {
            $('#eq-container').removeClass('is-active-eq');
            eqTargetSens = 0;
        }

        if (newPhase === 'hidden' || newPhase === 'spaced') {
            if (appConfig.enableMic) {
                initAudioEq();
                if (recognition) {
                    try { recognition.start(); } catch(e) {}
                }
            }
        }

        if (newPhase === 'emotion') {
            setTimeout(() => {
                if (currentPhase === 'emotion') {
                    startEmotionPhase();
                }
            }, 300);
        }

        if (newPhase === 'hidden') {
            setTimeout(() => {
                if (currentPhase === 'hidden') {
                    $('.ufo').removeClass('ufo-active-speech');
                    $('.ufo .ufo-circle').removeClass('ufo-circle-active');
                    if (typeof Automation !== 'undefined') Automation.onHiddenStarted();
                }
            }, 1200);

        } else if (newPhase === 'spaced' && recognizedWords.length === 0) {
            $('.ufo').removeClass('ufo-active-speech');
            $('.ufo .ufo-circle').removeClass('ufo-circle-active');
        }
    }

    function switchPhase(newPhase) {
        if (currentPhase === newPhase) {
            if (currentPhase === 'spaced' && visibleLineCount > 0) {
                recognizedWords = [];
                aiEmotionData = {};
                processedWordCount = 0;

                console.log("Memory cleared (manual Spaced reset).");
                retractSpeechLines();

                setTimeout(() => {
                    if (currentPhase === 'spaced' && recognizedWords.length === 0) {
                        $('.ufo').removeClass('ufo-active-speech');
                        $('.ufo .ufo-circle').removeClass('ufo-circle-active');
                    }
                }, 1200);
            }
            return;
        }
        if (currentPhase === 'emotion') {
             retractEmotionLines(function() { doSwitchPhase(newPhase); });
             return;
        }

        if (visibleLineCount > 0) {
            retractSpeechLines(function () { doSwitchPhase(newPhase); });
        } else {
            doSwitchPhase(newPhase);
        }
    }

    /*--Physics Simulation-------------------*/

    let physicsEngine = null;
    let physicsRunner = null;
    let ufoBodies     = [];

    function activatePhysics() {
        physicsActive = true;
        $('.ufo').css('transition', 'opacity var(--speed) var(--ease)');
        $('.ufo').addClass('ufo-faded');

        const { Engine, Runner, Bodies, Body, Composite, Events } = Matter;
        physicsEngine = Engine.create();
        physicsEngine.world.gravity.y = 1.2;
        physicsRunner = Runner.create();
        ufoBodies = [];

        const $container = $('#physics-parking');
        const offset = $container.offset();
        const cLeft  = offset.left;
        const cTop   = offset.top;
        const cW     = $container.outerWidth();
        const cH     = $container.outerHeight();
        const pad    = 30;
        const T      = 100;

        Composite.add(physicsEngine.world, [
            Bodies.rectangle(cLeft + cW / 2,           cTop + cH + T / 2, cW, T,      { isStatic: true }),
            Bodies.rectangle(cLeft + pad - T / 2,      cTop + cH / 2,     T,  cH * 2, { isStatic: true }),
            Bodies.rectangle(cLeft + cW - pad + T / 2, cTop + cH / 2,     T,  cH * 2, { isStatic: true })
        ]);

        $('.ufo').each(function () {
            const $el   = $(this);
            const pos   = $el.offset();
            const w     = $el.width();
            const h     = $el.height();
            const index = parseInt($el.attr('data-parent'));

            const body = Bodies.rectangle(
                pos.left + w / 2, pos.top + h / 2, w, h,
                { restitution: 0.4, friction: 0.1, density: 0.05 }
            );

            const currentDeg = ufoCurrentRotation[index] || 0;
            Body.setAngle(body, currentDeg * (Math.PI / 180));
            Body.setAngularVelocity(body, (Math.random() - 0.5) * physicsConfig.explosionSpin);
            Body.setVelocity(body, {
                x: (Math.random() - 0.5) * physicsConfig.explosionForceX,
                y: physicsConfig.explosionForceY
            });
            ufoBodies.push({ dom: $el, body: body, w: w, h: h, index: index });
            Composite.add(physicsEngine.world, body);
        });

        Events.on(physicsEngine, 'afterUpdate', function () {
            ufoBodies.forEach(function (item) {
                const pos = item.body.position;
                const deg = item.body.angle * (180 / Math.PI);
                ufoCurrentRotation[item.index] = deg;
                const s = item.dom[0].style;
                s.left = (pos.x - item.w / 2) + 'px';
                s.top  = (pos.y - item.h / 2) + 'px';
                s.setProperty('--rotation', deg + 'deg');
            });
        });

        Runner.run(physicsRunner, physicsEngine);
    }

    function deactivatePhysics() {
        if (!physicsEngine) return;
        Matter.Runner.stop(physicsRunner);
        Matter.Engine.clear(physicsEngine);
        physicsEngine = null;
        physicsRunner = null;
        ufoBodies     = [];
        physicsActive = false;

        $('.ufo').each(function () {
            const index = parseInt($(this).attr('data-parent'));
            let rot = ufoCurrentRotation[index] || 0;
            rot = ((rot % 360) + 360) % 360;
            ufoCurrentRotation[index] = rot;
            $(this).css('--rotation', rot + 'deg');
        });

        document.body.offsetHeight;
        $('.ufo').css('transition', '');
        $('.ufo').removeClass('ufo-faded');
    }

    /*--Speech Recognition-------------------*/

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    let processedWordCount = 0;

    if (SpeechRecognition && appConfig.enableMic) {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'hu-HU';

        recognition.onresult = function(event) {

            let fullTranscript = '';
            let isCurrentFinal = false;

            for (let i = 0; i < event.results.length; i++) {
                fullTranscript += event.results[i][0].transcript + ' ';
                if (i === event.results.length - 1) {
                    isCurrentFinal = event.results[i].isFinal;
                }
            }

            let words = fullTranscript.trim().split(/\s+/).filter(w => w.length > 0);

            if (words.length < processedWordCount || words.length === 0) {
                processedWordCount = 0;
            }

            if (currentPhase !== 'spaced' || Date.now() < spacedPhaseReadyTime) {
                processedWordCount = words.length;
                return;
            }

            let stableWords = words;
            if (!isCurrentFinal && stableWords.length > 0) {
                stableWords = stableWords.slice(0, -1);
            }

           let newWordsToProcess = [];
            for (let i = processedWordCount; i < stableWords.length; i++) {
                let rawWord = stableWords[i];

                if (Date.now() > gateOpenUntil) {
                    console.log(`[Noise Gate] Rejected (closed) word "${rawWord}" (Vol ${Math.round(currentVolumeLevel)} / Thresh ${VOLUME_THRESHOLD})`);
                    processedWordCount++;
                    continue;
                }

                let cleanWord = rawWord.replace(/[.,!?;:—–]/g, '').toLowerCase();
                if (cleanWord.length <= 1) {
                    processedWordCount++;
                    continue;
                }
                let normalizedWord = removeAccents(cleanWord);

                if (easterEggs[cleanWord] !== undefined) {
                    if (visibleLineCount + newWordsToProcess.length < 6) {
                        newWordsToProcess.push(easterEggs[cleanWord]);
                        console.log(`[Easter Egg] "${cleanWord}" → "${easterEggs[cleanWord]}"`);
                    }
                    processedWordCount++;
                    continue;
                }

                let isStopWord = stopWords.includes(cleanWord) || stopWords.includes(removeAccents(cleanWord));

                let isProfanity = profanities.some(swear => {
                    let normalizedSwear = removeAccents(swear);
                    if (normalizedWord === normalizedSwear) return true;
                    if (!normalizedWord.startsWith(normalizedSwear)) return false;
                    const rest = normalizedWord.slice(normalizedSwear.length);
                    return /^(a|e|at|et|ot|ak|ek|ok|kat|ket|k|t|m|d|n|on|en|nak|nek|ban|ben|ba|be|bol|ra|re|rol|tol|nal|nel|hoz|hez|ig|ert|val|vel|va|ve|ul|nk|unk|uk|om|em|od|ed|ja|je|tok|tek|juk|atok|etek|im|id|ink|ik|itek|tt|ott|ett)$/.test(rest);
                });

                if (isProfanity) {
                    if (visibleLineCount + newWordsToProcess.length < 6) {
                        let randomCuteWord = cuteWords[Math.floor(Math.random() * cuteWords.length)];
                        newWordsToProcess.push(randomCuteWord);
                        console.log(`[Noise Gate] Collected (Censored) "${randomCuteWord}" (Original "${rawWord}", Vol ${Math.round(currentVolumeLevel)})`);
                    }
                }
                else if (!isStopWord) {
                    if (visibleLineCount + newWordsToProcess.length < 6) {
                        newWordsToProcess.push(rawWord);
                        console.log(`[Noise Gate] Collected "${rawWord}" (Vol ${Math.round(currentVolumeLevel)})`);
                    }
                }
                else {
                   console.log(`[Noise Gate] Filtered (Stop word) "${rawWord}" (Vol ${Math.round(currentVolumeLevel)})`);
                }

                processedWordCount++;
            }

            newWordsToProcess.forEach((word, index) => {
                setTimeout(() => {
                    if (visibleLineCount < 6) {
                        showNextSpeechLine(word);
                    }
                }, index * speechConfig.wordStaggerDelay);
            });
        };

        recognition.onend = function() {
            if (appConfig.enableMic) {
                try { recognition.start(); } catch(e) {}
            }
        };

        if (currentPhase === 'hidden' || currentPhase === 'spaced') {
            try { recognition.start(); } catch(e) {}
        }

    } else {
        if (!appConfig.enableMic) {
            console.log("Microphone disabled for testing (appConfig.enableMic = false).");
        } else {
            console.warn("Your browser does not support the Web Speech API. Please use Chrome!");
        }
    }

    /*--Poem Animation-----------------------*/

    function applyTypographyFix() {
        // Reset margins (safety break)
        $('#poem .word').css('margin-right', '');

        $('#poem .word').each(function() {
            let $art = $(this);
            let text = $art.text().trim().toLowerCase();

            // Strict typography rule for articles
            if (text === 'a' || text === 'az' || text === 'egy') {
                let $next = $art.next('.word');

                if ($next.length) {
                    // 1. Add a monospaced space to the right
                    $art.css('margin-right', '1ch');

                    // 2. Wrap them in a non-breaking twin container
                    $art.add($next).wrapAll('<span class="ufo-typo-twin" style="display: inline-block; white-space: nowrap;"></span>');
                }
            }
        });
    }

    function applyPoemStyles() {
        const matchedIndices = new Set();

        $('#poem .word').each(function() {
            let $word = $(this);
            if ($word.children('.floating-background').length > 0) return;

            let rawText = $word.text();
            let cleanText = rawText.replace(/[.,!?;:—–]/g, '').toLowerCase();

            const matchIndex = recognizedWords.findIndex(function(rw, idx) {
                return !matchedIndices.has(idx) && matchesHungarian(cleanText, rw);
            });

            if (matchIndex === -1) return;

            matchedIndices.add(matchIndex);

            $word.addClass('floating-match');
            $word.attr('data-match-index', matchIndex + 1);

            $word.html(`<span class="match-text">${rawText}</span>`);

            $word.append(`
                <div class="floating-cube edge-01"></div>
                <div class="floating-cube edge-02"></div>
                <div class="floating-cube edge-03"></div>
                <div class="floating-cube edge-04"></div>
                <div class="floating-background"></div>
            `);
        });
    }

    function animatePoem() {
    if (!recognizedWords.length) return;
        if (currentPhase !== 'physics') return;

        if (poemSplitInstance) {
            poemSplitInstance.revert();
        }

        poemSplitInstance = new SplitType('#poem', { types: 'words' });

        // Run typography fix first
        applyTypographyFix();

        applyPoemStyles();

        let totalWords = $('#poem .word').length;

        $('#poem .word').each(function(index) {
            let $word = $(this);

            setTimeout(() => {
                if (currentPhase !== 'physics') return;

                $word.addClass('word-active');

                if ($word.hasClass('floating-match')) {
                    setTimeout(() => {
                        if (currentPhase !== 'physics') return;
                        $word.find('.edge-01, .edge-03').addClass('floating-cube-appear');

                        setTimeout(() => {
                            if (currentPhase !== 'physics') return;
                            $word.find('.floating-background').addClass('floating-background-appear');

                            setTimeout(() => {
                                if (currentPhase !== 'physics') return;
                                $word.addClass('text-active');
                                $word.find('.edge-02, .edge-04').addClass('floating-cube-appear');
                            }, 300);

                        }, 150);

                    }, 200);
                }

                if (index === totalWords - 1) {
                    poemIsVisible = true;
                    // AUTOMATION HOOK: The poem is rendered
                    if (typeof Automation !== 'undefined') Automation.onPoemFinished();
                }
            }, index * poemAppear.wordStagger);
        });
    }

    let resizeTimer;
    $(window).on('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (poemSplitInstance && poemIsVisible) {
                poemSplitInstance.revert();
                poemSplitInstance.split();

                applyTypographyFix();
                applyPoemStyles();

                $('#poem .word').addClass('word-active');
                $('#poem .floating-match').addClass('text-active');
                $('#poem .floating-background').addClass('floating-background-appear');
                $('#poem .floating-cube').addClass('floating-cube-appear');
            }
        }, 300);
    });

    let poemResetTimer1;

    function resetPoem(callback) {
        if (!poemIsVisible || !$('#poem .word.word-active').length) {
             poemIsVisible = false;
             if (poemSplitInstance) {
                 poemSplitInstance.revert();
                 poemSplitInstance = new SplitType('#poem', { types: 'words' });
             }
             if (callback) callback();
             return;
        }

        poemIsVisible = false;
        clearTimeout(poemResetTimer1);

        $('#poem .floating-match').removeClass('text-active padding-active');
        $('#poem .floating-cube').removeClass('floating-cube-appear');
        $('#poem .floating-background').removeClass('floating-background-appear');

        poemResetTimer1 = setTimeout(() => {

            let $words = $('#poem .word');
            let totalWords = $words.length;

            $($words.get().reverse()).each(function(index) {
                let $word = $(this);

                setTimeout(() => {
                    $word.removeClass('word-active');

                    if (index === totalWords - 1) {
                        setTimeout(() => {
                            if (poemSplitInstance) {
                                poemSplitInstance.revert();
                                poemSplitInstance = new SplitType('#poem', { types: 'words' });
                            }
                            if (callback) callback();
                        }, 300);
                    }
                }, index * poemDisappear.wordStagger);
            });

        }, 400);
    }

    /*--Emotion Phase------------------------*/

    let emotionLinesRaf = null;
    let emotionLineData = {};
    let activeEmotionCount = 0;

    function getWordCubeCenter($word, edgeClass) {
        const cube = $word.find(edgeClass)[0];
        if (!cube) return null;
        const rect = cube.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    }

    function trackEmotionLines() {
        const now = performance.now();
        let anyActive = false;

        for (let i = 1; i <= 6; i++) {
            const data = emotionLineData[i];
            if (!data || !data.active) continue;

            anyActive = true;

            if (now < data.startTime) continue;

            let t = (now - data.startTime) / speechConfig.duration;
            if (t > 1) t = 1;
            if (t < 0) t = 0;

            let eased = data.closing ? 1 - (Easing[speechConfig.easingClose] || Easing.inCubic)(t)
                                     : (Easing[speechConfig.easingOpen] || Easing.outCubic)(t);

            const lineEl = data.$line[0];
            lineEl.style.transform = `rotate(${data.angleDeg}deg) scaleY(${eased})`;
            lineEl.style.opacity = eased > 0.05 ? '1' : '0';

            if (data.closing && t >= 1) {
                data.active = false;
                lineEl.style.opacity = '0';
                lineEl.style.transform = `rotate(${data.angleDeg}deg) scaleY(0)`;
            }
        }

        if (anyActive) {
            emotionLinesRaf = requestAnimationFrame(trackEmotionLines);
        } else {
            emotionLinesRaf = null;
        }
    }

    function startEmotionPhase() {
        activeEmotionCount = 0;
        const wW = window.innerWidth;
        const wH = window.innerHeight;

        if (!$('#emotion-lines-holder').length) {
            $('body').append('<div id="emotion-lines-holder"></div>');
        }
        $('#emotion-lines-holder').empty();

        let placedBoxes = [];

        const pRect = document.getElementById('poem').getBoundingClientRect();
        const poemRect = {
            left: pRect.left - 20, right: pRect.right + 20,
            top: pRect.top - 20, bottom: pRect.bottom + 20
        };

        const dX = 0.5;
        const dY = 0.866;

        const RAYS = {
            TL: { edge: '.edge-01', anchor: '-100%, -100%', boxLeft: (x, w)=>x - w, boxTop: (y, h)=>y - h, bgSide: 'right', dirX: -dX, dirY: -dY, pCubes: ['.edge-02', '.edge-04'], sCubes: ['.edge-01', '.edge-03'] },
            TR: { edge: '.edge-02', anchor: '0, -100%',     boxLeft: (x, w)=>x,     boxTop: (y, h)=>y - h, bgSide: 'left',  dirX: dX,  dirY: -dY, pCubes: ['.edge-01', '.edge-03'], sCubes: ['.edge-02', '.edge-04'] },
            BL: { edge: '.edge-03', anchor: '-100%, 0', boxLeft: (x, w)=>x - w, boxTop: (y, h)=>y, bgSide: 'right', dirX: -dX, dirY: dY,  pCubes: ['.edge-02', '.edge-04'], sCubes: ['.edge-01', '.edge-03'] },
            BR: { edge: '.edge-04', anchor: '0, 0',     boxLeft: (x, w)=>x,     boxTop: (y, h)=>y, bgSide: 'left',  dirX: dX,  dirY: dY,  pCubes: ['.edge-01', '.edge-03'], sCubes: ['.edge-02', '.edge-04'] }
        };

        let delayCounter = 0;

        function getBoxRect(ray, startX, startY, len, w, h) {
            let endX = startX + ray.dirX * len;
            let endY = startY + ray.dirY * len;
            let left = ray.boxLeft(endX, w);
            let top = ray.boxTop(endY, h);
            return { left: left, right: left + w, top: top, bottom: top + h, endX: endX, endY: endY };
        }

        function checkCollision(rect, padding) {
            if (rect.left < 50 || rect.right > wW - 50 || rect.top < 50 || rect.bottom > wH - 50) return true;
            if (!(rect.left > poemRect.right || rect.right < poemRect.left || rect.top > poemRect.bottom || rect.bottom < poemRect.top)) return true;
            for (let pb of placedBoxes) {
                if (!(rect.left > pb.right + padding || rect.right < pb.left - padding ||
                      rect.top > pb.bottom + padding || rect.bottom < pb.top - padding)) {
                    return true;
                }
            }
            return false;
        }

        $('#poem .floating-match').each(function() {
            let $word = $(this);
            let index = parseInt($word.attr('data-match-index'));
            if (!index || index > 6) return;

            activeEmotionCount++;
            let $box = $(`#emotion-box-${index}`);

            let boxWidth = $box.outerWidth() || 160;
            let boxHeight = $box.outerHeight() || 100;

            let wordOffset = $word.offset();
            let isLeft = wordOffset.left < wW / 2;
            let isTop = wordOffset.top < wH / 2;

            let sequence = [];

            if (isTop && isLeft) {
                // Word is Top-Left. Priority: Top-Right -> Bottom-Right -> Top-Left -> Bottom-Left
                sequence = ['TR', 'BR', 'TL', 'BL'];
            } else if (isTop && !isLeft) {
                // Word is Top-Right. Priority: Top-Left -> Bottom-Left -> Top-Right -> Bottom-Right
                sequence = ['TL', 'BL', 'TR', 'BR'];
            } else if (!isTop && isLeft) {
                // Word is Bottom-Left. Priority: Bottom-Right -> Top-Right -> Bottom-Left -> Top-Left
                sequence = ['BR', 'TR', 'BL', 'TL'];
            } else {
                // Word is Bottom-Right. Priority: Bottom-Left -> Top-Left -> Bottom-Right -> Top-Right
                sequence = ['BL', 'TL', 'BR', 'TR'];
            }

            let finalSpot = null;

            // STEP 2: Try to reach the perfect 180px Top/Bottom margin (Ideal Length)
            for (let rayName of sequence) {
                let ray = RAYS[rayName];
                let center = getWordCubeCenter($word, ray.edge);
                if (!center) continue;

                let idealTargetY = (ray.dirY < 0) ? (SPEECH_MARGIN + boxHeight) : (wH - SPEECH_MARGIN - boxHeight);
                let idealLenY = (idealTargetY - center.y) / ray.dirY;

                let idealTargetX = (ray.dirX < 0) ? (50 + boxWidth) : (wW - 50 - boxWidth);
                let idealLenX = (idealTargetX - center.x) / ray.dirX;

                let idealLen = Math.min(idealLenY, idealLenX);
                if (idealLen < 40) idealLen = 40;

                let rectData = getBoxRect(ray, center.x, center.y, idealLen, boxWidth, boxHeight);

                // If it fits perfectly on the margin, lock it in and break the loop
                if (!checkCollision(rectData, 20)) {
                    finalSpot = { ray: ray, center: center, endX: rectData.endX, endY: rectData.endY, rect: rectData };
                    break;
                }
            }

            // STEP 3: If all perfect margins are full, pull back and slide shorter
            if (!finalSpot) {
                let bestDeviation = Infinity;
                let bestCandidate = null;

                for (let rayName of sequence) {
                    let ray = RAYS[rayName];
                    let center = getWordCubeCenter($word, ray.edge);
                    if (!center) continue;

                    let idealTargetY = (ray.dirY < 0) ? (SPEECH_MARGIN + boxHeight) : (wH - SPEECH_MARGIN - boxHeight);
                    let idealLenY = (idealTargetY - center.y) / ray.dirY;
                    let idealTargetX = (ray.dirX < 0) ? (50 + boxWidth) : (wW - 50 - boxWidth);
                    let idealLenX = (idealTargetX - center.x) / ray.dirX;
                    let idealLen = Math.min(idealLenY, idealLenX);
                    if (idealLen < 40) idealLen = 40;

                    let maxTargetY = (ray.dirY < 0) ? (50 + boxHeight) : (wH - 50 - boxHeight);
                    let maxLenY = (maxTargetY - center.y) / ray.dirY;
                    let maxValidLen = Math.min(maxLenY, idealLenX);

                    // Test incrementally shorter lengths to find the closest fit
                    for (let testLen = 40; testLen <= maxValidLen; testLen += 5) {
                        let rectData = getBoxRect(ray, center.x, center.y, testLen, boxWidth, boxHeight);

                        if (!checkCollision(rectData, 15)) {
                            let deviation = Math.abs(testLen - idealLen);
                            if (deviation < bestDeviation) {
                                bestDeviation = deviation;
                                bestCandidate = { ray: ray, center: center, endX: rectData.endX, endY: rectData.endY, rect: rectData };
                            }
                        }
                    }
                }
                if (bestCandidate) finalSpot = bestCandidate;
            }

            // STEP 4: Ultimate Fallback (If no space is found, force the first ray and allow overlap)
            if (!finalSpot) {
                let ray = RAYS[sequence[0]];
                let center = getWordCubeCenter($word, ray.edge);

                let idealTargetY = (ray.dirY < 0) ? (SPEECH_MARGIN + boxHeight) : (wH - SPEECH_MARGIN - boxHeight);
                let idealLenY = (idealTargetY - center.y) / ray.dirY;
                let idealTargetX = (ray.dirX < 0) ? (50 + boxWidth) : (wW - 50 - boxWidth);
                let idealLenX = (idealTargetX - center.x) / ray.dirX;
                let fallbackLen = Math.max(40, Math.min(idealLenY, idealLenX));

                let rectData = getBoxRect(ray, center.x, center.y, fallbackLen, boxWidth, boxHeight);
                finalSpot = { ray: ray, center: center, endX: rectData.endX, endY: rectData.endY, rect: rectData };
            }

            placedBoxes.push(finalSpot.rect);

            let delay = delayCounter * 300;
            delayCounter++;

            let $line = $('<div class="emotion-line"></div>');
            $('#emotion-lines-holder').append($line);

            const eDx = finalSpot.endX - finalSpot.center.x;
            const eDy = finalSpot.endY - finalSpot.center.y;
            const eMaxLen = Math.sqrt(eDx * eDx + eDy * eDy);
            const eAngleDeg = (Math.atan2(eDy, eDx) * 180 / Math.PI) - 90;

            const lineEl = $line[0];
            lineEl.style.top = finalSpot.center.y + 'px';
            lineEl.style.left = finalSpot.center.x + 'px';
            lineEl.style.height = eMaxLen + 'px';
            lineEl.style.transform = `rotate(${eAngleDeg}deg) scaleY(0)`;
            lineEl.style.opacity = '0';

            emotionLineData[index] = {
                active: true, closing: false,
                $line: $line,
                angleDeg: eAngleDeg,
                startTime: performance.now() + delay
            };

            if (!emotionLinesRaf) {
                emotionLinesRaf = requestAnimationFrame(trackEmotionLines);
            }

            setTimeout(function() {
                $box.css({
                    left: finalSpot.endX, top: finalSpot.endY,
                    transform: `translate(${finalSpot.ray.anchor})`
                });

                $box.find('.floating-background').css({
                    left: finalSpot.ray.bgSide === 'left' ? '0' : 'auto',
                    right: finalSpot.ray.bgSide === 'right' ? '0' : 'auto'
                });

                $box.find(finalSpot.ray.pCubes.join(', ')).addClass('floating-cube-appear');

                setTimeout(function() {
                    $box.find('.floating-background').addClass('floating-background-appear');
                    $box.find('p').addClass('floating-text-p-appear');

                    setTimeout(function() {
                        $box.find(finalSpot.ray.sCubes.join(', ')).addClass('floating-cube-appear');
                    }, 700);

                }, 200);

            }, delay + speechConfig.duration);
        });

        // AUTOMATION HOOK: Calculate the total emotion animation duration and schedule phase switch
        let totalEmotionAnimDuration = (activeEmotionCount * 300) + speechConfig.duration + 900;
        if (typeof Automation !== 'undefined') Automation.onEmotionFinished(totalEmotionAnimDuration);
    }

    function retractEmotionLines(callback) {
        if (activeEmotionCount === 0) {
            if (callback) callback();
            return;
        }

        for (let i = 1; i <= 6; i++) {
            const $box = $(`#emotion-box-${i}`);
            $box.find('.floating-cube').removeClass('floating-cube-appear');

            setTimeout(function() {
                $box.find('p').removeClass('floating-text-p-appear');
                $box.find('.floating-background').removeClass('floating-background-appear');
            }, 200);
        }

        setTimeout(function() {
            const now = performance.now();
            for (let i = 1; i <= 6; i++) {
                if (emotionLineData[i] && emotionLineData[i].active && !emotionLineData[i].closing) {
                    emotionLineData[i].closing = true;
                    emotionLineData[i].startTime = now;
                }
            }

            if (!emotionLinesRaf) {
                emotionLinesRaf = requestAnimationFrame(trackEmotionLines);
            }

            setTimeout(function () {
                activeEmotionCount = 0;
                $('#emotion-lines-holder').empty();
                if (callback) callback();
            }, speechConfig.duration + 50);

        }, 900);
    }

    /*--Buttons------------------------------*/

    document.fonts.ready.then(function () {
        if (!poemSplitInstance) {
            poemSplitInstance = new SplitType('#poem', { types: 'words' });
        }
    });

    updateSpeechButtonState();
    /*
    //BUTTON FUNCTIONS COMMENTED OUT FOR AUTOMATION:
    $('.button-step01').on('click', function () { switchPhase('hidden');  });
    $('.button-step02').on('click', function () { switchPhase('spaced');  });
    $('.button-step03').on('click', function () { handleSpeechButton();   });
    $('.button-step04').on('click', function () { switchPhase('puzzle');  });
    $('.button-step05').on('click', function () { switchPhase('physics'); });
    $('.button-step06').on('click', function () { switchPhase('emotion'); });
    */

    /*--Volume Debug-------------------------*/

    if (VOLUME_DEBUG) {
        $('#current-volume').css('display', 'flex');

        setInterval(() => {
            $('#current-volume p').eq(1).text(Math.round(currentVolumeLevel));
        }, 500);
    } else {
        $('#current-volume').hide();
    }

    /*--State Manager------------------------*/

    const StateManager = {
        puzzleTimers: [],
        countdownInterval: null,

        reset: function() {
            this.clearTimers();
            // Remove active and disabled classes from all labels
            $('.state').removeClass('state-active state-disable');
        },

        clearTimers: function() {
            this.puzzleTimers.forEach(t => clearTimeout(t));
            this.puzzleTimers = [];
            if(this.countdownInterval) clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        },

        show: function($el) {
            $el.removeClass('state-disable').addClass('state-active');
        },

        hide: function($el) {
            if($el.hasClass('state-active')) {
                $el.removeClass('state-active').addClass('state-disable');
            }
        },

        startListening: function() {
            this.show($('.spacedPhase'));
        },

        startPuzzleProcessing: function(totalTime) {
            this.hide($('.spacedPhase'));

            let $states = $('.puzzlePhase');
            let numStates = $states.length;
            if (numStates === 0) return;
            let minChunk = autoConfig.minStateDuration;
            let chunks = [];

            if (numStates * minChunk > totalTime) {
                chunks = Array(numStates).fill(totalTime / numStates);
            } else {
                let remaining = totalTime - (numStates * minChunk);
                let randoms = [];
                let rSum = 0;
                for(let i=0; i<numStates; i++) {
                    let r = Math.random();
                    randoms.push(r);
                    rSum += r;
                }
                chunks = randoms.map(r => minChunk + Math.floor((r / rSum) * remaining));
            }

            let cumulativeDelay = 0;
            $states.each((index, el) => {
                let $el = $(el);
                let duration = chunks[index];

                let t1 = setTimeout(() => {
                    if (currentPhase !== 'puzzle') return; // Safety break
                    if (index > 0) this.hide($states.eq(index - 1)); // Hide previous
                    this.show($el); // Show new
                }, cumulativeDelay);

                this.puzzleTimers.push(t1);
                cumulativeDelay += duration;
            });
        },

        startCountdown: function(totalMs) {
            let $el = $('.emotionPhase');
            let seconds = Math.ceil(totalMs / 1000);

            $el.text('Újrakezdés: ' + seconds);
            this.show($el);

            this.countdownInterval = setInterval(() => {
                seconds--;
                if(seconds <= 0) {
                    clearInterval(this.countdownInterval);
                    // Hide the number, keep only the text when it reaches 0
                    $el.text('Újrakezdés');
                } else {
                    $el.text('Újrakezdés: ' + seconds);
                }
            }, 1000);
        },
        showBrackets: function(callback) {
            $('.state-visual').css('opacity', 1);
            $('.state-visual-left').addClass('state-visual-left-active');
            $('.state-visual-right').addClass('state-visual-right-active');

            // Wait for the animation to finish
            setTimeout(callback, 800);
        },
        hideBrackets: function() {
            $('.state-visual-left').removeClass('state-visual-left-active');
            $('.state-visual-right').removeClass('state-visual-right-active');
        }
    };

    /*--Automation---------------------------*/

    const Automation = {
        timer: null,

        // Helper: clears previous timer and sets a new one
        schedule: function(phase, delay) {
            if (this.timer) clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                switchPhase(phase);
            }, delay);
        },

        // Hook 1: All 6 words collected (Spaced -> Puzzle)
        onWordsCollected: function() {
            if (autoConfig.enabled) {
                this.schedule('puzzle', autoConfig.spacedToPuzzle);
            }
        },

        // Hook 2: Entered Puzzle phase, waiting for API (Puzzle -> Physics)
        onPuzzleStarted: function() {
            if (autoConfig.enabled) {
                const timerPromise = new Promise(resolve => setTimeout(resolve, autoConfig.puzzleToPhysics));
                const safeApiPromise = apiReadyPromise || Promise.resolve();
                Promise.all([timerPromise, safeApiPromise]).then(() => {
                    if (currentPhase === 'puzzle') switchPhase('physics');
                });

                setTimeout(() => {
                    if (currentPhase === 'puzzle') {
                        let remainingTime = autoConfig.puzzleToPhysics - puzzleConfig.spinDelay;
                        if (remainingTime > 0) {
                            StateManager.startPuzzleProcessing(remainingTime);
                        }
                    }
                }, puzzleConfig.spinDelay);
            }
        },

        // Hook 3: Last word of the poem is visible (Physics -> Emotion)
        onPoemFinished: function() {
            if (autoConfig.enabled) {
                setTimeout(() => {
                    this.schedule('emotion', autoConfig.physicsToEmotion);
                }, 650);
            }
        },

        // Hook 4: All emotion boxes appeared (Emotion -> Hidden)
        onEmotionFinished: function(animDuration) {
            if (autoConfig.enabled) {
                this.schedule('hidden', animDuration + autoConfig.emotionToHidden);
                setTimeout(() => {
                    if(currentPhase === 'emotion') {
                        let remainingCountdown = autoConfig.emotionToHidden - autoConfig.countdownDelay;
                        if (remainingCountdown > 0) {
                            StateManager.startCountdown(remainingCountdown);
                        }
                    }
                }, animDuration + autoConfig.countdownDelay);
            }
        },

        // Hook 5: Returned to hidden phase, start next round (Hidden -> Spaced)
        onHiddenStarted: function() {
            if (autoConfig.enabled) {
                this.schedule('spaced', autoConfig.hiddenToSpaced);
            }
        },

        // Initial start
        start: function() {
            if (autoConfig.enabled) {
                this.onHiddenStarted();
            }
        }
    };

    // Start the automation engine immediately
    Automation.start();

    /*--AI API Setup-------------------------*/

    const aiPrompts = {
        combined: `Írj egy egyetlen bekezdésből álló, LEGALÁBB 50 és LEGFELJEBB 60 szavas költői verset az alábbi 6 szó felhasználásával, ÉS rendelj hozzájuk érzelmi adatokat a Russell-féle circumplex modell alapján.

SZIGORÚ SZABÁLYOK A VERSHEZ:
A vers szószáma KÖTELEZŐEN 50 és 60 közé kell essen. Mielőtt visszaadod a JSON-t, számold meg a vers szavait — ha kevesebb mint 50, bővítsd ki; ha több mint 60, rövidítsd le.
A megadott szavakat PONTOSAN az itt megadott formában kell felhasználnod! Tilos ragozni, tilos toldalékot tenni rájuk, és tilos igekötővel kiegészíteni őket. A versnek ezen nyelvi korlátok ellenére is értelmesnek kell lennie.

KIMENETI FORMÁTUM:
Kizárólag egy érvényes JSON objektumot adj vissza, semmi más szöveget, és ne használj markdown kódblokkot (ne írd ki, hogy \`\`\`json)!
KRITIKUS JSON SZABÁLY: Minden kulcsot és minden szöveges értéket DUPLA IDÉZŐJELBE kell írni! A számok (kellemesseg, aktivitas) maradhatnak idézőjel nélkül. Például: "erzelem": "boldogság" – TILOS: erzelem: boldogság
A JSON struktúrája PONTOSAN ez legyen:
{
"vers": "Itt szerepeljen a megírt vers szövege egyben...",
"erzelmek": {
    "szó1": { "erzelem": "Érzelem neve", "kellemesseg": 0.8, "aktivitas": 0.5 },
    "szó2": { "erzelem": "Érzelem neve", "kellemesseg": -0.4, "aktivitas": 0.1 }
}
}

Az "erzelmek" objektum kulcsai pontosan a megadott 6 szó letisztított (kisbetűs) formái legyenek. A kellemesség (valencia) és aktivitás (arousal) értéke -1.00 és +1.00 közötti szám legyen.

Szavak: (...), (...), (...), (...), (...), (...).`
    };

    let poetryTimer;
    let apiReadyPromise = null;

    // This function acts as the bridge for the API. It is called from the Speech Recognition logic.
    window.processAIPrompt = function(collectedWordsArray) {
        console.log("All words collected, preparing prompt...");

        // Load the template
        let finalPrompt = aiPrompts.combined;

        // Replace the 6 (...) placeholders with the spoken words
        collectedWordsArray.forEach(word => {
            finalPrompt = finalPrompt.replace('(...)', word);
        });

        console.log("---- AI PROMPT TO SEND ----");
        console.log(finalPrompt);
        console.log("---------------------------");

        let resolveApiReady;
        apiReadyPromise = new Promise(resolve => { resolveApiReady = resolve; });

        const networkTimeout = setTimeout(function() {
            console.warn('API timeout: no response after 60s');
            StateManager.show($('.stateNetworkError'));
            setTimeout(function() {
                resolveApiReady();
                switchPhase('hidden');
            }, 5000);
        }, 60000);

        function callPoetryAPI(attempt) {
            $.ajax({
                type: 'POST',
                url: 'res/AICall.php',
                data: { words: finalPrompt },
                dataType: 'json',
                success: function(response) {
                    clearTimeout(networkTimeout);
                    console.log('API response:', response);
                    if (response && response.vers) {
                        aiEmotionData = {};
                        if (response.erzelmek) {
                            recognizedWords.forEach(function(word, i) {
                                const key = word.toLowerCase();
                                const data = response.erzelmek[key];
                                if (data) {
                                    aiEmotionData[i + 1] = data;
                                    const $box = $('#emotion-box-' + (i + 1));
                                    $box.find('p').eq(0).text(data.erzelem || '');
                                    $box.find('p').eq(1).text('Kellemesség: ' + (data.kellemesseg !== undefined ? data.kellemesseg : ''));
                                    $box.find('p').eq(2).text('Aktivizáció: ' + (data.aktivitas !== undefined ? data.aktivitas : ''));
                                }
                            });
                        }
                        if (poemSplitInstance) poemSplitInstance.revert();
                        $('#poem').text(response.vers);
                        poemSplitInstance = new SplitType('#poem', { types: 'words' });
                    } else {
                        console.error('Unexpected API response format:', response);
                    }
                    resolveApiReady();
                },
                error: function(xhr, status, err) {
                    console.error('API error (attempt ' + attempt + '):', status, err);
                    if (attempt < 2) {
                        console.log('Retrying in 3s...');
                        setTimeout(function() { callPoetryAPI(attempt + 1); }, 3000);
                    } else {
                        clearTimeout(networkTimeout);
                        StateManager.show($('.stateApiError'));
                        setTimeout(function() {
                            resolveApiReady();
                            switchPhase('hidden');
                        }, 5000);
                    }
                }
            });
        }

        poetryTimer = setTimeout(function() {
            console.log('Poetry is to be generated');
            callPoetryAPI(1);
        }, 3000);

    };

});
