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
    '.panel{position:fixed;bottom:94px;right:22px;width:374px;max-width:calc(100vw - 32px);height:564px;max-height:calc(100dvh - 128px);background:#07111c;border-radius:20px;overflow:hidden;box-shadow:0 30px 70px rgba(0,0,0,.6),0 6px 18px rgba(0,0,0,.4);display:none;flex-direction:column;border:1px solid rgba(61,142,248,.15);}' +
    '.open .panel{display:flex;animation:vxin .22s ease;}' +
    '@keyframes vxin{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}' +
    /* header */
    '.head{position:relative;background:#0d1b2e;padding:16px 18px;display:flex;align-items:center;gap:12px;overflow:hidden;border-bottom:1px solid rgba(61,142,248,.15);}' +
    
    '.head .logo{position:relative;width:40px;height:40px;border-radius:10px;background:rgba(61,142,248,.12);border:1px solid rgba(61,142,248,.25);display:flex;align-items:center;justify-content:center;flex-shrink:0;}' +
    '.head .logo .wv{width:22px;height:22px;}' +
    '.head .logo .wv rect{fill:' + A + ';transform-box:fill-box;transform-origin:center;animation:vxeq 1.5s ease-in-out infinite;}' +
    '.head .logo .wv rect:nth-child(1){animation-delay:0s}' +
    '.head .logo .wv rect:nth-child(2){animation-delay:.15s}' +
    '.head .logo .wv rect:nth-child(3){animation-delay:.3s}' +
    '.head .logo .wv rect:nth-child(4){animation-delay:.45s}' +
    '.head .logo .wv rect:nth-child(5){animation-delay:.6s}' +
    '@keyframes vxeq{0%,100%{transform:scaleY(.65)}50%{transform:scaleY(1.1)}}' +
    '.head .name{position:relative;font-size:15px;font-weight:700;color:#fff;letter-spacing:.1px;}' +
    '.head .status{position:relative;font-size:11px;color:rgba(255,255,255,.45);display:flex;align-items:center;gap:5px;margin-top:2px;}' +
    '.head .status::before{content:"";width:6px;height:6px;border-radius:50%;background:#34d399;box-shadow:0 0 6px rgba(52,211,153,.6);animation:vxdot 2s infinite;}' +
    '@keyframes vxdot{0%{box-shadow:0 0 0 0 rgba(110,231,183,.6)}70%{box-shadow:0 0 0 6px rgba(110,231,183,0)}100%{box-shadow:0 0 0 0 rgba(110,231,183,0)}}' +
    '.head .close{position:relative;margin-left:auto;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);color:rgba(255,255,255,.5);cursor:pointer;width:28px;height:28px;border-radius:8px;font-size:15px;line-height:1;}' +
    '.head .close:hover{background:rgba(255,255,255,.26);}' +
    /* messages */
    '.msgs{flex:1;padding:20px 16px;overflow-y:auto;display:flex;flex-direction:column;gap:12px;background:#060e18;}' +
    '.msgs::-webkit-scrollbar{width:3px;}.msgs::-webkit-scrollbar-thumb{background:rgba(61,142,248,.2);border-radius:3px;}' +
    '.b{font-size:13.5px;line-height:1.6;padding:11px 15px;max-width:82%;white-space:pre-wrap;word-wrap:break-word;letter-spacing:.01px;}' +
    '.bot{align-self:flex-start;background:#0d1e30;border:1px solid rgba(61,142,248,.12);border-radius:2px 16px 16px 16px;color:#cbd5e1;}' +
    '.usr{align-self:flex-end;background:' + A + ';color:#fff;border-radius:16px 2px 16px 16px;border:none;}' +
    '.typing{display:flex;gap:5px;align-items:center;padding:4px 2px;}' +
    '.typing span{width:5px;height:5px;border-radius:50%;background:rgba(61,142,248,.5);animation:vxb 1.2s infinite;}' +
    '.typing span:nth-child(2){animation-delay:.2s;}.typing span:nth-child(3){animation-delay:.4s;}' +
    '@keyframes vxb{0%,60%,100%{transform:translateY(0);opacity:.35}30%{transform:translateY(-5px);opacity:1}}' +
    /* chips + input */
    '.chips{padding:10px 14px;display:flex;gap:7px;flex-wrap:wrap;background:#060e18;border-top:1px solid rgba(255,255,255,.05);}' +
    '.chip{font-size:11.5px;padding:5px 11px;border:1px solid rgba(61,142,248,.2);border-radius:20px;background:transparent;color:rgba(255,255,255,.55);cursor:pointer;font-weight:400;transition:all .15s;letter-spacing:.01px;}' +
    '.chip:hover{background:rgba(61,142,248,.12);color:#fff;border-color:rgba(61,142,248,.4);}' +
    '.inprow{display:flex;gap:8px;padding:12px 14px 14px;background:#060e18;border-top:1px solid rgba(255,255,255,.05);align-items:center;}' +
    '.inp{flex:1;padding:10px 16px;border:1px solid rgba(255,255,255,.08);border-radius:24px;background:rgba(255,255,255,.04);font-size:13.5px;color:#e2e8f0;outline:none;transition:all .2s;}' +
    '.inp::placeholder{color:rgba(255,255,255,.22);}' +
    '.inp:focus{border-color:rgba(61,142,248,.4);background:rgba(61,142,248,.05);}' +
    '.send{width:36px;height:36px;border-radius:50%;background:' + A + ';border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:opacity .15s;}' +
    '.send:hover{opacity:.85;}' +
    '.send svg{width:15px;height:15px;fill:none;stroke:#fff;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;}' +
    '.foot{text-align:center;font-size:10px;color:rgba(255,255,255,.18);padding:8px;background:#060e18;}' +
    '.foot a{color:rgba(61,142,248,.7);text-decoration:none;}' +
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
      '<div class="msgs" id="vxMsgs"><div class="b bot">Guten Tag! Wie kann ich Ihnen helfen?</div></div>' +
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
