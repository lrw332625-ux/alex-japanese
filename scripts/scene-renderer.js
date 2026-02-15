/* Scene Renderer Engine for Alex Japanese Learning - Unified Layout v2 */
(function(){
'use strict';

var sceneData = null;
var currentScene = null;
var activeTab = 0;
var quizData = [];
var quizIdx = 0;
var quizScore = 0;
var speechRate = 1;
var playingAll = false;
var curEl = null;
var reviewed = {};
var sessionMark = {};
var _lid = '';
var _mh = {};
var _fl = 'cn';

function getSceneId(){
  return new URLSearchParams(window.location.search).get('id') || '';
}

function loadSceneData(cb){
  if(sceneData){ cb(sceneData); return; }
  fetch('../data/scenes.json')
    .then(function(r){ return r.json(); })
    .then(function(data){ sceneData = data; cb(data); })
    .catch(function(){
      document.getElementById('app').innerHTML = '<div style="text-align:center;padding:60px 20px;color:#7A7468">加载失败，请刷新重试</div>';
    });
}

// ============================================================
// SCENE LIST PAGE (scenes/index.html)
// ============================================================
window.renderSceneList = function(){
  loadSceneData(function(data){
    var container = document.getElementById('sceneList');
    if(!container) return;
    var html = '';
    data.scenes.forEach(function(s){
      html += '<a class="scene-card" href="scene.html?id=' + s.id + '" style="border-left:4px solid ' + s.color + '">';
      html += '<div class="scene-icon">' + s.icon + '</div>';
      html += '<div class="scene-info">';
      html += '<div class="scene-name">' + s.nameCn + '</div>';
      html += '<div class="scene-name-jp">' + s.name + ' <span style="font-weight:400;font-size:12px">' + s.nameKana + '</span></div>';
      html += '<div class="scene-desc">' + s.description + '</div>';
      html += '<div class="scene-stats">';
      html += '<span class="tag">' + s.vocabulary.length + '个词汇</span>';
      html += '<span class="tag">' + s.sentences.length + '个句子</span>';
      html += '<span class="tag">小测验</span>';
      html += '</div></div><div class="arrow">\u2192</div></a>';
    });
    container.innerHTML = html;
    if(typeof replaceEmojiWithImg === 'function') replaceEmojiWithImg();
  });
};

// ============================================================
// SCENE DETAIL PAGE
// ============================================================
window.renderScene = function(){
  var sceneId = getSceneId();
  if(!sceneId){
    document.getElementById('app').innerHTML = '<div style="text-align:center;padding:60px 20px">请从场景列表选择一个场景</div>';
    return;
  }
  loadSceneData(function(data){
    currentScene = null;
    for(var i = 0; i < data.scenes.length; i++){
      if(data.scenes[i].id === sceneId){ currentScene = data.scenes[i]; break; }
    }
    if(!currentScene){
      document.getElementById('app').innerHTML = '<div style="text-align:center;padding:60px 20px">场景不存在</div>';
      return;
    }

    _lid = 'scene_' + currentScene.id;
    _mh = JSON.parse(localStorage.getItem('marks_' + _lid) || '{}');
    _fl = localStorage.getItem('frontLang') || 'cn';

    document.getElementById('sceneTitle').textContent = currentScene.icon + ' ' + currentScene.nameCn;
    document.getElementById('sceneSubtitle').textContent = currentScene.name + ' ' + currentScene.nameKana;
    var hdr = document.getElementById('sceneHeader');
    if(hdr) hdr.style.background = currentScene.gradient;

    renderSceneTabs();
    switchSceneTab(0);
    if(typeof replaceEmojiWithImg === 'function') setTimeout(replaceEmojiWithImg, 100);
  });
};

// ============================================================
// MARK SYSTEM + STATS (same as lesson pages)
// ============================================================
function _eh(k){ if(!_mh[k]) _mh[k] = {total:0, ok:0}; }
function _sv(){ localStorage.setItem('marks_' + _lid, JSON.stringify(_mh)); }
function _gc(ratio){
  var r = Math.round(67 + (229-67)*(1-ratio));
  var g = Math.round(160 + (57-160)*(1-ratio));
  var b = Math.round(71 + (53-71)*(1-ratio));
  return 'rgb(' + r + ',' + g + ',' + b + ')';
}

function updateBadge(el){
  var k = el.getAttribute('data-k'); _eh(k); var h = _mh[k];
  el.querySelectorAll('.mark-badge').forEach(function(b){
    if(h.total > 0){ b.textContent = '\u5b66'+h.total+' \u5bf9'+h.ok; b.style.background = _gc(h.ok/h.total); b.classList.add('has-data'); }
    else { b.classList.remove('has-data'); }
  });
  el.querySelectorAll('.mark-ok').forEach(function(b){ b.classList.toggle('active', sessionMark[k]==='ok'); });
  el.querySelectorAll('.mark-ng').forEach(function(b){ b.classList.toggle('active', sessionMark[k]==='ng'); });
}

window.markOk = function(el, ev){
  if(ev){ ev.stopPropagation(); ev.preventDefault(); }
  var k = el.getAttribute('data-k'); _eh(k); var h = _mh[k];
  if(sessionMark[k]==='ok'){ h.total--; h.ok--; delete sessionMark[k]; }
  else { if(sessionMark[k]==='ng'){ h.ok++; } else { h.total++; h.ok++; } sessionMark[k]='ok'; }
  _sv(); updateBadge(el); updateStats();
  if(!reviewed[k]){ reviewed[k]=true; el.classList.add('reviewed'); updateProgress(); }
};

window.markNg = function(el, ev){
  if(ev){ ev.stopPropagation(); ev.preventDefault(); }
  var k = el.getAttribute('data-k'); _eh(k); var h = _mh[k];
  if(sessionMark[k]==='ng'){ h.total--; delete sessionMark[k]; }
  else { if(sessionMark[k]==='ok'){ h.ok--; } else { h.total++; } sessionMark[k]='ng'; }
  _sv(); updateBadge(el); updateStats();
  if(!reviewed[k]){ reviewed[k]=true; el.classList.add('reviewed'); updateProgress(); }
};

function updateStats(){
  var cards = document.querySelectorAll('.flip-card[data-k]');
  var tOk=0, tT=0, sOk=0, sNg=0;
  cards.forEach(function(c){
    var k = c.getAttribute('data-k'); _eh(k);
    tOk += _mh[k].ok; tT += _mh[k].total;
    if(sessionMark[k]==='ok') sOk++;
    if(sessionMark[k]==='ng') sNg++;
  });
  var p = document.getElementById('statsFloat');
  if(!p) return;
  var sT = sOk + sNg;
  if(sT===0 && tT===0){ p.style.display='none'; return; }
  p.style.display='flex';
  var ratio = tT>0 ? tOk/tT : 1;
  p.innerHTML = '<span class="stats-ring" style="background:'+_gc(ratio)+'">'+Math.round(ratio*100)+'</span><span>\u672c\u6b21 \u2713'+sOk+' \u2717'+sNg+'</span>';
}

function updateProgress(){
  if(!currentScene) return;
  var keys = currentScene.vocabulary.map(function(v){ return v.key; });
  var done = keys.filter(function(k){ return reviewed[k]; }).length;
  var pct = keys.length ? Math.round(done/keys.length*100) : 0;
  var bar = document.getElementById('progVocab');
  if(bar) bar.style.width = pct + '%';
}

// ============================================================
// SPEED CONTROL
// ============================================================
window.setSlow = function(v){
  speechRate = v ? 0.6 : 1;
  document.querySelectorAll('.speed-btn').forEach(function(b){
    b.classList.toggle('on', v ? (b.textContent==='\u6162\u901f') : (b.textContent==='\u5e38\u901f'));
  });
};

// ============================================================
// LANGUAGE TOGGLE
// ============================================================
window.applyFrontLang = function(lang){
  _fl = lang;
  localStorage.setItem('frontLang', lang);
  document.querySelectorAll('.flip-card[data-k]').forEach(function(c){
    var f = c.querySelector('.flip-front'), b = c.querySelector('.flip-back');
    if(!f || !b) return;
    var cnDiv = f.querySelector('.chinese'), kjDiv = b.querySelector('.kanji');
    if(!cnDiv || !kjDiv) return;
    if(lang === 'jp'){
      cnDiv.textContent = c.dataset.origKanji ? c.dataset.origKanji.replace(/<[^>]*>/g,'') : '';
      cnDiv.style.fontFamily = "'M PLUS Rounded 1c',sans-serif";
      kjDiv.innerHTML = '<span style="color:#C04030;font-family:\'Noto Sans SC\',sans-serif">' + (c.dataset.origCn||'') + '</span>';
    } else {
      cnDiv.textContent = c.dataset.origCn || '';
      cnDiv.style.fontFamily = '';
      kjDiv.innerHTML = c.dataset.origKanji || '';
    }
    c.classList.remove('flipped');
  });
  document.querySelectorAll('.lang-btn').forEach(function(b){
    b.classList.toggle('on', b.dataset.lang === lang);
  });
};

// ============================================================
// TAB NAVIGATION
// ============================================================
function renderSceneTabs(){
  var nav = document.getElementById('tabNav');
  if(!nav) return;
  var tabs = [
    {label: '\uD83D\uDCDA 词汇'},
    {label: '\uD83D\uDCAC 句子'},
    {label: '\uD83C\uDFAE 测验'}
  ];
  var html = '';
  tabs.forEach(function(t, i){
    html += '<button class="tab-btn' + (i===0?' active':'') + '" data-idx="' + i + '" onclick="switchSceneTab(' + i + ')">' + t.label + '</button>';
  });
  nav.innerHTML = html;
}

window.switchSceneTab = function(idx){
  if(playingAll) stopAll();
  activeTab = idx;
  var btns = document.querySelectorAll('.tab-btn');
  btns.forEach(function(b, i){
    var isActive = i === idx;
    b.classList.toggle('active', isActive);
    if(isActive){ b.style.background = currentScene.color; b.style.color = '#fff'; }
    else { b.style.background = '#fff'; b.style.color = '#7A7468'; }
  });
  btns[idx].scrollIntoView({behavior:'smooth', inline:'center', block:'nearest'});

  // Show lang toggle only for vocab tab
  var lt = document.getElementById('langToggle');
  if(lt) lt.style.display = (idx === 0) ? 'flex' : 'none';

  var app = document.getElementById('app');
  if(idx === 0) renderVocabulary(app);
  else if(idx === 1) renderSentences(app);
  else if(idx === 2) renderQuiz(app);
};

// ============================================================
// VOCABULARY RENDERING
// ============================================================
function renderVocabulary(container){
  var vocab = currentScene.vocabulary;
  var color = currentScene.color;

  // Controls bar
  var html = '<div class="controls">';
  html += '<div class="speed-toggle"><button class="speed-btn on" onclick="setSlow(false)">\u5e38\u901f</button><button class="speed-btn" onclick="setSlow(true)">\u6162\u901f</button></div>';
  html += '<div class="progress-bar"><div class="progress-fill" id="progVocab" style="background:' + color + '"></div></div>';
  html += '<button class="play-all-btn" id="playAllBtn" style="background:' + color + '" onclick="playAllVocab()">\u25b6 \u5168\u90e8</button>';
  html += '</div>';

  // Card grid
  html += '<div class="card-grid" id="vocabGrid">';
  vocab.forEach(function(v){
    html += '<div class="flip-card" data-k="' + v.key + '" onclick="tapSceneCard(this)">';
    html += '<div class="flip-inner">';
    // Front: emoji + chinese
    html += '<div class="flip-front">';
    html += '<div class="speaker">\uD83D\uDD08</div>';
    html += '<div class="emoji">' + v.emoji + '</div>';
    html += '<div class="chinese">' + v.chinese + '</div>';
    html += '<div class="mark-badge"></div>';
    html += '<div class="mark-btns"><span class="mark-ok" onclick="markOk(this.closest(\'.flip-card\'),event)">\u2713</span><span class="mark-ng" onclick="markNg(this.closest(\'.flip-card\'),event)">\u2717</span></div>';
    html += '</div>';
    // Back: kanji + kana + romaji
    html += '<div class="flip-back">';
    html += '<div class="kanji">' + v.kanji + '</div>';
    html += '<div class="kana">' + v.kana + '</div>';
    html += '<div class="romaji">' + v.romaji + '</div>';
    html += '<div class="mark-badge"></div>';
    html += '<div class="mark-btns"><span class="mark-ok" onclick="markOk(this.closest(\'.flip-card\'),event)">\u2713</span><span class="mark-ng" onclick="markNg(this.closest(\'.flip-card\'),event)">\u2717</span></div>';
    html += '</div>';
    html += '</div></div>';
  });
  html += '</div>';

  container.innerHTML = html;

  // Store original data for lang toggle and init badges
  document.querySelectorAll('.flip-card[data-k]').forEach(function(c){
    var f = c.querySelector('.flip-front'), b = c.querySelector('.flip-back');
    if(!f || !b) return;
    var cn = f.querySelector('.chinese'), kj = b.querySelector('.kanji'), kn = b.querySelector('.kana');
    if(cn) c.dataset.origCn = cn.textContent;
    if(kj) c.dataset.origKanji = kj.innerHTML;
    if(kn) c.dataset.origKana = kn.textContent;
    updateBadge(c);
  });
  updateStats();
  updateProgress();

  // Apply saved lang preference
  if(_fl === 'jp') setTimeout(function(){ applyFrontLang('jp'); }, 50);

  if(typeof replaceEmojiWithImg === 'function') setTimeout(replaceEmojiWithImg, 50);
}

window.tapSceneCard = function(el){
  var k = el.getAttribute('data-k');
  el.classList.toggle('flipped');
  if(curEl) curEl.classList.remove('playing');
  el.classList.add('playing'); curEl = el;
  var kana = el.querySelector('.kana');
  if(kana && typeof speakJP === 'function'){
    speakJP(kana.textContent, function(){
      el.classList.remove('playing');
      if(!reviewed[k]){ reviewed[k]=true; el.classList.add('reviewed'); updateProgress(); }
    });
  }
};

window.playAllVocab = function(){
  if(playingAll){ stopAll(); return; }
  var vocab = currentScene.vocabulary;
  var cards = document.querySelectorAll('#vocabGrid .flip-card');
  var btn = document.getElementById('playAllBtn');
  playingAll = true;
  if(btn){ btn.textContent = '\u23f9 \u505c\u6b62'; btn.classList.add('stop'); }
  var i = 0;

  function next(){
    if(!playingAll || i >= vocab.length){
      playingAll = false;
      cards.forEach(function(c){ c.classList.remove('playing','flipped'); });
      if(btn){ btn.textContent = '\u25b6 \u5168\u90e8'; btn.classList.remove('stop'); }
      return;
    }
    cards.forEach(function(c){ c.classList.remove('playing','flipped'); });
    var card = cards[i];
    if(card){
      card.scrollIntoView({behavior:'smooth', block:'nearest'});
      card.classList.add('playing','flipped');
    }
    var v = vocab[i]; i++;
    speakJP(v.kana, function(){
      setTimeout(function(){
        if(card){
          card.classList.remove('flipped');
          reviewed[v.key] = true;
          card.classList.add('reviewed');
          updateProgress();
        }
        setTimeout(next, 300);
      }, 600);
    });
  }
  next();
};

function stopAll(){
  playingAll = false;
  if(typeof currentAudio !== 'undefined' && currentAudio){ currentAudio.pause(); currentAudio = null; }
  if(window.speechSynthesis) window.speechSynthesis.cancel();
  if(curEl){ curEl.classList.remove('playing'); curEl = null; }
  var btn = document.getElementById('playAllBtn');
  if(btn){ btn.textContent = '\u25b6 \u5168\u90e8'; btn.classList.remove('stop'); }
}

// ============================================================
// SENTENCE RENDERING (with word breakdown)
// ============================================================
function renderSentences(container){
  var sents = currentScene.sentences;
  var html = '';
  sents.forEach(function(s){
    html += '<div class="sent-card" onclick="playSentScene(this)" data-jp="' + escapeAttr(s.jp) + '">';
    html += '<div class="wave"></div>';
    // Text area
    html += '<div class="sent-text-area">';
    html += '<div class="jp-text"><span>\uD83D\uDD0A</span>' + s.jp + '</div>';
    html += '<div class="kana-text">' + s.kana + '</div>';
    html += '<div class="romaji-text">' + s.romaji + '</div>';
    html += '<div class="cn-text">' + s.cn + '</div>';
    // Word breakdown
    if(s.wb && s.wb.length > 0){
      html += '<div class="word-breakdown">';
      s.wb.forEach(function(w){
        html += '<div class="wb-word" onclick="event.stopPropagation();playWbWord(this)">';
        html += '<div class="wb-jp">' + w.jp + '</div>';
        html += '<div class="wb-rd">' + w.romaji + '</div>';
        html += '<div class="wb-cn">' + w.cn + '</div>';
        html += '<div class="wb-speaker">\uD83D\uDD08</div>';
        html += '</div>';
      });
      html += '</div>';
    }
    html += '</div>';
    // Image area
    html += '<div class="sent-img-area">';
    html += '<img src="img/' + s.img + '?v3" alt="" onerror="this.parentElement.style.display=\'none\'">';
    html += '</div>';
    html += '</div>';
  });
  container.innerHTML = html;
}

function escapeAttr(s){
  return s.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

window.playSentScene = function(el){
  document.querySelectorAll('.sent-card.playing').forEach(function(c){ c.classList.remove('playing'); });
  el.classList.add('playing');
  var jp = el.getAttribute('data-jp');
  if(typeof speakJP === 'function'){
    speakJP(jp, function(){ el.classList.remove('playing'); });
  }
};

window.playWbWord = function(el){
  var jp = el.querySelector('.wb-jp');
  if(!jp) return;
  var text = jp.textContent.trim();
  document.querySelectorAll('.wb-word').forEach(function(x){ x.classList.remove('wb-playing'); });
  el.classList.add('wb-playing');
  if(typeof speakJP === 'function'){
    speakJP(text, function(){ el.classList.remove('wb-playing'); });
  }
};

// ============================================================
// QUIZ RENDERING
// ============================================================
function renderQuiz(container){
  var color = currentScene.color;
  var html = '<div class="quiz-box" id="quizBox">';
  html += '<div style="font-size:18px;font-weight:700;margin-bottom:16px">' + currentScene.icon + ' ' + currentScene.nameCn + ' \u6d4b\u9a8c</div>';
  html += '<p style="color:#7A7468;margin-bottom:16px">\u9009\u62e9\u6d4b\u9a8c\u7c7b\u578b\u5f00\u59cb\u7ec3\u4e60</p>';
  html += '<button class="quiz-btn" onclick="startSceneQuiz(\'listen\')" style="background:' + color + '">\uD83D\uDD0A \u542c\u97f3\u9009\u8bcd</button> ';
  html += '<button class="quiz-btn" onclick="startSceneQuiz(\'read\')" style="background:' + color + ';opacity:.85">\uD83D\uDC40 \u770b\u5b57\u9009\u4e49</button> ';
  html += '<button class="quiz-btn" onclick="startSceneQuiz(\'cn2jp\')" style="background:' + color + ';opacity:.7">\uD83C\uDDE8\uD83C\uDDF3\u2192\uD83C\uDDEF\uD83C\uDDF5 \u4e2d\u8bd1\u65e5</button>';
  html += '</div>';
  container.innerHTML = html;
}

window.startSceneQuiz = function(type){
  var vocab = currentScene.vocabulary.slice();
  quizData = shuffle(vocab).slice(0, Math.min(10, vocab.length));
  quizIdx = 0;
  quizScore = 0;
  window._quizType = type;
  showSceneQuizQ();
};

function shuffle(arr){
  var a = arr.slice();
  for(var i = a.length - 1; i > 0; i--){
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function showSceneQuizQ(){
  if(quizIdx >= quizData.length){ showSceneQuizResult(); return; }
  var c = quizData[quizIdx];
  var all = currentScene.vocabulary;
  var opts = shuffle(all.filter(function(x){ return x.key !== c.key; })).slice(0, 3);
  opts.push(c);
  opts = shuffle(opts);

  var box = document.getElementById('quizBox');
  if(!box){
    document.getElementById('app').innerHTML = '<div class="quiz-box" id="quizBox"></div>';
    box = document.getElementById('quizBox');
  }

  var type = window._quizType;
  var html = '<div style="font-size:13px;color:#7A7468">\u7b2c ' + (quizIdx+1) + '/' + quizData.length + ' \u9898</div>';

  if(type === 'listen'){
    html += '<div style="font-size:56px;margin:16px 0;cursor:pointer" onclick="speakJP(\'' + escapeAttr(c.kana) + '\')">\uD83D\uDD0A</div>';
    html += '<div style="font-size:16px;color:#7A7468;margin-bottom:12px">\u542c\u53d1\u97f3\uff0c\u9009\u6b63\u786e\u7684\u8bcd</div>';
    html += '<div class="quiz-options">';
    opts.forEach(function(o){
      html += '<button class="quiz-opt" onclick="sceneQuizAnswer(this,\'' + escapeAttr(o.key) + '\',\'' + escapeAttr(c.key) + '\',\'' + escapeAttr(c.kana) + '\')">';
      html += '<div style="font-size:24px">' + o.emoji + '</div><div>' + o.chinese + '</div></button>';
    });
    html += '</div>';
    box.innerHTML = html;
    speakJP(c.kana);
  } else if(type === 'read'){
    html += '<div style="font-family:\'M PLUS Rounded 1c\',sans-serif;font-size:36px;font-weight:900;margin:16px 0">' + c.kanji + '</div>';
    html += '<div style="font-size:16px;color:#7A7468;margin-bottom:12px">' + c.kana + ' \u662f\u4ec0\u4e48\u610f\u601d\uff1f</div>';
    html += '<div class="quiz-options">';
    opts.forEach(function(o){
      html += '<button class="quiz-opt" onclick="sceneQuizAnswer(this,\'' + escapeAttr(o.key) + '\',\'' + escapeAttr(c.key) + '\',\'' + escapeAttr(c.kana) + '\')">';
      html += '<div style="font-size:24px">' + o.emoji + '</div><div>' + o.chinese + '</div></button>';
    });
    html += '</div>';
    box.innerHTML = html;
  } else {
    html += '<div style="font-size:24px;font-weight:700;margin:16px 0">' + c.emoji + ' ' + c.chinese + '</div>';
    html += '<div style="font-size:16px;color:#7A7468;margin-bottom:12px">\u65e5\u8bed\u600e\u4e48\u8bf4\uff1f</div>';
    html += '<div class="quiz-options">';
    opts.forEach(function(o){
      html += '<button class="quiz-opt" onclick="sceneQuizAnswer(this,\'' + escapeAttr(o.key) + '\',\'' + escapeAttr(c.key) + '\',\'' + escapeAttr(c.kana) + '\')" style="font-family:\'M PLUS Rounded 1c\',sans-serif">';
      html += '<div style="font-size:20px;font-weight:700">' + o.kanji + '</div><div style="font-size:12px;color:#7A7468">' + o.kana + '</div></button>';
    });
    html += '</div>';
    box.innerHTML = html;
  }
  if(typeof replaceEmojiWithImg === 'function') setTimeout(replaceEmojiWithImg, 50);
}

window.sceneQuizAnswer = function(el, picked, correct, kana){
  var btns = document.querySelectorAll('.quiz-opt');
  btns.forEach(function(b){ b.onclick = null; });
  if(picked === correct){
    el.classList.add('correct');
    el.classList.add('bounce');
    quizScore++;
    speakJP(kana);
  } else {
    el.classList.add('wrong');
    el.classList.add('shake');
    btns.forEach(function(b){
      if(b.textContent && b.getAttribute('onclick')){} // correct answer highlight handled by data
    });
  }
  setTimeout(function(){ quizIdx++; showSceneQuizQ(); }, 1200);
};

function showSceneQuizResult(){
  var box = document.getElementById('quizBox');
  var pct = Math.round(quizScore / quizData.length * 100);
  var stars = pct >= 90 ? '\u2B50\u2B50\u2B50' : pct >= 70 ? '\u2B50\u2B50' : '\u2B50';
  var msg = pct >= 90 ? '\u592a\u68d2\u4e86\uff01' : pct >= 70 ? '\u505a\u5f97\u4e0d\u9519\uff01' : '\u7ee7\u7eed\u52a0\u6cb9\uff01';
  var html = '<div style="font-size:48px;margin:12px 0">' + stars + '</div>';
  html += '<div style="font-size:18px;font-weight:700;margin:12px 0">' + msg + ' ' + quizScore + '/' + quizData.length + ' (' + pct + '%)</div>';
  html += '<button class="quiz-btn" onclick="startSceneQuiz(\'' + window._quizType + '\')" style="background:' + currentScene.color + '">\u518d\u6765\u4e00\u6b21</button> ';
  html += '<button class="quiz-btn" onclick="switchSceneTab(0)" style="background:#7A7468">\u8fd4\u56de\u8bcd\u6c47</button>';
  box.innerHTML = html;
}

})();
