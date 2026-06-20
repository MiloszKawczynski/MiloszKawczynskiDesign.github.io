const CHARACTER_SRC  = './ragdoll.png';
const CHARACTER_WIDTH = 32;
const CHARACTER_HEIGHT = 64;
const BOUNCE_CLASS   = 'bounce-target';
const FRICTION       = 0.98;
const RESTITUTION    = 0.72;
const GRAVITATION    = 0.81;
const SHAKE_MS       = 380;
const SHAKE_CLASS    = 'is-shaking';

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

  let x = 110;
  let y = 110;
  let vx = 0, vy = 0;
  let onGround = false;

  let dragging   = false;
  let dragOffX   = 0, dragOffY = 0;
  let prevMouseX = 0, prevMouseY = 0;
  let velHistX   = [], velHistY = [];
  const VEL_SAMPLES = 1;

  let rafId = null;

  function setPos(nx, ny) 
  {
    x = nx; 
    y = ny;
    el.style.transform = `translate(${Math.round(x)}px,${Math.round(y)}px)`;
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

  function resolveCollisions() 
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
            onGround = true;
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
          y -= dTop - 1; 
          vy *= -RESTITUTION; 
          if (Math.abs(vy) < RESTITUTION) 
          {
            onGround = true;
          }
        }

        shake(o.el);
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
      let fy = y + hh + GRAVITATION;

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
        let inY = fy > o.top  && fy < o.bottom;

        if (inX && inY) 
        {
          return false;
        }
      }
    }

    return true;
  }

  function tick() 
  {
    if (!dragging) 
    {
      if (checkIfInTheAir()) 
      {
        onGround = false;
      }

      vx *= FRICTION;
      vy *= FRICTION;

      if (!onGround)
      {
        vy += GRAVITATION;
      }

      x += vx;
      y += vy;

      resolveCollisions();

      if (Math.abs(vx) < FRICTION * 0.5) { vx = 0; }
      if (Math.abs(vy) < FRICTION * 0.5) { vy = 0; }

      setPos(x, y);
    }
    rafId = requestAnimationFrame(tick);
  }

  rafId = requestAnimationFrame(tick);

  function onPointerDown(e) 
  {
    e.preventDefault();
    dragging = true;
    onGround = false;
    el.style.cursor = 'grabbing';
    dragOffX = e.clientX - x;
    dragOffY = e.clientY - y;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
    velHistX = []; velHistY = [];
    el.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) 
  {
    if (!dragging) return;
    const nx = e.clientX - dragOffX;
    const ny = e.clientY - dragOffY;

    velHistX.push(e.clientX - prevMouseX);
    velHistY.push(e.clientY - prevMouseY);
    if (velHistX.length > VEL_SAMPLES) 
    { 
      velHistX.shift(); 
      velHistY.shift(); 
    }

    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
    setPos(nx, ny);
  }

  function onPointerUp(e) 
  {
    if (!dragging) return;
    dragging = false;
    el.style.cursor = 'grab';

    const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    vx = avg(velHistX) * 1.6;
    vy = avg(velHistY) * 1.6;

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

})();