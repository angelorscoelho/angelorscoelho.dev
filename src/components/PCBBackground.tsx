import React, { useEffect, useRef } from 'react';

// --- CONFIGURATION ---
const GRID_SIZE = 60;         // Grid spacing in pixels
const BASE_WALKERS = 8;       // Slightly higher base density
const MAX_WALKERS = 30;       // Max density during interaction
const MAX_TRAIL_LENGTH = 14;  // Tail length
const SPEED = 0.04;           // Movement speed
const ENERGY_DECAY = 0.005;   // Interaction decay

// Visuals
const COLOR_ACCENT = '#2dd4bf'; // Tailwind teal-300
const COLOR_HEAD = '#f0fdfa';   // Tailwind teal-50

type Point = { x: number; y: number };

// --- LOGIC CLASSES ---

class OccupancyMap {
  private occupied = new Set<string>();
  public gridW: number = 0;
  public gridH: number = 0;

  private key(x: number, y: number) { return `${x},${y}`; }

  has(x: number, y: number) {
    return this.occupied.has(this.key(x, y));
  }

  add(x: number, y: number) {
    this.occupied.add(this.key(x, y));
  }

  remove(x: number, y: number) {
    this.occupied.delete(this.key(x, y));
  }

  clear() {
    this.occupied.clear();
  }
}

class Walker {
  x: number; y: number;         
  nextX: number; nextY: number; 
  dir: Point; // Constant direction
  t: number;  // Interpolation (0.0 -> 1.0)
  
  path: Point[];                
  state: 'ALIVE' | 'DEAD'; 

  constructor(gw: number, gh: number, map: OccupancyMap) {
    this.state = 'ALIVE';
    this.path = [];
    this.t = 0;
    this.x = 0; this.y = 0;
    this.nextX = 0; this.nextY = 0;
    this.dir = { x: 0, y: 0 };

    let spawned = false;
    const attempts = 20;

    for (let i = 0; i < attempts; i++) {
        const edge = Math.floor(Math.random() * 4); // 0:Top, 1:Right, 2:Bottom, 3:Left
        let sx = 0, sy = 0;
        let candidates: Point[] = [];

        switch(edge) {
            case 0: // Top (Down, SE, SW)
                sx = Math.floor(Math.random() * gw); 
                sy = 0; 
                candidates = [{x:0, y:1}, {x:1, y:1}, {x:-1, y:1}];
                break;
            case 1: // Right (Left, NW, SW)
                sx = gw - 1; 
                sy = Math.floor(Math.random() * gh); 
                candidates = [{x:-1, y:0}, {x:-1, y:1}, {x:-1, y:-1}];
                break;
            case 2: // Bottom (Up, NE, NW)
                sx = Math.floor(Math.random() * gw); 
                sy = gh - 1; 
                candidates = [{x:0, y:-1}, {x:1, y:-1}, {x:-1, y:-1}];
                break;
            case 3: // Left (Right, NE, SE)
                sx = 0; 
                sy = Math.floor(Math.random() * gh); 
                candidates = [{x:1, y:0}, {x:1, y:-1}, {x:1, y:1}];
                break;
        }

        if (!map.has(sx, sy)) {
            this.x = sx; 
            this.y = sy;
            // Pick one direction and STICK TO IT forever
            this.dir = candidates[Math.floor(Math.random() * candidates.length)];
            
            // Initial setup
            this.nextX = sx; 
            this.nextY = sy;
            this.path.push({ x: sx, y: sy });
            map.add(sx, sy);
            
            spawned = true;
            // Calculate first move immediately so we are ready to interpolate
            this.planNextStep(gw, gh, map);
            break;
        }
    }

    if (!spawned) {
        this.state = 'DEAD';
    }
  }

  planNextStep(gw: number, gh: number, map: OccupancyMap) {
    if (this.state === 'DEAD') return;

    // Strict Trajectory: Always move in the same direction
    const nx = this.x + this.dir.x;
    const ny = this.y + this.dir.y;

    // 1. Check if Exiting Viewport
    if (nx < 0 || nx >= gw || ny < 0 || ny >= gh) {
        // We are going off-grid. Allow it.
        // We do NOT reserve off-grid coordinates.
        this.nextX = nx;
        this.nextY = ny;
        return;
    }

    // 2. Check Collision (Only if inside grid)
    if (map.has(nx, ny)) {
        // Blocked by another walker -> Die immediately
        this.state = 'DEAD';
        return;
    }

    // 3. Move Valid
    this.nextX = nx;
    this.nextY = ny;
    map.add(nx, ny);
  }

  update(gw: number, gh: number, map: OccupancyMap) {
    if (this.state === 'DEAD') return;

    this.t += SPEED;

    // Turn complete
    if (this.t >= 1) {
        this.t = 0;
        
        // Push current head to path (which was the 'next' we just arrived at)
        // Wait, logic:
        // Frame 0: x=0, next=1. t=0. Draw line 0->1 interpolated.
        // Frame N: t=1. Arrived at 1. 
        // We push 1 to path. x becomes 1. next becomes 2.
        
        // Actually, x is "current tail of the head segment", nextX is "current tip".
        // When t=1, we have fully traversed x->nextX.
        // So nextX becomes the new anchor x.
        
        this.path.push({ x: this.nextX, y: this.nextY }); // Add the point we just reached
        
        // Update physics pos
        this.x = this.nextX;
        this.y = this.nextY;

        // Clean up tail
        if (this.path.length > MAX_TRAIL_LENGTH) {
            const removed = this.path.shift();
            // Remove from map if it was a valid grid point
            if (removed && removed.x >= 0 && removed.x < gw && removed.y >= 0 && removed.y < gh) {
                map.remove(removed.x, removed.y);
            }
        }

        // Check if fully off-screen (Death condition)
        // We kill it if the head is significantly out of bounds
        // to ensure the tail has also likely cleared or is irrelevant.
        const buffer = 4; // Allow plenty of space for tail to flow out
        if (this.x < -buffer || this.x > gw + buffer || this.y < -buffer || this.y > gh + buffer) {
             this.state = 'DEAD';
        }

        this.planNextStep(gw, gh, map);
    }
  }

  cleanup(map: OccupancyMap) {
     this.path.forEach(p => {
         if (p.x >= 0 && p.x < map.gridW && p.y >= 0 && p.y < map.gridH) {
             map.remove(p.x, p.y);
         }
     });
     // Also clear the reserved next step if it was in grid
     if (this.nextX >= 0 && this.nextX < map.gridW && this.nextY >= 0 && this.nextY < map.gridH) {
        map.remove(this.nextX, this.nextY);
     }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.state === 'DEAD' || this.path.length === 0) return;

    const sz = GRID_SIZE;
    const offset = sz / 2;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // CONTINUOUS TRAIL RENDERING
    // tipIndex represents the floating point index of the "head" along the path array
    // path[0] is tail, path[length-1] is the point we just left. 
    // Wait, in update() we push nextX to path when we reach it.
    // So while moving between x and nextX, x is NOT in path?
    
    // Correction on update/draw cycle:
    // In update(): we start at x. nextX is target.
    // path contains history ending at x.
    // t goes 0->1.
    // When t=1: push nextX to path. x=nextX. calc new nextX.
    
    // So visually:
    // We draw path[0]...path[last]
    // AND we draw segment path[last] -> nextX (interpolated by t)
    
    // Total visual length = path.length + t.
    const totalLen = this.path.length + this.t;

    // 1. Draw Path History
    for (let i = 0; i < this.path.length - 1; i++) {
        const p1 = this.path[i];
        const p2 = this.path[i+1];
        
        // Index of p1 is i.
        // Distance from tip = totalLen - i.
        // Example: path len 5. t=0.5. Total=5.5.
        // i=0. Dist=5.5. 
        // i=4 (last segment start). Dist=1.5.
        
        const dist = totalLen - i;
        const alpha = Math.max(0, 1 - (dist / MAX_TRAIL_LENGTH));
        
        if (alpha <= 0) continue;

        ctx.beginPath();
        ctx.moveTo(p1.x * sz + offset, p1.y * sz + offset);
        ctx.lineTo(p2.x * sz + offset, p2.y * sz + offset);
        
        ctx.strokeStyle = COLOR_ACCENT;
        ctx.lineWidth = 0.5 + (alpha * 2.5);
        ctx.globalAlpha = alpha * 0.4;
        ctx.stroke();
    }

    // 2. Draw Active Head Segment (from path[last] to interpolated next)
    if (this.path.length > 0) {
        const last = this.path[this.path.length - 1];
        
        const headX = (last.x * (1 - this.t) + this.nextX * this.t) * sz + offset;
        const headY = (last.y * (1 - this.t) + this.nextY * this.t) * sz + offset;
        
        // This segment is at the very front, so alpha ~ 1.0
        ctx.beginPath();
        ctx.moveTo(last.x * sz + offset, last.y * sz + offset);
        ctx.lineTo(headX, headY);
        
        ctx.strokeStyle = COLOR_ACCENT;
        ctx.lineWidth = 3; 
        ctx.globalAlpha = 0.6; 
        ctx.stroke();

        // 3. Glowing Tip
        ctx.fillStyle = COLOR_HEAD;
        ctx.shadowBlur = 10;
        ctx.shadowColor = COLOR_ACCENT;
        ctx.globalAlpha = 1.0;
        
        ctx.beginPath();
        ctx.arc(headX, headY, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
  }
}

export const PCBBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  
  const interactionRef = useRef({ energy: 0 });
  const mapRef = useRef(new OccupancyMap());
  const state = useRef({
    width: 0, height: 0,
    gridW: 0, gridH: 0,
    walkers: [] as Walker[]
  });

  const updateDimensions = () => {
    if (!containerRef.current || !canvasRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    
    if (Math.abs(clientWidth - state.current.width) > 50 || Math.abs(clientHeight - state.current.height) > 50) {
      canvasRef.current.width = clientWidth;
      canvasRef.current.height = clientHeight;
      state.current.width = clientWidth;
      state.current.height = clientHeight;
      state.current.gridW = Math.ceil(clientWidth / GRID_SIZE);
      state.current.gridH = Math.ceil(clientHeight / GRID_SIZE);
      
      // Update map grid size reference for cleanup checks
      mapRef.current.gridW = state.current.gridW;
      mapRef.current.gridH = state.current.gridH;
      
      mapRef.current.clear();
      state.current.walkers = [];
    }
  };

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const boost = () => { interactionRef.current.energy = 1.0; };
    const events = ['scroll', 'mousemove', 'touchstart', 'click'];
    events.forEach(e => window.addEventListener(e, boost));
    return () => events.forEach(e => window.removeEventListener(e, boost));
  }, []);

  useEffect(() => {
    const animate = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) {
        requestRef.current = requestAnimationFrame(animate);
        return;
      }

      const { width, height, gridW, gridH, walkers } = state.current;
      const map = mapRef.current;

      ctx.clearRect(0, 0, width, height);

      // Draw Grid Dots
      ctx.fillStyle = COLOR_ACCENT;
      ctx.globalAlpha = 0.05;
      for (let gx = 0; gx <= gridW; gx++) {
        for (let gy = 0; gy <= gridH; gy++) {
            const px = gx * GRID_SIZE + GRID_SIZE/2;
            const py = gy * GRID_SIZE + GRID_SIZE/2;
            ctx.beginPath();
            ctx.arc(px, py, 1, 0, Math.PI * 2);
            ctx.fill();
        }
      }

      // Physics & Spawning
      interactionRef.current.energy = Math.max(0, interactionRef.current.energy - ENERGY_DECAY);
      const targetCount = Math.floor(
          BASE_WALKERS + (MAX_WALKERS - BASE_WALKERS) * interactionRef.current.energy
      );

      if (walkers.length < targetCount && Math.random() < 0.1) {
          walkers.push(new Walker(gridW, gridH, map));
      }

      // Update & Draw
      for (let i = walkers.length - 1; i >= 0; i--) {
        const walker = walkers[i];
        walker.update(gridW, gridH, map);
        
        if ((walker.state as string) === 'DEAD') {
            walker.cleanup(map);
            walkers.splice(i, 1);
        } else {
            walker.draw(ctx);
        }
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
};
