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

  // Premium neutral palette — no neon, no glow
  var ACC = "#4f7cff";   // single accent, used sparingly
  var BG  = "#111318";   // panel background
  var BG2 = "#0d1016";   // messages area
  var HDR = "#16191f";   // header

  // Minimal chat bubble icon
  var ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' +
    '</svg>';

  var CLOSE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">' +
    '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' +
    '</svg>';

  var SEND =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
    '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor" stroke="none"/>' +
    '</svg>';

  root.innerHTML =
    '<style>' +
    '*{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,sans-serif;}' +

    /* FAB — clean circle, no pulse ring */
    '.fab{position:fixed;bottom:24px;right:24px;width:54px;height:54px;border-radius:50%;' +
    'background:' + ACC + ';border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;' +
    'box-shadow:0 4px 20px rgba(0,0,0,.35);transition:transform .18s,box-shadow .18s;color:#fff;}' +
    '.fab:hover{transform:scale(1.06);box-shadow:0 6px 24px rgba(0,0,0,.45);}' +
    '.fab svg{width:22px;height:22px;}' +
    '.fab .ic-close{display:none;}' +
    '.open .fab .ic-chat{display:none;}' +
    '.open .fab .ic-close{display:block;}' +

    /* Backdrop */
    '.backdrop{position:fixed;inset:0;background:rgba(0,0,0,.4);opacity:0;pointer-events:none;transition:opacity .2s;}' +

    /* Panel */
    '.panel{position:fixed;bottom:90px;right:24px;width:360px;max-width:calc(100vw - 32px);' +
    'height:540px;max-height:calc(100dvh - 120px);' +
    'background:' + BG + ';border-radius:16px;overflow:hidden;' +
    'box-shadow:0 20px 60px rgba(0,0,0,.5),0 2px 8px rgba(0,0,0,.3);' +
    'display:none;flex-direction:column;' +
    'border:1px solid rgba(255,255,255,.07);}' +
    '.open .panel{display:flex;animation:vxin .2s cubic-bezier(.32,0,.67,0);}' +
    '@keyframes vxin{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}' +

    /* Header */
    '.head{background:' + HDR + ';padding:14px 16px;display:flex;align-items:center;gap:11px;' +
    'border-bottom:1px solid rgba(255,255,255,.06);flex-shrink:0;}' +
    '.head .av{width:36px;height:36px;border-radius:10px;background:' + ACC + ';' +
    'display:flex;align-items:center;justify-content:center;flex-shrink:0;}' +
    '.head .av svg{width:18px;height:18px;color:#fff;}' +
    '.head .info{flex:1;min-width:0;}' +
    '.head .hname{font-size:14px;font-weight:600;color:#f1f5f9;letter-spacing:.01em;}' +
    '.head .hstatus{font-size:11px;color:rgba(255,255,255,.38);margin-top:1px;display:flex;align-items:center;gap:5px;}' +
    '.head .hstatus::before{content:"";width:5px;height:5px;border-radius:50%;background:#34d399;flex-shrink:0;}' +
    '.head .hclose{background:transparent;border:none;color:rgba(255,255,255,.35);cursor:pointer;' +
    'width:28px;height:28px;border-radius:7px;display:flex;align-items:center;justify-content:center;transition:background .15s,color .15s;}' +
    '.head .hclose:hover{background:rgba(255,255,255,.08);color:rgba(255,255,255,.8);}' +
    '.head .hclose svg{width:16px;height:16px;}' +

    /* Messages */
    '.msgs{flex:1;padding:16px;overflow-y:auto;display:flex;flex-direction:column;gap:10px;background:' + BG2 + ';}' +
    '.msgs::-webkit-scrollbar{width:3px;}' +
    '.msgs::-webkit-scrollbar-thumb{background:rgba(255,255,255,.08);border-radius:3px;}' +
    '.b{font-size:13.5px;line-height:1.65;padding:10px 14px;max-width:84%;word-wrap:break-word;white-space:pre-wrap;}' +
    '.bot{align-self:flex-start;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.07);' +
    'border-radius:3px 14px 14px 14px;color:#cbd5e1;}' +
    '.usr{align-self:flex-end;background:' + ACC + ';color:#fff;border-radius:14px 3px 14px 14px;}' +
    '.typing{display:flex;gap:4px;align-items:center;padding:3px 0;}' +
    '.typing span{width:4px;height:4px;border-radius:50%;background:rgba(255,255,255,.3);animation:vxdot 1.3s infinite;}' +
    '.typing span:nth-child(2){animation-delay:.18s;}.typing span:nth-child(3){animation-delay:.36s;}' +
    '@keyframes vxdot{0%,80%,100%{transform:scale(.6);opacity:.3}40%{transform:scale(1);opacity:1}}' +

    /* Chips — subtle, text-first */
    '.chips{padding:10px 12px 6px;display:flex;gap:6px;flex-wrap:wrap;background:' + BG + ';border-top:1px solid rgba(255,255,255,.05);}' +
    '.chip{font-size:11.5px;padding:5px 12px;border:1px solid rgba(255,255,255,.1);border-radius:100px;' +
    'background:transparent;color:rgba(255,255,255,.45);cursor:pointer;transition:all .15s;white-space:nowrap;}' +
    '.chip:hover{border-color:rgba(255,255,255,.25);color:rgba(255,255,255,.85);}' +

    /* Input row */
    '.inprow{display:flex;gap:8px;padding:10px 12px 12px;background:' + BG + ';border-top:1px solid rgba(255,255,255,.05);align-items:center;}' +
    '.inp{flex:1;padding:9px 14px;border:1px solid rgba(255,255,255,.08);border-radius:100px;' +
    'background:rgba(255,255,255,.04);font-size:13px;color:#e2e8f0;outline:none;transition:border .15s;}' +
    '.inp::placeholder{color:rgba(255,255,255,.2);}' +
    '.inp:focus{border-color:rgba(79,124,255,.4);}' +
    '.send{width:34px;height:34px;border-radius:50%;background:' + ACC + ';border:none;cursor:pointer;' +
    'display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;transition:opacity .15s;}' +
    '.send:hover{opacity:.85;}' +
    '.send svg{width:14px;height:14px;}' +

    /* Footer */
    '.foot{text-align:center;font-size:10px;color:rgba(255,255,255,.15);padding:7px;background:' + BG + ';}' +
    '.foot a{color:rgba(255,255,255,.25);text-decoration:none;}' +
    '.foot a:hover{color:rgba(255,255,255,.5);}' +

    /* Mobile */
    '@media(max-width:480px){' +
    '.panel{right:0;left:0;bottom:0;width:100%;max-width:100%;height:85dvh;max-height:85dvh;border-radius:14px 14px 0 0;}' +
    '.open .panel{animation:vxsheet .22s ease;}' +
    '@keyframes vxsheet{from{transform:translateY(100%)}to{transform:translateY(0)}}' +
    '.open .backdrop{opacity:1;pointer-events:auto;}' +
    '.open .fab{display:none;}' +
    '.b{max-width:90%;font-size:14.5px;}' +
    '.inp{font-size:16px;}' +
    '}' +

    '@media(prefers-reduced-motion:reduce){.fab,.open .panel{transition:none;animation:none;}}' +
    '</style>' +

    '<div class="wrap" id="wrap">' +
      '<div class="backdrop" id="vxBackdrop"></div>' +
      '<div class="panel">' +
        '<div class="head">' +
          '<div class="av">' + ICON + '</div>' +
          '<div class="info">' +
            '<div class="hname">Voxaro Assistent</div>' +
            '<div class="hstatus">Online</div>' +
          '</div>' +
          '<button class="hclose" id="vxClose" aria-label="Schliessen">' + CLOSE + '</button>' +
        '</div>' +
        '<div class="msgs" id="vxMsgs"><div class="b bot">Guten Tag! Wie kann ich Ihnen helfen?</div></div>' +
        '<div class="chips" id="vxChips">' +
          '<div class="chip">Was ist ein Voice Agent?</div>' +
          '<div class="chip">Leistungen & Preise</div>' +
          '<div class="chip">Kontakt</div>' +
        '</div>' +
        '<div class="inprow">' +
          '<input class="inp" id="vxInp" placeholder="Ihre Frage..." autocomplete="off"/>' +
          '<button class="send" id="vxSend" aria-label="Senden">' + SEND + '</button>' +
        '</div>' +
        '<div class="foot">Powered by <a href="https://chatfield-ai.ch" target="_blank" rel="noopener">Chatfield</a></div>' +
      '</div>' +
      '<button class="fab" id="vxFab" aria-label="Chat öffnen">' +
        '<span class="ic-chat">' + ICON + '</span>' +
        '<span class="ic-close">' + CLOSE + '</span>' +
      '</button>' +
    '</div>';

  var wrap = root.getElementById("wrap");
  var msgs = root.getElementById("vxMsgs");
  var inp  = root.getElementById("vxInp");
  var history = [], busy = false;

  function toggle(){ wrap.classList.toggle("open"); if(wrap.classList.contains("open")) setTimeout(function(){inp.focus();},220); }
  function add(text, who){
    var d = document.createElement("div");
    d.className = "b " + (who === "usr" ? "usr" : "bot");
    d.textContent = text;
    msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; return d;
  }
  function showTyping(){
    var d = document.createElement("div"); d.className = "b bot"; d.id = "vxTyping";
    d.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
    msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
  }
  function removeTyping(){ var t = root.getElementById("vxTyping"); if(t) t.remove(); }

  async function send(text){
    if(busy) return;
    text = (text || inp.value).trim(); if(!text) return;
    inp.value = ""; busy = true;
    // hide chips after first message
    var chips = root.getElementById("vxChips");
    if(chips) chips.style.display = "none";
    add(text, "usr"); history.push({role:"user", content:text});
    if(history.length > 12) history = history.slice(-12);
    showTyping();
    try{
      var res = await fetch(API, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({messages: history})
      });
      if(!res.ok) throw new Error("bad");
      var reader = res.body.getReader(), dec = new TextDecoder(), full = "", bubble = null, buf = "";
      while(true){
        var r = await reader.read(); if(r.done) break;
        buf += dec.decode(r.value, {stream:true});
        var lines = buf.split("\n"); buf = lines.pop();
        for(var i = 0; i < lines.length; i++){
          var line = lines[i];
          if(line.indexOf("data: ") !== 0) continue;
          var p = line.slice(6).trim(); if(p === "[DONE]") continue;
          var ev; try{ ev = JSON.parse(p); }catch(e){ continue; }
          if(ev.type === "content_block_delta" && ev.delta && ev.delta.text){
            if(!bubble){ removeTyping(); bubble = add("", "bot"); }
            full += ev.delta.text; bubble.textContent = full; msgs.scrollTop = msgs.scrollHeight;
          }
        }
      }
      removeTyping();
      if(!full) add("Entschuldigung, bitte versuchen Sie es erneut.", "bot");
      else history.push({role:"assistant", content:full});
    }catch(e){
      removeTyping();
      add("Verbindungsfehler. Bitte versuchen Sie es erneut.", "bot");
    }
    busy = false;
  }

  root.getElementById("vxFab").addEventListener("click", toggle);
  root.getElementById("vxClose").addEventListener("click", toggle);
  root.getElementById("vxBackdrop").addEventListener("click", toggle);
  root.getElementById("vxSend").addEventListener("click", function(){ send(); });
  inp.addEventListener("keydown", function(e){ if(e.key === "Enter") send(); });
  root.getElementById("vxChips").addEventListener("click", function(e){
    if(e.target.classList.contains("chip")) send(e.target.textContent);
  });
})();
