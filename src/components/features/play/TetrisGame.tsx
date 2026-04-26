'use client';

import { useEffect, useMemo, useState, type ReactElement } from 'react';

import { audioService } from '@/services/audioService';

type Piece = {
  shape: number[][];
  x: number;
  y: number;
  color: number;
};

const BOARD_W = 10;
const BOARD_H = 18;
const TICK_MS = 520;

const SHAPES: Array<{ shape: number[][]; color: number }> = [
  { shape: [[1, 1, 1, 1]], color: 1 }, // I
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: 2, // J
  },
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: 3, // L
  },
  {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: 4, // O
  },
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: 5, // S
  },
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: 6, // T
  },
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: 7, // Z
  },
];

const COLOR_CLASS: Record<number, string> = {
  0: 'bg-white/10',
  1: 'bg-cyan-300',
  2: 'bg-blue-400',
  3: 'bg-orange-400',
  4: 'bg-yellow-300',
  5: 'bg-lime-300',
  6: 'bg-fuchsia-400',
  7: 'bg-rose-400',
};

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

export function TetrisGame(): ReactElement {
  const [board, setBoard] = useState<number[][]>(() => emptyBoard());
  const [piece, setPiece] = useState<Piece>(() => createPiece());
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);

  const resetGame = () => {
    setBoard(emptyBoard());
    setPiece(createPiece());
    setRunning(true);
    setScore(0);
    setLines(0);
  };

  const stepDown = (): void => {
    if (!running) return;

    if (!collides(board, piece, 0, 1)) {
      setPiece((prev) => ({ ...prev, y: prev.y + 1 }));
      return;
    }

    const merged = lockPiece(board, piece);
    const { board: clearedBoard, lines: removed } = clearLines(merged);
    if (removed > 0) {
      setScore((s) => s + removed * 100);
      setLines((l) => l + removed);
      void audioService.play('pop');
    }

    const nextPiece = createPiece();
    if (collides(clearedBoard, nextPiece)) {
      setBoard(clearedBoard);
      setRunning(false);
      void audioService.play('exhale');
      return;
    }

    setBoard(clearedBoard);
    setPiece(nextPiece);
  };

  const move = (dx: number) => {
    if (!running) return;
    if (!collides(board, piece, dx, 0)) {
      setPiece((prev) => ({ ...prev, x: prev.x + dx }));
    }
  };

  const rotate = () => {
    if (!running) return;
    const rotated = rotateRight(piece.shape);
    if (!collides(board, piece, 0, 0, rotated)) {
      setPiece((prev) => ({ ...prev, shape: rotated }));
    }
  };

  const hardDrop = () => {
    if (!running) return;
    let drop = 0;
    while (!collides(board, piece, 0, drop + 1)) {
      drop += 1;
    }
    setPiece((prev) => ({ ...prev, y: prev.y + drop }));
    setTimeout(stepDown, 0);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') move(-1);
      if (e.key === 'ArrowRight') move(1);
      if (e.key === 'ArrowDown') stepDown();
      if (e.key === 'ArrowUp') rotate();
      if (e.key === ' ') {
        e.preventDefault();
        hardDrop();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(stepDown, TICK_MS);
    return () => window.clearInterval(id);
  });

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
    <div className="mx-auto w-full max-w-md">
      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-white/80">Score: {score}</p>
        <p className="text-sm font-semibold text-white/80">Lines: {lines}</p>
        {!running && (
          <button
            type="button"
            onClick={resetGame}
            className="rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 text-sm font-semibold"
          >
            Restart
          </button>
        )}
      </div>

      <div className="grid grid-cols-[repeat(10,minmax(0,1fr))] gap-1 rounded-xl bg-black/35 p-2">
        {renderBoard.flatMap((row, y) =>
          row.map((cell, x) => (
            <div key={`${x}:${y}`} className={['aspect-square rounded-sm', COLOR_CLASS[cell]].join(' ')} />
          ))
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <button type="button" className="rounded-lg border border-white/20 bg-white/10 py-2" onClick={() => move(-1)}>
          Left
        </button>
        <button type="button" className="rounded-lg border border-white/20 bg-white/10 py-2" onClick={rotate}>
          Rotate
        </button>
        <button type="button" className="rounded-lg border border-white/20 bg-white/10 py-2" onClick={() => move(1)}>
          Right
        </button>
        <button type="button" className="rounded-lg border border-white/20 bg-white/10 py-2" onClick={stepDown}>
          Down
        </button>
        <button
          type="button"
          className="col-span-2 rounded-lg border border-white/20 bg-white/10 py-2"
          onClick={hardDrop}
        >
          Drop
        </button>
      </div>
    </div>
  );
}
