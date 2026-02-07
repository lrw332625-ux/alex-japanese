/* Cache control: adds force-refresh button + no-cache headers for GitHub Pages */
(function(){
var VER='20260207a';
// Add refresh button to footer
document.addEventListener('DOMContentLoaded',function(){
  var footer=document.querySelector('.footer');
  if(footer){
    var btn=document.createElement('div');
    btn.style.cssText='margin-top:8px;font-size:11px;color:#aaa;cursor:pointer';
    btn.innerHTML='v'+VER+' | <span style="text-decoration:underline">强制刷新</span>';
    btn.onclick=function(){
      // Clear all caches and reload
      if('caches' in window){
        caches.keys().then(function(names){
          names.forEach(function(name){caches.delete(name)});
        });
      }
      // Force reload bypassing cache
      location.reload(true);
    };
    footer.appendChild(btn);
  }
});
})();
