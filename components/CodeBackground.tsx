
import React, { useEffect, useRef } from 'react';
import { SQL_SNIPPETS, CSHARP_SNIPPETS, TS_SNIPPETS } from '../utils/codeSnippets';

// --- CONFIGURATION ---
const FONT_SIZE = 10; 
const LINE_HEIGHT = 1.6;
const FONT_FAMILY = '"Fira Code", "Consolas", "Monaco", monospace';

// Speed calibration: 0.3 tokens per frame
const SPEED = 0.3; 
const OPACITY_TEXT = 0.1; 

const COLORS = {
  DEFAULT: '#d4d4d4',
  KEYWORD: '#569cd6',     
  TYPE: '#4ec9b0',        
  STRING: '#ce9178',      
  FUNCTION: '#dcdcaa',    
  COMMENT: '#6a9955',     
  NUMBER: '#b5cea8',
  OPERATOR: '#d4d4d4',
  CONTROL: '#c586c0',     
};

// --- TYPES ---
type Token = { text: string; color: string };
type LayoutItem = { 
  token: Token; 
  x: number; 
  y: number; 
  colIndex: number; 
};

type ColumnState = {
  layouts: LayoutItem[];
  totalHeight: number;
  progress: number; // Current token index
  scrollY: number;  // Visual scroll offset
  isHovered: boolean;
};

// --- TOKENIZER ---
const tokenize = (code: string): Token[] => {
  const tokens: Token[] = [];
  const keywords = [
    'WITH', 'SELECT', 'FROM', 'WHERE', 'GROUP', 'BY', 'ORDER', 'DESC', 'AS', 'SUM', 'COUNT', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'AND', 'OR', 'IS', 'NOT', 'NULL', 'TOP', 'DISTINCT', 'OVER', 'PARTITION', 'LAG', 'FORMAT', 'INSERT', 'UPDATE', 'DELETE', 'CAST', 'DATE_TRUNC', 'AVG', 'HAVING', 'MAX', 'MIN',
    'using', 'namespace', 'public', 'private', 'protected', 'class', 'void', 'string', 'int', 'bool', 'var', 'new', 'return', 'if', 'else', 'try', 'catch', 'throw', 'async', 'await', 'Task', 'interface', 'readonly', 'static', 'get', 'set', 'typeof',
    'import', 'from', 'export', 'default', 'const', 'let', 'function', 'return', 'null', 'undefined', 'true', 'false', 'type', 'interface', 'implements', 'extends', 'constructor'
  ].join('|');

  const regex = new RegExp(
    `(\\/\\/.*$|--.*$|\\/\\*[\\s\\S]*?\\*\\/)` + // Comments
    `|(".*?"|'.*?'|\`.*?\`)` +            // Strings
    `|(\\b(${keywords})\\b)` +            // Keywords
    `|(\\r?\\n)` +                        // Newlines
    `|(\\b[A-Z][a-zA-Z0-9_]*\\b)` +       // Types/Classes
    `|(\\.[a-zA-Z0-9_]+)` +               // Methods/Properties
    `|(\\d+(\\.\\d+)?)` +                 // Numbers
    `|([{}()\\[\\].<>,:;?])` +            // Punctuation
    `|([ \\t]+)` +                        // Indentation/Spaces
    `|([a-z][a-zA-Z0-9_]*)`,              // Identifiers
    'gm'
  );

  let match;
  while ((match = regex.exec(code)) !== null) {
    const text = match[0];
    let color = COLORS.DEFAULT;
    if (match[1]) color = COLORS.COMMENT;
    else if (match[2]) color = COLORS.STRING;
    else if (match[3]) color = COLORS.KEYWORD;
    else if (match[5]) { tokens.push({ text: '\n', color: COLORS.DEFAULT }); continue; }
    else if (match[6]) color = COLORS.TYPE;
    else if (match[7]) color = COLORS.FUNCTION; 
    else if (match[8]) color = COLORS.NUMBER;
    else if (match[10]) color = COLORS.OPERATOR;
    else if (match[11]) { tokens.push({ text, color: COLORS.DEFAULT }); continue; }
    tokens.push({ text, color });
  }
  return tokens;
};

export const CodeBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1, y: -1 });
  const isMobileRef = useRef(false);
  const columnsRef = useRef<ColumnState[]>([]);

  const calculateColumnLayout = (
    ctx: CanvasRenderingContext2D, 
    snippets: string[], 
    xStart: number, 
    width: number, 
    colIndex: number
  ): ColumnState => {
    const layouts: LayoutItem[] = [];
    let currentY = 20; 
    const effectiveWidth = width - 30;
    const fullQueue = [...snippets, ...snippets, ...snippets, ...snippets];

    fullQueue.forEach((code) => {
      const tokens = tokenize(code);
      let currentX = xStart;
      tokens.forEach((token) => {
        if (token.text === '\n') {
          currentY += FONT_SIZE * LINE_HEIGHT;
          currentX = xStart;
          return;
        }
        const w = ctx.measureText(token.text).width;
        if (currentX + w > xStart + effectiveWidth) {
           currentY += FONT_SIZE * LINE_HEIGHT;
           currentX = xStart;
        }
        layouts.push({ token, x: currentX, y: currentY, colIndex });
        currentX += w;
      });
      currentY += (FONT_SIZE * LINE_HEIGHT) * 3;
    });

    return { layouts, totalHeight: currentY, progress: 0, scrollY: 0, isHovered: false };
  };

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      const dpr = window.devicePixelRatio || 1;
      canvasRef.current.width = clientWidth * dpr;
      canvasRef.current.height = clientHeight * dpr;
      canvasRef.current.style.width = `${clientWidth}px`;
      canvasRef.current.style.height = `${clientHeight}px`;

      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
        const isMobile = clientWidth < 768;
        isMobileRef.current = isMobile;

        if (isMobile) {
            columnsRef.current = [calculateColumnLayout(ctx, TS_SNIPPETS, 15, clientWidth, 0)];
        } else {
            const colW = clientWidth / 3;
            columnsRef.current = [
                calculateColumnLayout(ctx, SQL_SNIPPETS, 15, colW, 0),
                calculateColumnLayout(ctx, CSHARP_SNIPPETS, colW + 15, colW, 1),
                calculateColumnLayout(ctx, TS_SNIPPETS, (colW * 2) + 15, colW, 2)
            ];
        }
      }
    };
    handleResize();
    const t = setTimeout(handleResize, 100);
    window.addEventListener('resize', handleResize);
    return () => { clearTimeout(t); window.removeEventListener('resize', handleResize); }
  }, []);

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isMobileRef.current && containerRef.current) {
        let clientX = 0;
        if ('touches' in e) { clientX = e.touches[0].clientX; } else { clientX = (e as MouseEvent).clientX; }
        mouseRef.current.x = clientX;
      }
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchstart', handleMove);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchstart', handleMove);
    };
  }, []);

  useEffect(() => {
    let frameId: number;
    const animate = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx || !containerRef.current) {
        frameId = requestAnimationFrame(animate);
        return;
      }
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      if (isMobileRef.current) {
          // Mobile always scrolls
          columnsRef.current.forEach(col => col.progress += SPEED);
      } else {
         const mx = mouseRef.current.x;
         const colW = width / 3;
         columnsRef.current.forEach((col, idx) => {
             const xMin = idx * colW;
             const xMax = (idx + 1) * colW;
             // Logic Reversed: If hovered, do NOT increment progress (hold)
             if (mx >= xMin && mx < xMax) {
                 col.isHovered = true;
             }
             // ARCHITECTURAL CHANGE: Always increment progress, regardless of hover state
             
             // Update hover state but ALWAYS increment progress
             col.isHovered = (mx >= xMin && mx < xMax);
             col.progress += SPEED;
         });
      }

      ctx.clearRect(0, 0, width, height);
      ctx.font = `${FONT_SIZE}px ${FONT_FAMILY}`;
      ctx.textBaseline = 'top';

      columnsRef.current.forEach(col => {
          const visibleLimit = Math.floor(col.progress);
          if (visibleLimit < col.layouts.length && visibleLimit > 0) {
              const lastToken = col.layouts[visibleLimit - 1];
              const targetY = lastToken.y;
              if (targetY - col.scrollY > height - 60) {
                  col.scrollY += (targetY - col.scrollY - (height - 60)) * 0.1; 
              }
          }
          if (visibleLimit >= col.layouts.length) {
              col.progress = 0;
              col.scrollY = 0;
          }

          ctx.save();
          ctx.translate(0, -col.scrollY);
          const viewportTop = col.scrollY;
          const viewportBottom = col.scrollY + height;
          ctx.globalAlpha = OPACITY_TEXT;

          for (let i = 0; i < Math.min(visibleLimit, col.layouts.length); i++) {
              const item = col.layouts[i];
              if (item.y + FONT_SIZE < viewportTop) continue;
              if (item.y > viewportBottom) break;
              ctx.fillStyle = item.token.color;
              ctx.fillText(item.token.text, item.x, item.y);
          }
          if (visibleLimit < col.layouts.length) {
              const cursorItem = col.layouts[visibleLimit];
              if (cursorItem) {
                  const now = Date.now();
                  const isBlink = Math.floor(now / 500) % 2 === 0;
                  if (isBlink) {
                      ctx.globalAlpha = 0.8;
                      ctx.fillStyle = COLORS.DEFAULT; 
                      ctx.fillRect(cursorItem.x, cursorItem.y, 8, FONT_SIZE);
                  }
              }
          }
          ctx.restore();
      });
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none bg-slate-900" aria-hidden="true">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
