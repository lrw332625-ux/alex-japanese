/* Scene Renderer Engine for Alex Japanese Learning */
(function(){
'use strict';

var sceneData = null;
var currentScene = null;
var activeTab = 0;
var quizData = [];
var quizIdx = 0;
var quizScore = 0;

// Get scene ID from URL
function getSceneId(){
  var params = new URLSearchParams(window.location.search);
  return params.get('id') || '';
}

// Load scenes.json
function loadSceneData(cb){
  if(sceneData){ cb(sceneData); return; }
  fetch('../data/scenes.json')
    .then(function(r){ return r.json(); })
    .then(function(data){
      sceneData = data;
      cb(data);
    })
    .catch(function(e){
      console.error('Failed to load scenes.json:', e);
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
      html += '</div>';
      html += '</div>';
      html += '<div class="arrow">→</div>';
      html += '</a>';
    });
    container.innerHTML = html;
    if(typeof replaceEmojiWithImg === 'function') replaceEmojiWithImg();
  });
};

// ============================================================
// SCENE DETAIL PAGE (scenes/scene.html?id=xxx)
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
      if(data.scenes[i].id === sceneId){
        currentScene = data.scenes[i];
        break;
      }
    }
    if(!currentScene){
      document.getElementById('app').innerHTML = '<div style="text-align:center;padding:60px 20px">场景不存在</div>';
      return;
    }

    // Set header
    document.getElementById('sceneTitle').textContent = currentScene.icon + ' ' + currentScene.nameCn;
    document.getElementById('sceneSubtitle').textContent = currentScene.name + ' ' + currentScene.nameKana;
    var hdr = document.getElementById('sceneHeader');
    if(hdr) hdr.style.background = currentScene.gradient;

    // Build audio map for this scene
    buildSceneAudioMap();

    // Render tabs and content
    renderSceneTabs();
    switchSceneTab(0);

    if(typeof replaceEmojiWithImg === 'function') setTimeout(replaceEmojiWithImg, 100);
  });
};

function buildSceneAudioMap(){
  // We'll rely on the shared audio.js + audio-map.json
  // No additional setup needed since audio.js auto-loads audio-map.json
}

// ============================================================
// TAB NAVIGATION
// ============================================================
function renderSceneTabs(){
  var nav = document.getElementById('tabNav');
  if(!nav) return;
  var tabs = [
    {label: '📚 词汇', icon: '📚'},
    {label: '💬 句子', icon: '💬'},
    {label: '🎮 测验', icon: '🎮'}
  ];
  var html = '';
  tabs.forEach(function(t, i){
    var cls = i === 0 ? 'tab-btn active' : 'tab-btn';
    html += '<button class="' + cls + '" onclick="switchSceneTab(' + i + ')" data-idx="' + i + '">' + t.label + '</button>';
  });
  nav.innerHTML = html;
}

window.switchSceneTab = function(idx){
  activeTab = idx;
  var btns = document.querySelectorAll('.tab-btn');
  btns.forEach(function(b, i){
    var isActive = i === idx;
    b.classList.toggle('active', isActive);
    if(isActive){
      b.style.background = currentScene.color;
      b.style.color = '#fff';
    } else {
      b.style.background = '#fff';
      b.style.color = '#7A7468';
    }
  });

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
  var html = '<div class="vocab-grid">';
  vocab.forEach(function(v){
    html += '<div class="flip-card" data-k="' + v.key + '" onclick="tapSceneCard(this)">';
    html += '<div class="flip-inner">';
    html += '<div class="flip-front">';
    html += '<div class="speaker">🔈</div>';
    html += '<div class="emoji">' + v.emoji + '</div>';
    html += '<div class="kanji">' + v.kanji + '</div>';
    html += '<div class="kana">' + v.kana + '</div>';
    html += '</div>';
    html += '<div class="flip-back">';
    html += '<div class="romaji">' + v.romaji + '</div>';
    html += '<div class="chinese">' + v.chinese + '</div>';
    html += '</div>';
    html += '</div></div>';
  });
  html += '</div>';

  // Play all button
  html += '<div style="text-align:center;padding:16px">';
  html += '<button class="play-all-btn" onclick="playAllVocab()" style="background:' + currentScene.color + '">🔊 连续播放全部</button>';
  html += '</div>';

  container.innerHTML = html;
  if(typeof replaceEmojiWithImg === 'function') setTimeout(replaceEmojiWithImg, 50);
}

window.tapSceneCard = function(el){
  el.classList.toggle('flipped');
  var kana = el.querySelector('.kana').textContent;
  if(typeof speakJP === 'function') speakJP(kana);
};

var playingAll = false;
window.playAllVocab = function(){
  if(playingAll){ playingAll = false; return; }
  var vocab = currentScene.vocabulary;
  playingAll = true;
  var i = 0;
  var cards = document.querySelectorAll('.flip-card');

  function next(){
    if(!playingAll || i >= vocab.length){
      playingAll = false;
      cards.forEach(function(c){ c.classList.remove('playing'); });
      return;
    }
    cards.forEach(function(c){ c.classList.remove('playing'); });
    if(cards[i]) cards[i].classList.add('playing');
    var v = vocab[i]; i++;
    speakJP(v.kana, function(){
      setTimeout(next, 400);
    });
  }
  next();
};

// ============================================================
// SENTENCE RENDERING
// ============================================================
function renderSentences(container){
  var sents = currentScene.sentences;
  var html = '<div class="sent-list">';
  sents.forEach(function(s){
    html += '<div class="sent-card" onclick="playSentScene(this)" data-jp="' + escapeAttr(s.jp) + '">';
    // Image (if exists)
    html += '<div class="sent-img-wrap">';
    html += '<img class="sent-img" src="img/' + s.img + '" alt="" onerror="this.style.display=\'none\'">';
    html += '</div>';
    html += '<div class="sent-content">';
    html += '<div class="jp-text"><span>🔊</span>' + s.jp + '</div>';
    html += '<div class="kana-text">' + s.kana + '</div>';
    html += '<div class="romaji-text">' + s.romaji + '</div>';
    html += '<div class="cn-text">' + s.cn + '</div>';
    html += '</div>';
    html += '</div>';
  });
  html += '</div>';
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

// ============================================================
// QUIZ RENDERING
// ============================================================
function renderQuiz(container){
  var html = '<div class="quiz-box" id="quizBox">';
  html += '<div style="font-size:18px;font-weight:700;margin-bottom:16px">' + currentScene.icon + ' ' + currentScene.nameCn + ' 测验</div>';
  html += '<p style="color:#7A7468;margin-bottom:16px">选择测验类型开始练习</p>';
  html += '<button class="quiz-btn" onclick="startSceneQuiz(\'listen\')" style="background:' + currentScene.color + '">🔊 听音选词</button> ';
  html += '<button class="quiz-btn" onclick="startSceneQuiz(\'read\')" style="background:' + currentScene.color + ';opacity:.85">👀 看字选义</button> ';
  html += '<button class="quiz-btn" onclick="startSceneQuiz(\'cn2jp\')" style="background:' + currentScene.color + ';opacity:.7">🇨🇳→🇯🇵 中译日</button>';
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
  var html = '<div style="font-size:13px;color:#7A7468">第 ' + (quizIdx + 1) + '/' + quizData.length + ' 题</div>';

  if(type === 'listen'){
    html += '<div style="font-size:56px;margin:16px 0;cursor:pointer" onclick="speakJP(\'' + escapeAttr(c.kana) + '\')">🔊</div>';
    html += '<div style="font-size:16px;color:#7A7468;margin-bottom:12px">听发音，选正确的词</div>';
    html += '<div class="quiz-options">';
    opts.forEach(function(o, i){
      html += '<button class="quiz-opt" onclick="sceneQuizAnswer(this,\'' + escapeAttr(o.key) + '\',\'' + escapeAttr(c.key) + '\',\'' + escapeAttr(c.kana) + '\')">';
      html += '<div style="font-size:24px">' + o.emoji + '</div>';
      html += '<div>' + o.chinese + '</div>';
      html += '</button>';
    });
    html += '</div>';
    box.innerHTML = html;
    speakJP(c.kana);
  } else if(type === 'read'){
    html += '<div style="font-family:\'M PLUS Rounded 1c\',sans-serif;font-size:36px;font-weight:900;margin:16px 0">' + c.kanji + '</div>';
    html += '<div style="font-size:16px;color:#7A7468;margin-bottom:12px">' + c.kana + ' 是什么意思？</div>';
    html += '<div class="quiz-options">';
    opts.forEach(function(o, i){
      html += '<button class="quiz-opt" onclick="sceneQuizAnswer(this,\'' + escapeAttr(o.key) + '\',\'' + escapeAttr(c.key) + '\',\'' + escapeAttr(c.kana) + '\')">';
      html += '<div style="font-size:24px">' + o.emoji + '</div>';
      html += '<div>' + o.chinese + '</div>';
      html += '</button>';
    });
    html += '</div>';
    box.innerHTML = html;
  } else { // cn2jp
    html += '<div style="font-size:24px;font-weight:700;margin:16px 0">' + c.emoji + ' ' + c.chinese + '</div>';
    html += '<div style="font-size:16px;color:#7A7468;margin-bottom:12px">日语怎么说？</div>';
    html += '<div class="quiz-options">';
    opts.forEach(function(o, i){
      html += '<button class="quiz-opt" onclick="sceneQuizAnswer(this,\'' + escapeAttr(o.key) + '\',\'' + escapeAttr(c.key) + '\',\'' + escapeAttr(c.kana) + '\')" style="font-family:\'M PLUS Rounded 1c\',sans-serif">';
      html += '<div style="font-size:20px;font-weight:700">' + o.kanji + '</div>';
      html += '<div style="font-size:12px;color:#7A7468">' + o.kana + '</div>';
      html += '</button>';
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
    quizScore++;
    speakJP(kana);
  } else {
    el.classList.add('wrong');
    // Highlight correct answer
    btns.forEach(function(b){
      if(b.getAttribute('onclick') && b.getAttribute('onclick').indexOf("'" + correct + "'") !== -1){
        // Can't easily find it after onclick=null, so skip
      }
    });
  }
  setTimeout(function(){ quizIdx++; showSceneQuizQ(); }, 1200);
};

function showSceneQuizResult(){
  var box = document.getElementById('quizBox');
  var pct = Math.round(quizScore / quizData.length * 100);
  var stars = pct >= 90 ? '⭐⭐⭐' : pct >= 70 ? '⭐⭐' : '⭐';
  var msg = pct >= 90 ? '太棒了！' : pct >= 70 ? '做得不错！' : '继续加油！';
  var html = '<div style="font-size:48px;margin:12px 0">' + stars + '</div>';
  html += '<div style="font-size:18px;font-weight:700;margin:12px 0">' + msg + ' ' + quizScore + '/' + quizData.length + ' (' + pct + '%)</div>';
  html += '<button class="quiz-btn" onclick="startSceneQuiz(\'' + window._quizType + '\')" style="background:' + currentScene.color + '">再来一次</button> ';
  html += '<button class="quiz-btn" onclick="switchSceneTab(0)" style="background:#7A7468">返回词汇</button>';
  box.innerHTML = html;
}

})();
