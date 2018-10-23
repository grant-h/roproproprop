var rythm = null;
var roptext = null;
var started = false;
var gindex = parseInt(Math.random()*10);
var jiffies = 0;
var firstplay = true;

var BPM = 109;
var BPM_RATE = 60.0/BPM;
//var startTime = Math.round(BPM_RATE*50);
var startTime = 0;

var fontBump = { min: 2, max: 2.75 };

var errors = [
  'pwn[1337]: segfault at 7f2a90cd0000 ip 00007f2a90cd0000',
  'Segmentation fault (core dumped)',
  '[   5293.2444] Kernel panic - not syncing'
];
var win = [
  ['# id', 'uid=0(root) gid=0(root) groups=0(root)'],
  ['# whoami', 'root']
];
var landed = [
  '[+] g0t r00t',
  '[+] connectback from 107.161.28.10',
  '[+] replaced syscall handler',
  '[+] KASLR slide: 0x4b0000',
];
var gadgets_x86 = [
  ['mov rsp, [rbp+0x10]', 'ret'],
  ['pop rdi', 'pop rsi', 'pop rdx', 'ret'],
  ['xchg eax, esp', 'ret'],
  ['jmp rsp'],
  ['pop rbp', 'pop r12', 'ret'],
  ['add rcx, 8', 'jmp [rcx]']
];
var gadgets_arm = [
  ['stp x2, x3, [x0]', 'ret'],
  ['str x0, [x1, #0x1b8]','br x11'],
  ['ldp x29, x30, [sp], #0x10','ret'],
  ['strb w0, [x1, #0xa]','ret'],
  ['br x30'],
  ['ldr x21, [sp, #0x20]','ldp x29, x30, [sp], #0x30','ret'],
];
var gadgets = Math.random() < 0.5 ? gadgets_arm : gadgets_x86;

var textsource = gadgets;
var scroller = null;
var audio = new Audio('roproprop_loop.mp3');

function setrop(t, frozen) {
    var sz = 3;

    if (frozen) {
      sz = 1.8;
      fontBump.max = 2.0;
      roptext.style.textAlign = 'left';
    } else {
      fontBump.max = 2.75;
      roptext.style.textAlign = 'center';
    }

    if (Array.isArray(t)) {
      roptext.innerHTML = t.join('<br\>');
    } else {
      roptext.innerHTML = t;
    }
    //roptext.style.fontSize = sz + 'em';
}

function gadgetcycle() {
    jiffies = parseInt(Math.round(audio.currentTime / BPM_RATE));
    console.log(jiffies);

    // play dead
    if (jiffies >= 46 && jiffies < 50) {
      textsource = errors;
    // pose
    } else if (jiffies >= 54 && jiffies < 58) {
      textsource = landed;
    // she fine
    } else if (jiffies >= 62 && jiffies < 66) {
      textsource = win;
    } else {
      textsource = gadgets;
      gindex = gindex + 1;
    }

    setrop(textsource[gindex % textsource.length], textsource !== gadgets);

    var adjust = 0;
    // sync hack
    if (jiffies == 61) {
      adjust = BPM_RATE*0.2;
    }
    // schedule the next update frame
    scroller = setTimeout(function() {
      gadgetcycle()
    }, ((jiffies+1)*BPM_RATE - audio.currentTime - adjust)*1000);
    //console.log(((jiffies+1)*BPM_RATE - audio.currentTime - adjust)*1000);
}

audio.addEventListener('ended', function() {
  jiffies = 0;
  gindex = parseInt(Math.random()*10);
  console.log('Loop');

  clearInterval(scroller);

  this.currentTime = startTime;

  // required to loop on safari
  setTimeout(function() {
    audio.pause()
    audio.play()
    gadgetcycle();
  }, 10);
  //this.pause(); 
  //this.play();

}, false);

function toggle() {

  if (started) {
    audio.pause();
    rythm.stop(true);
    clearInterval(scroller);
    started = false;
  } else {
    audio.play();

    if (firstplay)
      audio.currentTime = startTime;

    firstplay = false;
    rythm.start();

    gadgetcycle();
    started = true;
  }
}

function install() {
  rythm = new Rythm();
  rythm.connectExternalAudioElement(audio);
  //rythm.setMusic("roproprop_loop.mp3");

  rythm.maxValueHistory = 20;

  rythm.addRythm('color2', 'color', 100,10, {
    from: [00,0,0],
    to:[00,30,00]
  });

  rythm.addRythm('fontSize', 'fontSize', 10, 10, fontBump);

  roptext = document.getElementById("rop-text");

  window.addEventListener("click", function(event) {
    toggle();
  });

  window.addEventListener("keypress", function(event) {
    if (event.keyCode == 13 || event.keyCode == 32) {
      toggle();
    }
  });
}

window.onload = install;
