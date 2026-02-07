/* Centralized 3-tier Japanese Audio System for Alex Japanese Learning */
(function(){
var currentAudio=null;
var bestJPVoice=null;
var speechRate=1;
var sharedAudioMap=null; // loaded from data/audio-map.json
window.currentAudio=currentAudio;

// Auto-detect base path for audio-map.json
var basePath=(location.pathname.indexOf('/lessons/')!==-1||location.pathname.indexOf('/scenes/')!==-1)?'../':'';

// Load shared audio map on startup
(function loadSharedAudioMap(){
  fetch(basePath+'data/audio-map.json')
    .then(function(r){ if(!r.ok) throw new Error('not found'); return r.json(); })
    .then(function(data){
      sharedAudioMap=data;
      // Adjust paths: shared map uses root-relative paths like "audio/xxx.mp3"
      // For pages in subdirs, we need "../audio/xxx.mp3"
      if(basePath){
        var adjusted={};
        for(var k in sharedAudioMap){
          adjusted[k]=basePath+sharedAudioMap[k];
        }
        sharedAudioMap=adjusted;
      }
    })
    .catch(function(){/* audio-map.json not available yet, that's ok */});
})();

function findBestJPVoice(){
  var voices=speechSynthesis.getVoices();
  var jpVoices=voices.filter(function(v){return v.lang==='ja-JP'||v.lang.startsWith('ja')});
  if(!jpVoices.length)return null;
  var pref=['Kyoko','O-Ren','Otoya','Google','Microsoft'];
  for(var i=0;i<pref.length;i++){
    for(var j=0;j<jpVoices.length;j++){
      if(jpVoices[j].name.indexOf(pref[i])!==-1)return jpVoices[j];
    }
  }
  return jpVoices[0];
}

if('speechSynthesis' in window){
  speechSynthesis.onvoiceschanged=function(){bestJPVoice=findBestJPVoice()};
  bestJPVoice=findBestJPVoice();
}

function speakJPLocal(text,cb){
  if('speechSynthesis' in window){
    window.speechSynthesis.cancel();
    var u=new SpeechSynthesisUtterance(text);
    u.lang='ja-JP';u.rate=speechRate;u.pitch=1.1;
    if(!bestJPVoice)bestJPVoice=findBestJPVoice();
    if(bestJPVoice)u.voice=bestJPVoice;
    u.onend=function(){if(cb)cb()};
    u.onerror=function(){if(cb)cb()};
    window.speechSynthesis.speak(u);
  } else if(cb) cb();
}

function speakJPOnline(text,cb){
  try{
    var a=new Audio('https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=ja&q='+encodeURIComponent(text));
    currentAudio=a;window.currentAudio=a;
    if(speechRate!==1)a.playbackRate=speechRate;
    a.onended=function(){currentAudio=null;window.currentAudio=null;if(cb)cb()};
    a.onerror=function(){currentAudio=null;window.currentAudio=null;speakJPLocal(text,cb)};
    a.play().catch(function(){currentAudio=null;window.currentAudio=null;speakJPLocal(text,cb)});
  }catch(e){speakJPLocal(text,cb)}
}

function playMP3(path,text,cb){
  try{
    var a=new Audio(path);
    currentAudio=a;window.currentAudio=a;
    if(speechRate!==1)a.playbackRate=speechRate;
    a.onended=function(){currentAudio=null;window.currentAudio=null;if(cb)cb()};
    a.onerror=function(){currentAudio=null;window.currentAudio=null;speakJPOnline(text,cb)};
    a.play().catch(function(){currentAudio=null;window.currentAudio=null;speakJPOnline(text,cb)});
    return true;
  }catch(e){return false}
}

window.speakJP=function(text,cb){
  if(currentAudio){try{currentAudio.pause()}catch(e){}}
  if(window.speechSynthesis)window.speechSynthesis.cancel();
  currentAudio=null;window.currentAudio=null;
  text=text.replace(/[\u{1F4E3}\u{1F508}\u{1F509}\u{1F50A}\u{1F3B6}\u{1F3B5}\u{1F300}-\u{1F9FF}]/gu,'').trim();
  if(!text){if(cb)cb();return}
  // Tier 1a: Page-specific audioMap (highest priority)
  if(window.audioMap){
    var path=window.audioMap[text];
    if(path){
      if(playMP3(path,text,cb)) return;
    }
  }
  // Tier 1b: Shared audio-map.json
  if(sharedAudioMap){
    var spath=sharedAudioMap[text];
    if(spath){
      if(playMP3(spath,text,cb)) return;
    }
  }
  // Tier 2+3: Google TTS → Web Speech
  speakJPOnline(text,cb);
};

window.setSpeechRate=function(r){speechRate=r};
})();
