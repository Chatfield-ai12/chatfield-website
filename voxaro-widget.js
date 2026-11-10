(function () {
  "use strict";
  if (window.__voxaroWidgetLoaded) return;
  window.__voxaroWidgetLoaded = true;

  var API = "https://chatfield-ai.ch/api/voxaro";

  var host = document.createElement("div");
  host.id = "voxaro-chat-widget";
  host.style.cssText = "position:fixed;z-index:2147483000;bottom:0;right:0;";
  document.body.appendChild(host);
  var root = host.attachShadow({ mode: "open" });

  // Voxaro brand: indigo -> violet, voice/soundwave motif
  var A = "#3d8ef8", B = "#2a7ae8", DARK = "#04090f";

  // soundwave logo (5 equalizer bars)
  var WAVE =
    '<svg class="wv" viewBox="0 0 24 24">' +
    '<rect x="2" y="9" width="2.4" height="6" rx="1.2"/>' +
    '<rect x="6.4" y="6" width="2.4" height="12" rx="1.2"/>' +
    '<rect x="10.8" y="3.5" width="2.4" height="17" rx="1.2"/>' +
    '<rect x="15.2" y="6" width="2.4" height="12" rx="1.2"/>' +
    '<rect x="19.6" y="9" width="2.4" height="6" rx="1.2"/>' +
    '</svg>';

  root.innerHTML =
    '<style>' +
    ':host,*{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,sans-serif;}' +
    /* FAB */
    '.fab{position:fixed;bottom:22px;right:22px;width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,' + A + ',' + B + ');border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 10px 30px rgba(79,70,229,.45);transition:transform .2s;}' +
    '.fab:hover{transform:scale(1.07);}' +
    '.fab::before{content:"";position:absolute;inset:0;border-radius:50%;box-shadow:0 0 0 0 rgba(124,58,237,.5);animation:vxring 2.4s ease-out infinite;}' +
    '@keyframes vxring{0%{box-shadow:0 0 0 0 rgba(124,58,237,.5)}70%{box-shadow:0 0 0 16px rgba(124,58,237,0)}100%{box-shadow:0 0 0 0 rgba(124,58,237,0)}}' +
    '.fab .wv{width:27px;height:27px;}' +
    '.fab .wv rect{fill:#fff;}' +
    '.fab .x{display:none;width:24px;height:24px;fill:none;stroke:#fff;stroke-width:2.2;stroke-linecap:round;}' +
    '.open .fab .wv{display:none;}' +
    '.open .fab .x{display:block;}' +
    '.open .fab::before{animation:none;}' +
    /* backdrop (mobile only) */
    '.backdrop{position:fixed;inset:0;background:rgba(20,16,40,.5);opacity:0;pointer-events:none;transition:opacity .22s;}' +
    /* panel */
    '.panel{position:fixed;bottom:94px;right:22px;width:374px;max-width:calc(100vw - 32px);height:564px;max-height:calc(100dvh - 128px);background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 30px 70px rgba(26,22,51,.33),0 6px 18px rgba(26,22,51,.14);display:none;flex-direction:column;}' +
    '.open .panel{display:flex;animation:vxin .22s ease;}' +
    '@keyframes vxin{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}' +
    /* header */
    '.head{position:relative;background:linear-gradient(135deg,' + A + ' 0%,' + B + ' 100%);padding:16px 18px;display:flex;align-items:center;gap:12px;overflow:hidden;}' +
    '.head::after{content:"";position:absolute;top:-40px;right:-30px;width:140px;height:140px;border-radius:50%;background:rgba(255,255,255,.12);}' +
    '.head .logo{position:relative;width:42px;height:42px;border-radius:12px;background:rgba(255,255,255,.16);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;flex-shrink:0;}' +
    '.head .logo .wv{width:23px;height:23px;}' +
    '.head .logo .wv rect{fill:#fff;transform-box:fill-box;transform-origin:center;animation:vxeq 1.5s ease-in-out infinite;}' +
    '.head .logo .wv rect:nth-child(1){animation-delay:0s}' +
    '.head .logo .wv rect:nth-child(2){animation-delay:.15s}' +
    '.head .logo .wv rect:nth-child(3){animation-delay:.3s}' +
    '.head .logo .wv rect:nth-child(4){animation-delay:.45s}' +
    '.head .logo .wv rect:nth-child(5){animation-delay:.6s}' +
    '@keyframes vxeq{0%,100%{transform:scaleY(.65)}50%{transform:scaleY(1.1)}}' +
    '.head .name{position:relative;font-size:15.5px;font-weight:700;color:#fff;letter-spacing:.2px;}' +
    '.head .status{position:relative;font-size:11.5px;color:rgba(255,255,255,.88);display:flex;align-items:center;gap:5px;margin-top:2px;}' +
    '.head .status::before{content:"";width:6px;height:6px;border-radius:50%;background:#6ee7b7;box-shadow:0 0 0 0 rgba(110,231,183,.7);animation:vxdot 2s infinite;}' +
    '@keyframes vxdot{0%{box-shadow:0 0 0 0 rgba(110,231,183,.6)}70%{box-shadow:0 0 0 6px rgba(110,231,183,0)}100%{box-shadow:0 0 0 0 rgba(110,231,183,0)}}' +
    '.head .close{position:relative;margin-left:auto;background:rgba(255,255,255,.14);border:none;color:#fff;cursor:pointer;width:28px;height:28px;border-radius:8px;font-size:15px;line-height:1;}' +
    '.head .close:hover{background:rgba(255,255,255,.26);}' +
    /* messages */
    '.msgs{flex:1;padding:16px 13px;overflow-y:auto;display:flex;flex-direction:column;gap:9px;background:#f7f7fb;}' +
    '.msgs::-webkit-scrollbar{width:4px;}.msgs::-webkit-scrollbar-thumb{background:#d6d3e6;border-radius:3px;}' +
    '.b{font-size:14px;line-height:1.5;padding:10px 14px;max-width:86%;white-space:pre-wrap;word-wrap:break-word;}' +
    '.bot{align-self:flex-start;background:#fff;border:1px solid #ebe9f5;border-radius:4px 15px 15px 15px;color:#26233f;box-shadow:0 1px 2px rgba(26,22,51,.04);}' +
    '.usr{align-self:flex-end;background:linear-gradient(135deg,' + A + ',' + B + ');color:#fff;border-radius:15px 4px 15px 15px;}' +
    '.typing{display:flex;gap:4px;align-items:center;padding:4px 2px;}' +
    '.typing span{width:6px;height:6px;border-radius:50%;background:#b9b4d6;animation:vxb 1.2s infinite;}' +
    '.typing span:nth-child(2){animation-delay:.2s;}.typing span:nth-child(3){animation-delay:.4s;}' +
    '@keyframes vxb{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-5px);opacity:1}}' +
    /* chips + input */
    '.chips{padding:9px 13px;display:flex;gap:6px;flex-wrap:wrap;background:#fff;border-top:1px solid #f0eef7;}' +
    '.chip{font-size:12px;padding:6px 12px;border:1px solid #e7e4f3;border-radius:16px;background:#f3f1fb;color:' + A + ';cursor:pointer;font-weight:500;transition:all .15s;}' +
    '.chip:hover{background:linear-gradient(135deg,' + A + ',' + B + ');color:#fff;border-color:transparent;}' +
    '.inprow{display:flex;gap:8px;padding:11px 13px;background:#fff;border-top:1px solid #f0eef7;}' +
    '.inp{flex:1;padding:11px 15px;border:1px solid #e7e4f3;border-radius:22px;background:#f7f7fb;font-size:14px;color:#26233f;outline:none;transition:border-color .15s;}' +
    '.inp:focus{border-color:' + A + ';background:#fff;}' +
    '.send{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,' + A + ',' + B + ');border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform .15s;}' +
    '.send:hover{transform:scale(1.07);}' +
    '.send svg{width:17px;height:17px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}' +
    '.foot{text-align:center;font-size:10px;color:#b9b4d6;padding:7px;background:#fff;}' +
    '.foot a{color:' + A + ';text-decoration:none;font-weight:600;}' +
    '@media(max-width:480px){' +
      '.panel{right:0;left:0;bottom:0;width:100%;max-width:100%;height:88dvh;max-height:88dvh;border-radius:18px 18px 0 0;}' +
      '.open .panel{animation:vxsheet .25s ease;}' +
      '@keyframes vxsheet{from{transform:translateY(100%)}to{transform:translateY(0)}}' +
      '.open .backdrop{opacity:1;pointer-events:auto;}' +
      '.open .fab{display:none;}' +
      '.fab{bottom:18px;right:18px;width:56px;height:56px;}' +
      '.msgs{padding:16px 14px;}' +
      '.b{max-width:90%;font-size:15px;}' +
      '.inp{font-size:16px;}' +
    '}' +
    '@media(prefers-reduced-motion:reduce){.fab::before,.head .logo .wv rect,.head .status::before{animation:none;}}' +
    '</style>' +
    '<div class="wrap" id="wrap">' +
    '<div class="backdrop" id="vxBackdrop"></div>' +
    '<div class="panel">' +
      '<div class="head">' +
        '<div class="logo">' + WAVE + '</div>' +
        '<div><div class="name">Voxaro Assistent</div><div class="status">Online</div></div>' +
        '<button class="close" id="vxClose" aria-label="Schliessen">&#10005;</button>' +
      '</div>' +
      '<div class="msgs" id="vxMsgs"><div class="b bot">Guten Tag! Ich bin der Assistent von voxaro. Wie kann ich Ihnen helfen?</div></div>' +
      '<div class="chips" id="vxChips">' +
        '<div class="chip">Was ist ein Voice Agent?</div>' +
        '<div class="chip">Macht ihr Websites?</div>' +
        '<div class="chip">Was kostet das?</div>' +
        '<div class="chip">Kontakt</div>' +
      '</div>' +
      '<div class="inprow"><input class="inp" id="vxInp" placeholder="Ihre Frage..." autocomplete="off"/>' +
      '<button class="send" id="vxSend" aria-label="Senden"><svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg></button></div>' +
      '<div class="foot">Powered by <a href="https://chatfield-ai.ch" target="_blank" rel="noopener">Chatfield</a></div>' +
    '</div>' +
    '<button class="fab" id="vxFab" aria-label="Chat">' + WAVE +
      '<svg class="x" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' +
    '</div>';

  var wrap = root.getElementById("wrap");
  var msgs = root.getElementById("vxMsgs");
  var inp = root.getElementById("vxInp");
  var history = [], busy = false;

  function toggle(){ wrap.classList.toggle("open"); if(wrap.classList.contains("open")) inp.focus(); }
  function add(text, who){
    var d=document.createElement("div"); d.className="b "+(who==="usr"?"usr":"bot"); d.textContent=text;
    msgs.appendChild(d); msgs.scrollTop=msgs.scrollHeight; return d;
  }
  function typing(){
    var d=document.createElement("div"); d.className="b bot"; d.id="vxTyping";
    d.innerHTML='<div class="typing"><span></span><span></span><span></span></div>';
    msgs.appendChild(d); msgs.scrollTop=msgs.scrollHeight;
  }

  async function send(text){
    if(busy) return;
    text=(text||inp.value).trim(); if(!text) return;
    inp.value=""; busy=true;
    add(text,"usr"); history.push({role:"user",content:text});
    if(history.length>12) history=history.slice(-12);
    typing();
    try{
      var res=await fetch(API,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:history})});
      if(!res.ok) throw new Error("bad");
      var reader=res.body.getReader(), dec=new TextDecoder(), full="",bubble=null,buf="";
      while(true){
        var r=await reader.read(); if(r.done) break;
        buf+=dec.decode(r.value,{stream:true});
        var lines=buf.split("\n"); buf=lines.pop();
        for(var i=0;i<lines.length;i++){
          var line=lines[i];
          if(line.indexOf("data: ")!==0) continue;
          var p=line.slice(6).trim(); if(p==="[DONE]") continue;
          var ev; try{ev=JSON.parse(p);}catch(e){continue;}
          if(ev.type==="content_block_delta"&&ev.delta&&ev.delta.text){
            if(!bubble){ var t=root.getElementById("vxTyping"); if(t)t.remove(); bubble=add("","bot"); }
            full+=ev.delta.text; bubble.textContent=full; msgs.scrollTop=msgs.scrollHeight;
          }
        }
      }
      var t2=root.getElementById("vxTyping"); if(t2)t2.remove();
      if(!full) add("Entschuldigung, bitte versuchen Sie es erneut.","bot");
      else history.push({role:"assistant",content:full});
    }catch(e){
      var t3=root.getElementById("vxTyping"); if(t3)t3.remove();
      add("Verbindungsfehler. Bitte versuchen Sie es erneut oder schreiben Sie an info@voxaro.ch","bot");
    }
    busy=false;
  }

  root.getElementById("vxFab").addEventListener("click",toggle);
  root.getElementById("vxClose").addEventListener("click",toggle);
  root.getElementById("vxBackdrop").addEventListener("click",toggle);
  root.getElementById("vxSend").addEventListener("click",function(){send();});
  inp.addEventListener("keydown",function(e){ if(e.key==="Enter") send(); });
  root.getElementById("vxChips").addEventListener("click",function(e){
    if(e.target.classList.contains("chip")) send(e.target.textContent);
  });
})();
