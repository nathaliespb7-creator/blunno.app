'use client';

import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react';

import { audioService } from '@/services/audioService';

type Piece = {
  shape: number[][];
  x: number;
  y: number;
  color: number;
};

const BOARD_W = 10;
const BOARD_H = 20;

const PIECE_COLOR_CLASS: Record<number, string> = {
  0: 'bg-[#0B132B]',
  1: 'bg-[#2DD4BF]',
  2: 'bg-[#FB7185]',
  3: 'bg-[#F59E0B]',
  4: 'bg-[#FDE047]',
  5: 'bg-[#4ADE80]',
  6: 'bg-[#A78BFA]',
  7: 'bg-[#F97316]',
};

const SHAPES: Array<{ shape: number[][]; color: number }> = [
  { shape: [[1, 1, 1, 1]], color: 1 },
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: 2,
  },
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: 3,
  },
  {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: 4,
  },
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: 5,
  },
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: 6,
  },
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: 7,
  },
];

function emptyBoard(): number[][] {
  return Array.from({ length: BOARD_H }, () => Array.from({ length: BOARD_W }, () => 0));
}

function cloneShape(shape: number[][]): number[][] {
  return shape.map((row) => [...row]);
}

function createPiece(): Piece {
  const selected = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const shape = cloneShape(selected.shape);
  const x = Math.floor((BOARD_W - shape[0].length) / 2);
  return { shape, x, y: 0, color: selected.color };
}

function rotateRight(shape: number[][]): number[][] {
  const h = shape.length;
  const w = shape[0].length;
  const next = Array.from({ length: w }, () => Array.from({ length: h }, () => 0));
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      next[x][h - 1 - y] = shape[y][x];
    }
  }
  return next;
}

function collides(board: number[][], piece: Piece, dx = 0, dy = 0, shape?: number[][]): boolean {
  const matrix = shape ?? piece.shape;
  for (let y = 0; y < matrix.length; y += 1) {
    for (let x = 0; x < matrix[y].length; x += 1) {
      if (!matrix[y][x]) continue;
      const nx = piece.x + x + dx;
      const ny = piece.y + y + dy;
      if (nx < 0 || nx >= BOARD_W || ny >= BOARD_H) return true;
      if (ny >= 0 && board[ny][nx] !== 0) return true;
    }
  }
  return false;
}

function lockPiece(board: number[][], piece: Piece): number[][] {
  const next = board.map((row) => [...row]);
  for (let y = 0; y < piece.shape.length; y += 1) {
    for (let x = 0; x < piece.shape[y].length; x += 1) {
      if (!piece.shape[y][x]) continue;
      const by = piece.y + y;
      const bx = piece.x + x;
      if (by >= 0 && by < BOARD_H && bx >= 0 && bx < BOARD_W) {
        next[by][bx] = piece.color;
      }
    }
  }
  return next;
}

function clearLines(board: number[][]): { board: number[][]; lines: number } {
  const kept = board.filter((row) => row.some((cell) => cell === 0));
  const lines = BOARD_H - kept.length;
  const padded = Array.from({ length: lines }, () => Array.from({ length: BOARD_W }, () => 0));
  return { board: [...padded, ...kept], lines };
}

export function BlunnoTetris(): ReactElement {
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const [board, setBoard] = useState<number[][]>(() => emptyBoard());
  const [piece, setPiece] = useState<Piece>(() => createPiece());
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [topScore, setTopScore] = useState(() => {
    if (typeof window === 'undefined') return 0;
    const parsed = Number(window.localStorage.getItem('blunno.tetris.topScore') ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
  });

  const level = Math.max(1, Math.floor(lines / 10) + 1);
  const speed = useMemo(() => Math.floor(500 / (level + 1)), [level]);

  const unlockAudioOnce = useCallback((): void => {
    if (isAudioUnlocked) return;
    setIsAudioUnlocked(true);
    void audioService.ensureUnlocked();
  }, [isAudioUnlocked]);

  const reset = useCallback(() => {
    setBoard(emptyBoard());
    setPiece(createPiece());
    setScore(0);
    setLines(0);
    setRunning(true);
  }, []);

  const move = useCallback((dx: number) => {
    setPiece((prev) => {
      if (!running || collides(board, prev, dx, 0)) return prev;
      return { ...prev, x: prev.x + dx };
    });
  }, [board, running]);

  const rotate = useCallback(() => {
    setPiece((prev) => {
      if (!running) return prev;
      const rotated = rotateRight(prev.shape);
      if (collides(board, prev, 0, 0, rotated)) return prev;
      return { ...prev, shape: rotated };
    });
  }, [board, running]);

  const stepDown = useCallback(() => {
    if (!running) return;

    if (!collides(board, piece, 0, 1)) {
      setPiece((prev) => ({ ...prev, y: prev.y + 1 }));
      return;
    }

    const merged = lockPiece(board, piece);
    const { board: cleared, lines: removed } = clearLines(merged);
    if (removed > 0) {
      setScore((s) => s + removed * 100);
      setLines((l) => l + removed);
      void audioService.play('pop');
    }

    const next = createPiece();
    if (collides(cleared, next)) {
      setBoard(cleared);
      setRunning(false);
      void audioService.play('exhale');
      return;
    }

    setBoard(cleared);
    setPiece(next);
  }, [board, piece, running]);

  useEffect(() => {
    if (!running) return;
    const tick = Math.max(80, 520 - (level - 1) * 35);
    const id = window.setInterval(stepDown, tick);
    return () => window.clearInterval(id);
  }, [running, level, stepDown]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') move(-1);
      if (e.key === 'ArrowRight') move(1);
      if (e.key === 'ArrowDown') stepDown();
      if (e.key === 'ArrowUp') rotate();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [move, rotate, stepDown]);

  useEffect(() => {
    if (score <= topScore) return;
    const id = window.setTimeout(() => {
      setTopScore(score);
      window.localStorage.setItem('blunno.tetris.topScore', String(score));
    }, 0);
    return () => window.clearTimeout(id);
  }, [score, topScore]);

  const renderBoard = useMemo(() => {
    const view = board.map((row) => [...row]);
    for (let y = 0; y < piece.shape.length; y += 1) {
      for (let x = 0; x < piece.shape[y].length; x += 1) {
        if (!piece.shape[y][x]) continue;
        const by = piece.y + y;
        const bx = piece.x + x;
        if (by >= 0 && by < BOARD_H && bx >= 0 && bx < BOARD_W) {
          view[by][bx] = piece.color;
        }
      }
    }
    return view;
  }, [board, piece]);

  return (
    <div
      className="mx-auto flex h-full min-h-0 w-full max-w-[920px] flex-col items-center justify-between gap-2 overflow-hidden bg-[#0D0524] p-2 text-white sm:p-3"
      onPointerDown={unlockAudioOnce}
    >
      <div className="grid w-full max-w-[460px] grid-cols-2 gap-2">
        <div className="rounded-xl border border-white/25 bg-gradient-to-br from-[#2C1948] to-[#6A3CAE] p-2 text-center shadow-lg [box-shadow:inset_0_1px_0_rgba(255,255,255,0.12)]">
          <p className="text-xs tracking-wide text-white/85">SCORE</p>
          <p className="text-xl font-extrabold text-[#00FFD1] sm:text-3xl">{score}</p>
        </div>
        <div className="rounded-xl border border-[#E7B453]/50 bg-gradient-to-br from-[#3d3224] to-[#5c4a32] p-2 text-center shadow-lg ring-1 ring-[#F5D78A]/25 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.1)]">
          <p className="text-xs tracking-wide text-[#FEF3C7]/95">TOP</p>
          <p className="text-xl font-extrabold text-[#FFFBEB] [text-shadow:0_1px_3px_rgba(0,0,0,0.45)] sm:text-3xl">
            {topScore}
          </p>
        </div>
      </div>

      <div className="h-[min(46dvh,500px)] w-full max-w-[360px] rounded-2xl border border-[#2DD4BF]/20 bg-white/8 p-2 shadow-lg backdrop-blur-sm">
        <div className="grid h-full grid-cols-[repeat(10,minmax(0,1fr))] gap-1">
          {renderBoard.flatMap((row, y) =>
            row.map((cell, x) => <div key={`${x}-${y}`} className={['rounded-[3px]', PIECE_COLOR_CLASS[cell]].join(' ')} />)
          )}
        </div>
      </div>

      <div className="grid w-full max-w-[460px] grid-cols-4 gap-2">
        <div className="rounded-xl border border-[#C084FC]/40 bg-gradient-to-br from-[#2a1f2e]/95 to-[#3d2a42]/90 px-3 py-2 text-center shadow-sm [box-shadow:inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm">
          <p className="text-xs tracking-wide text-[#E9D5FF]/90">COMBO</p>
          <p className="text-base font-bold text-[#F0ABFC] [text-shadow:0_1px_2px_rgba(0,0,0,0.35)] sm:text-xl">0</p>
        </div>
        <div className="rounded-xl border border-[#83A9AD]/45 bg-gradient-to-br from-[#283334]/95 to-[#3d4f52]/88 px-3 py-2 text-center shadow-sm [box-shadow:inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm">
          <p className="text-xs tracking-wide text-[#C5E3E5]/90">LINES</p>
          <p className="text-base font-bold text-[#B8D9DB] [text-shadow:0_1px_2px_rgba(0,0,0,0.35)] sm:text-xl">{lines}</p>
        </div>
        <div className="rounded-xl border border-[#A78BFA]/45 bg-gradient-to-br from-[#24183a]/95 to-[#3b2d5c]/90 px-3 py-2 text-center shadow-sm [box-shadow:inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm">
          <p className="text-xs tracking-wide text-[#DDD6FE]/90">LEVEL</p>
          <p className="text-base font-bold text-[#C4B5FD] [text-shadow:0_1px_2px_rgba(0,0,0,0.35)] sm:text-xl">{level}</p>
        </div>
        <div className="rounded-xl border border-[#E7B453]/45 bg-gradient-to-br from-[#2f2618]/95 to-[#4a3d28]/88 px-3 py-2 text-center shadow-sm [box-shadow:inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm">
          <p className="text-xs tracking-wide text-[#FEF3C7]/90">SPEED</p>
          <p className="text-base font-bold text-[#FFFBEB] [text-shadow:0_1px_3px_rgba(0,0,0,0.45)] sm:text-xl">{speed}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-[#BDB2FF] px-7 py-1.5 text-sm font-bold text-white transition hover:scale-105 hover:bg-[#a89cfa] sm:py-2"
      >
        {running ? 'RESTART' : 'START'}
      </button>

      <div className="grid w-full max-w-xs grid-cols-4 gap-2 text-center">
        <button
          type="button"
          className="rounded-xl border border-[#2DD4BF]/50 bg-[#0F2A33] py-1 text-base font-semibold text-[#CCFFF5] transition hover:bg-[#153845] sm:py-2 sm:text-lg"
          onClick={() => move(-1)}
          aria-label="Move left"
        >
          ←
        </button>
        <button
          type="button"
          className="rounded-xl border border-[#67E8F9]/50 bg-[#0F2536] py-1 text-base font-semibold text-[#DDF8FF] transition hover:bg-[#17344A] sm:py-2 sm:text-lg"
          onClick={stepDown}
          aria-label="Move down"
        >
          ↓
        </button>
        <button
          type="button"
          className="rounded-xl border border-[#2DD4BF]/50 bg-[#0F2A33] py-1 text-base font-semibold text-[#CCFFF5] transition hover:bg-[#153845] sm:py-2 sm:text-lg"
          onClick={() => move(1)}
          aria-label="Move right"
        >
          →
        </button>
        <button
          type="button"
          className="rounded-xl border border-[#C4B5FD]/60 bg-[#281C45] py-1 text-base font-semibold text-[#F0E9FF] transition hover:bg-[#34255B] sm:py-2 sm:text-lg"
          onClick={rotate}
          aria-label="Rotate piece"
        >
          ↻
        </button>
      </div>
    </div>
  );
}
