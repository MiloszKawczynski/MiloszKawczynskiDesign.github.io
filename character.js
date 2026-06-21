const CHARACTER_SRC = new URL('./ragdoll.png', document.currentScript.src).href;
const CHARACTER_WALK = new URL('./ragdollWalk.gif', document.currentScript.src).href;
const CHARACTER_POINTS = new URL('./ragdollPoints.gif', document.currentScript.src).href;
const CHARACTER_POINTSLOOP = new URL('./ragdollPointsLoop.gif', document.currentScript.src).href;
const CHARACTER_DRAG = new URL('./ragdollDrag.gif', document.currentScript.src).href;
const CHARACTER_THROW = new URL('./ragdollThrow.png', document.currentScript.src).href;
const CHARACTER_WIDTH = 64;
const CHARACTER_HEIGHT = 64;
const BOUNCE_CLASS   = 'bounce-target';
const FRICTION       = 0.98;
const RESTITUTION    = 0.72;
const GRAVITATION    = 0.81;
const SHAKE_MS       = 380;
const SHAKE_CLASS    = 'is-shaking';
const CHARACTER_POINTS_DURATION = 600;

(function () 
{
  const el = document.createElement('div');
  el.id = 'character';
  el.style.cssText = `
    position: absolute;
    left: 0;
    top: 0;
    width: ${CHARACTER_WIDTH}px;
    height: ${CHARACTER_HEIGHT}px;
    z-index: 9999;
    cursor: grab;
    user-select: none;
    touch-action: none;
    pointer-events: auto;
    will-change: transform;
    image-rendering: pixelated;
  `;

  const img = document.createElement('img');
  img.src = CHARACTER_SRC;
  img.alt = 'character';
  img.draggable = false;
  img.style.cssText = 'width:100%;height:100%;object-fit:contain;';
  el.appendChild(img);

  document.body.appendChild(el);

  let x = 0;
  let y = window.innerHeight;
  let vx = 0, vy = 0;

  let dragOffX   = 0, dragOffY = 0;
  let prevMouseX = 0, prevMouseY = 0;
  let velHistX   = [], velHistY = [];
  let state      = "idle"
  let lastClientX = 0;
  let lastClientY = 0;
  let swing = 0;
  const VEL_SAMPLES = 1;

  let rafId = null;

  function setPos(nx, ny) 
  {
    x = nx; 
    y = ny;
    el.style.transform = `translate(${x}px,${y}px)`;
  }

  function shake(target) 
  {
    if (target.classList.contains(SHAKE_CLASS)) return;
    target.classList.add(SHAKE_CLASS);
    setTimeout(() => target.classList.remove(SHAKE_CLASS), SHAKE_MS);
  }

  function getObstacles() 
  {
    const obstacles = [];

    obstacles.push(
    {
      left:   0,
      top:    window.scrollY,
      right:  window.innerWidth,
      bottom: window.scrollY + window.innerHeight,
      isViewport: true,
      el: null,
    });

    document.querySelectorAll('.' + BOUNCE_CLASS).forEach(t => 
    {
      const r = t.getBoundingClientRect();
      obstacles.push(
      {
        left:   r.left,
        top:    r.top    + window.scrollY,
        right:  r.right,
        bottom: r.bottom + window.scrollY,
        isViewport: false,
        el: t,
      });
    });

    return obstacles;
  }

  function resolveCollisions(doShake = true) 
  {
    const hw = CHARACTER_WIDTH;
    const hh = CHARACTER_HEIGHT;
    const obstacles = getObstacles();
    let hit = false;

    obstacles.forEach(o => 
    {
      if (o.isViewport) 
      {
        if (x < o.left) 
        {
          x = o.left; 
          vx *= -RESTITUTION; 
          hit = true;
        }
        
        if (x + hw > o.right) 
        {
          x = o.right - hw; 
          vx *= -RESTITUTION; 
          hit = true;
        }
        
        if (y < o.top) 
        {
          y = o.top; 
          vy *= -RESTITUTION; 
          hit = true;
        }
        
        if (y + hh > o.bottom) 
        {
          y = o.bottom - hh; 
          vy *= -RESTITUTION;
          if (Math.abs(vy) < RESTITUTION) 
          {
            state = "idle";
            vy = 0;
          }
          hit = true;
        }
      } 
      else 
      {
        let cx = x + hw / 2;
        let cy = y + hh / 2;

        const cRight  = cx + hw / 2;
        const cLeft   = cx - hw / 2;
        const cTop    = cy - hh / 2;
        const cBottom = cy + hh / 2;

        let inX = cRight  + vx > o.left && cLeft + vx < o.right;
        let inY = cBottom + vy > o.top  && cTop  + vy < o.bottom;

        if (!inX || !inY) 
        {
          return;
        }

        const dLeft   = cRight - o.left;
        const dRight  = o.right - cLeft;
        const dTop    = cBottom - o.top;
        const dBottom = o.bottom - cTop;
        const minD    = Math.min(dLeft, dRight, dTop, dBottom);
 
        if (minD === dLeft)  { x -= dLeft;   vx *= -RESTITUTION; }
        if (minD === dRight) { x -= dRight;  vx *= -RESTITUTION; }
        if (minD === dBottom){ y -= dBottom; vy *= -RESTITUTION; }
        if (minD === dTop)   
        { 
          y -= dTop; 
          vy *= -RESTITUTION; 
          if (Math.abs(vy) < RESTITUTION) 
          {
            state = "idle";
          }
        }

        if (doShake) shake(o.el);
        hit = true;
      }
    });

    return hit;
  }

  function checkIfInTheAir() 
  {
    const hw = CHARACTER_WIDTH;
    const hh = CHARACTER_HEIGHT;
    const obstacles = getObstacles();

    for (const o of obstacles)
    {
      let cx = x + hw / 2;
      let fy = y + hh + 1;

      if (o.isViewport)
      {
        if (fy >= o.bottom) 
        {
          return false;
        }
      }
      else
      {
        let inX = cx > o.left && cx < o.right;
        let inY = fy >= o.top  && fy < o.bottom;

        if (inX && inY) 
        {
          return false;
        }
      }
    }

    return true;
  }

  function changeSprite(sprite)
  {
    if (img.src != sprite)
    {
      img.src = sprite;
    }
  }

  function tick() 
  {
    if (state == "drag")
    {
      changeSprite(CHARACTER_DRAG);
      swing = Math.sin(Date.now() / 150) * 16;
      img.style.transform = `rotate(${swing}deg)`;
    }

    if (state == "idle")
    {
      if (checkIfInTheAir())
      {
        state = "throw";
      }

      vx *= FRICTION;
      x += vx;

      resolveCollisions(false);

      if (Math.abs(vx) < FRICTION * 0.5) { vx = 0; }

      setPos(x, y);

      state = "walk";
    }

    if (state == "walk")
    {
      if (checkIfInTheAir())
      {
        state = "throw";
      }

      let target;

      if (x < window.innerWidth / 2)
      {
        target = window.innerWidth * 0.1
      }
      else
      {
        target = window.innerWidth * 0.9
      }

      if (Math.abs(target - x) > 3)
      {
        vx = Math.sign(target - x);
        x += vx;
        img.style.transform = vx > 0 ? 'scaleX(1)' : 'scaleX(-1)';
      }
      else
      {
        img.style.transform = target < window.innerWidth * 0.5 ? 'scaleX(1)' : 'scaleX(-1)';
        state = "points";
      }

      resolveCollisions(false);

      setPos(x, y);

      changeSprite(CHARACTER_WALK);
    }

    if (state === "points")
    {
      if (checkIfInTheAir())
      {
        state = "throw";
      }

      if (img.src != CHARACTER_POINTSLOOP)
      {
        changeSprite(CHARACTER_POINTS);
        setTimeout(() => 
        {
          changeSprite(CHARACTER_POINTSLOOP);
        }, CHARACTER_POINTS_DURATION);
      }

      resolveCollisions(false);

      setPos(x, y);
    }

    if (state == "throw")
    {
      vx *= FRICTION;
      vy *= FRICTION;
      vy += GRAVITATION;

      x += vx;
      y += vy;

      resolveCollisions();

      if (Math.abs(vx) < FRICTION * 0.5) { vx = 0; }
      if (Math.abs(vy) < FRICTION * 0.5) { vy = 0; }

      setPos(x, y);

      changeSprite(CHARACTER_THROW);

      const spd = Math.sqrt(vx * vx + vy * vy);
      const targetSwing = (Math.atan2(vx, vy) * 180 / Math.PI - 90) * -1;
      swing = swing + spd / 100 * (targetSwing - swing);

      if (swing < 90 || swing > 270)
      {
        img.style.transform = `rotate(${swing}deg) scaleX(-1)`;
      }
      else
      {
        img.style.transform = `rotate(${swing - 180}deg) scaleX(1)`;
      }
    }


    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);

  function onPointerDown(e) 
  {
    e.preventDefault();
    state = "drag";
    el.style.cursor = 'grabbing';
    dragOffX = e.clientX - x;
    dragOffY = e.clientY + window.scrollY - y;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY + window.scrollY;
    velHistX = []; velHistY = [];
    el.setPointerCapture(e.pointerId);

    lastClientX = e.clientX;
    lastClientY = e.clientY;
  }

  function onPointerMove(e) 
  {
    if (state != "drag") return;
    const nx = e.clientX - dragOffX;
    const ny = e.clientY + window.scrollY - dragOffY;

    velHistX.push(e.clientX - prevMouseX);
    velHistY.push(e.clientY + window.scrollY - prevMouseY);
    if (velHistX.length > VEL_SAMPLES) 
    { 
      velHistX.shift(); 
      velHistY.shift(); 
    }

    prevMouseX = e.clientX;
    prevMouseY = e.clientY + window.scrollY;

    lastClientX = e.clientX;
    lastClientY = e.clientY;

    setPos(nx, ny);
  }

  function onPointerUp(e) 
  {
    if (state != "drag") return;
    state = "throw";
    el.style.cursor = 'grab';

    const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    vx = avg(velHistX) * 1.6;
    vy = avg(velHistY) * 1.6;

    swing = (Math.atan2(vx, vy) * 180 / Math.PI - 90) * -1;

    if (swing < 90 || swing > 270)
    {
      img.style.transform = `rotate(${swing}deg) scaleX(-1)`;
    }
    else
    {
      img.style.transform = `rotate(${swing - 180}deg) scaleX(1)`;
    }

    e.preventDefault();
  }

  el.addEventListener('pointerdown', onPointerDown);
  el.addEventListener('pointermove', onPointerMove);
  el.addEventListener('pointerup',   onPointerUp);
  el.addEventListener('pointercancel', onPointerUp);

  window.addEventListener('resize', () => 
  {
    x = Math.min(x, window.innerWidth  - CHARACTER_WIDTH);
    y = Math.min(y, window.innerHeight - CHARACTER_HEIGHT);
  });

  window.addEventListener('scroll', () =>
  {
    if (state != "drag") return;
    const nx = lastClientX - dragOffX;
    const ny = lastClientY + window.scrollY - dragOffY;
    setPos(nx, ny);
  });

})();