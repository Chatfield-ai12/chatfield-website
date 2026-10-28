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

  var ACCENT = "#4f46e5", ACCENT2 = "#6366f1", DARK = "#0f172a";

  root.innerHTML =
    '<style>' +
    ':host,*{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Roboto,sans-serif;}' +
    '.fab{position:fixed;bottom:22px;right:22px;width:58px;height:58px;border-radius:50%;background:linear-gradient(135deg,' + ACCENT + ',' + ACCENT2 + ');border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 28px rgba(79,70,229,.4);transition:transform .18s;}' +
    '.fab:hover{transform:scale(1.07);}' +
    '.fab svg{width:26px;height:26px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}' +
    '.fab .x{display:none;}' +
    '.open .fab .chat{display:none;}' +
    '.open .fab .x{display:block;}' +
    '.panel{position:fixed;bottom:92px;right:22px;width:370px;max-width:calc(100vw - 32px);height:560px;max-height:calc(100vh - 120px);background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 24px 60px rgba(15,23,42,.28);display:none;flex-direction:column;}' +
    '.open .panel{display:flex;}' +
    '.head{background:' + DARK + ';padding:15px 17px;display:flex;align-items:center;gap:11px;}' +
    '.head .logo{width:40px;height:40px;border-radius:11px;background:linear-gradient(135deg,' + ACCENT + ',' + ACCENT2 + ');display:flex;align-items:center;justify-content:center;flex-shrink:0;}' +
    '.head .logo svg{width:20px;height:20px;fill:none;stroke:#fff;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;}' +
    '.head .name{font-size:15px;font-weight:700;color:#fff;}' +
    '.head .status{font-size:11px;color:#86efac;display:flex;align-items:center;gap:5px;margin-top:2px;}' +
    '.head .status::before{content:"";width:6px;height:6px;border-radius:50%;background:#4ade80;}' +
    '.head .close{margin-left:auto;background:rgba(255,255,255,.1);border:none;color:rgba(255,255,255,.7);cursor:pointer;width:28px;height:28px;border-radius:8px;font-size:16px;line-height:1;}' +
    '.msgs{flex:1;padding:16px 13px;overflow-y:auto;display:flex;flex-direction:column;gap:9px;background:#f8fafc;}' +
    '.b{font-size:14px;line-height:1.5;padding:10px 13px;max-width:86%;white-space:pre-wrap;word-wrap:break-word;}' +
    '.bot{align-self:flex-start;background:#fff;border:1px solid #e2e8f0;border-radius:4px 14px 14px 14px;color:#1e293b;}' +
    '.usr{align-self:flex-end;background:linear-gradient(135deg,' + ACCENT + ',' + ACCENT2 + ');color:#fff;border-radius:14px 4px 14px 14px;}' +
    '.typing{display:flex;gap:4px;align-items:center;padding:4px 2px;}' +
    '.typing span{width:6px;height:6px;border-radius:50%;background:#c3cad6;animation:vxb 1.2s infinite;}' +
    '.typing span:nth-child(2){animation-delay:.2s;}.typing span:nth-child(3){animation-delay:.4s;}' +
    '@keyframes vxb{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-5px);opacity:1}}' +
    '.chips{padding:9px 13px;display:flex;gap:6px;flex-wrap:wrap;background:#fff;border-top:1px solid #eef2f7;}' +
    '.chip{font-size:12px;padding:6px 11px;border:1px solid #e2e8f0;border-radius:15px;background:#f1f5f9;color:#475569;cursor:pointer;}' +
    '.chip:hover{border-color:' + ACCENT + ';color:' + ACCENT + ';}' +
    '.inprow{display:flex;gap:8px;padding:11px 13px;background:#fff;border-top:1px solid #eef2f7;}' +
    '.inp{flex:1;padding:10px 14px;border:1px solid #e2e8f0;border-radius:20px;background:#f8fafc;font-size:14px;color:#1e293b;outline:none;}' +
    '.inp:focus{border-color:' + ACCENT + ';background:#fff;}' +
    '.send{width:38px;height:38px;border-radius:50%;background:' + DARK + ';border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;}' +
    '.send svg{width:16px;height:16px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;}' +
    '.foot{text-align:center;font-size:10px;color:#cbd5e1;padding:6px;background:#fff;}' +
    '.foot a{color:' + ACCENT + ';text-decoration:none;}' +
    '</style>' +
    '<div class="wrap" id="wrap">' +
    '<div class="panel">' +
      '<div class="head">' +
        '<div class="logo"><svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>' +
        '<div><div class="name">Voxaro Assistent</div><div class="status">Online</div></div>' +
        '<button class="close" id="vxClose" aria-label="Schliessen">&#10005;</button>' +
      '</div>' +
      '<div class="msgs" id="vxMsgs"><div class="b bot">Guten Tag! Ich bin der Assistent von Voxaro. Wie kann ich Ihnen helfen?</div></div>' +
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
    '<button class="fab" id="vxFab" aria-label="Chat"><svg class="chat" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><svg class="x" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>' +
    '</div>';

  var wrap = root.getElementById("wrap");
  var msgs = root.getElementById("vxMsgs");
  var inp = root.getElementById("vxInp");
  var history = [], busy = false;

  function esc(s){ var d=document.createElement("div"); d.textContent=s; return d.textContent; }
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
  root.getElementById("vxSend").addEventListener("click",function(){send();});
  inp.addEventListener("keydown",function(e){ if(e.key==="Enter") send(); });
  root.getElementById("vxChips").addEventListener("click",function(e){
    if(e.target.classList.contains("chip")) send(e.target.textContent);
  });
})();
