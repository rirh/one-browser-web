import { scoreQrPenalty } from '@/components/ui/qr-code/scoring';
import { cn } from '@/lib/utils';
import * as React from 'react';

const VERSION = 5;
const ERROR_CORRECTION_CODEWORDS = 26;
const DATA_CODEWORDS = 108;
const MODULE_COUNT = 21 + (VERSION - 1) * 4;
const QUIET_ZONE = 4;
const FORMAT_GENERATOR = 0x537;
const FORMAT_MASK = 0x5412;

type QrCodeProps = React.ComponentProps<'svg'> & {
  value: string;
  size?: number;
};

export function QrCode({
  value,
  size = 120,
  className,
  ...props
}: QrCodeProps) {
  const modules = React.useMemo(() => createQrModules(value), [value]);
  const viewBoxSize = MODULE_COUNT + QUIET_ZONE * 2;

  return (
    <svg
      role="img"
      aria-label="邀请链接二维码"
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      width={size}
      height={size}
      className={cn('block', className)}
      shapeRendering="crispEdges"
      {...props}
    >
      <rect width={viewBoxSize} height={viewBoxSize} fill="#fff" />
      <path d={modulesToPath(modules)} fill="#000" />
    </svg>
  );
}

export function createQrCodeSvgMarkup(value: string, size = 512) {
  const modules = createQrModules(value);
  const viewBoxSize = MODULE_COUNT + QUIET_ZONE * 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}" shape-rendering="crispEdges"><rect width="${viewBoxSize}" height="${viewBoxSize}" fill="#fff"/><path d="${modulesToPath(modules)}" fill="#000"/></svg>`;
}

function createQrModules(value: string) {
  const bytes = Array.from(new TextEncoder().encode(value));
  if (bytes.length > 106) {
    return createFallbackModules(value);
  }

  const codewords = createCodewords(bytes);
  const base = createBaseMatrix();
  placeData(base.modules, base.reserved, codewords);

  let bestModules: boolean[][] | null = null;
  let bestPenalty = Number.POSITIVE_INFINITY;
  let bestMask = 0;

  for (let mask = 0; mask < 8; mask += 1) {
    const candidate = applyMask(base.modules, base.reserved, mask);
    drawFormatBits(candidate, base.reserved, mask);
    const penalty = scoreQrPenalty(candidate);
    if (penalty < bestPenalty) {
      bestPenalty = penalty;
      bestModules = candidate;
      bestMask = mask;
    }
  }

  const modules =
    bestModules ?? applyMask(base.modules, base.reserved, bestMask);
  drawFormatBits(modules, base.reserved, bestMask);
  return modules;
}

function createFallbackModules(value: string) {
  const bytes = Array.from(new TextEncoder().encode(value.slice(0, 106)));
  const base = createBaseMatrix();
  placeData(base.modules, base.reserved, createCodewords(bytes));
  const modules = applyMask(base.modules, base.reserved, 0);
  drawFormatBits(modules, base.reserved, 0);
  return modules;
}

function createCodewords(dataBytes: number[]) {
  const bits = new BitBuffer();
  bits.append(0b0100, 4);
  bits.append(dataBytes.length, 8);
  for (const byte of dataBytes) {
    bits.append(byte, 8);
  }

  bits.append(0, Math.min(4, DATA_CODEWORDS * 8 - bits.length));
  while (bits.length % 8 !== 0) {
    bits.append(0, 1);
  }

  const dataCodewords = bits.toBytes();
  for (let padIndex = 0; dataCodewords.length < DATA_CODEWORDS; padIndex += 1) {
    dataCodewords.push(padIndex % 2 === 0 ? 0xec : 0x11);
  }

  return dataCodewords.concat(reedSolomonRemainder(dataCodewords));
}

function createBaseMatrix() {
  const modules = createMatrix<boolean>(false);
  const reserved = createMatrix<boolean>(false);

  drawFinder(modules, reserved, 0, 0);
  drawFinder(modules, reserved, MODULE_COUNT - 7, 0);
  drawFinder(modules, reserved, 0, MODULE_COUNT - 7);
  drawAlignment(modules, reserved, 30, 30);
  drawTiming(modules, reserved);
  setFunctionModule(modules, reserved, 8, MODULE_COUNT - 8, true);
  reserveFormatAreas(reserved);

  return { modules, reserved };
}

function createMatrix<T>(value: T) {
  return Array.from({ length: MODULE_COUNT }, () =>
    Array.from({ length: MODULE_COUNT }, () => value),
  );
}

function drawFinder(
  modules: boolean[][],
  reserved: boolean[][],
  left: number,
  top: number,
) {
  for (let dy = -1; dy <= 7; dy += 1) {
    for (let dx = -1; dx <= 7; dx += 1) {
      const x = left + dx;
      const y = top + dy;
      if (!isInside(x, y)) {
        continue;
      }

      const isPattern = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6;
      const isDark =
        isPattern &&
        (dx === 0 ||
          dx === 6 ||
          dy === 0 ||
          dy === 6 ||
          (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4));
      setFunctionModule(modules, reserved, x, y, isDark);
    }
  }
}

function drawAlignment(
  modules: boolean[][],
  reserved: boolean[][],
  centerX: number,
  centerY: number,
) {
  for (let dy = -2; dy <= 2; dy += 1) {
    for (let dx = -2; dx <= 2; dx += 1) {
      const distance = Math.max(Math.abs(dx), Math.abs(dy));
      setFunctionModule(
        modules,
        reserved,
        centerX + dx,
        centerY + dy,
        distance === 0 || distance === 2,
      );
    }
  }
}

function drawTiming(modules: boolean[][], reserved: boolean[][]) {
  for (let i = 8; i < MODULE_COUNT - 8; i += 1) {
    setFunctionModule(modules, reserved, i, 6, i % 2 === 0);
    setFunctionModule(modules, reserved, 6, i, i % 2 === 0);
  }
}

function reserveFormatAreas(reserved: boolean[][]) {
  for (let i = 0; i <= 5; i += 1) {
    reserved[8][i] = true;
    reserved[i][8] = true;
  }
  reserved[8][7] = true;
  reserved[8][8] = true;
  reserved[7][8] = true;

  for (let i = 0; i < 8; i += 1) {
    reserved[MODULE_COUNT - 1 - i][8] = true;
  }
  for (let i = 8; i < 15; i += 1) {
    reserved[8][MODULE_COUNT - 15 + i] = true;
  }
}

function setFunctionModule(
  modules: boolean[][],
  reserved: boolean[][],
  x: number,
  y: number,
  isDark: boolean,
) {
  if (!isInside(x, y)) {
    return;
  }

  modules[y][x] = isDark;
  reserved[y][x] = true;
}

function placeData(
  modules: boolean[][],
  reserved: boolean[][],
  codewords: number[],
) {
  const bits = codewords.flatMap((codeword) =>
    Array.from(
      { length: 8 },
      (_, index) => ((codeword >>> (7 - index)) & 1) === 1,
    ),
  );
  let bitIndex = 0;
  let upward = true;

  for (let right = MODULE_COUNT - 1; right >= 1; right -= 2) {
    if (right === 6) {
      right -= 1;
    }

    for (let vertical = 0; vertical < MODULE_COUNT; vertical += 1) {
      const y = upward ? MODULE_COUNT - 1 - vertical : vertical;
      for (let dx = 0; dx < 2; dx += 1) {
        const x = right - dx;
        if (reserved[y][x]) {
          continue;
        }

        modules[y][x] = bits[bitIndex] ?? false;
        bitIndex += 1;
      }
    }

    upward = !upward;
  }
}

function applyMask(modules: boolean[][], reserved: boolean[][], mask: number) {
  const next = modules.map((row) => row.slice());

  for (let y = 0; y < MODULE_COUNT; y += 1) {
    for (let x = 0; x < MODULE_COUNT; x += 1) {
      if (!reserved[y][x] && maskBit(mask, x, y)) {
        next[y][x] = !next[y][x];
      }
    }
  }

  return next;
}

function maskBit(mask: number, x: number, y: number) {
  switch (mask) {
    case 0:
      return (x + y) % 2 === 0;
    case 1:
      return y % 2 === 0;
    case 2:
      return x % 3 === 0;
    case 3:
      return (x + y) % 3 === 0;
    case 4:
      return (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0;
    case 5:
      return ((x * y) % 2) + ((x * y) % 3) === 0;
    case 6:
      return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
    default:
      return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
  }
}

function drawFormatBits(
  modules: boolean[][],
  reserved: boolean[][],
  mask: number,
) {
  const bits = formatBits(mask);

  for (let i = 0; i <= 5; i += 1) {
    setFunctionModule(modules, reserved, 8, i, getBit(bits, i));
  }
  setFunctionModule(modules, reserved, 8, 7, getBit(bits, 6));
  setFunctionModule(modules, reserved, 8, 8, getBit(bits, 7));
  setFunctionModule(modules, reserved, 7, 8, getBit(bits, 8));
  for (let i = 9; i < 15; i += 1) {
    setFunctionModule(modules, reserved, 14 - i, 8, getBit(bits, i));
  }

  for (let i = 0; i < 8; i += 1) {
    setFunctionModule(
      modules,
      reserved,
      MODULE_COUNT - 1 - i,
      8,
      getBit(bits, i),
    );
  }
  for (let i = 8; i < 15; i += 1) {
    setFunctionModule(
      modules,
      reserved,
      8,
      MODULE_COUNT - 15 + i,
      getBit(bits, i),
    );
  }
  setFunctionModule(modules, reserved, 8, MODULE_COUNT - 8, true);
}

function formatBits(mask: number) {
  const data = (0b01 << 3) | mask;
  let bits = data << 10;
  for (let i = 14; i >= 10; i -= 1) {
    if (((bits >>> i) & 1) !== 0) {
      bits ^= FORMAT_GENERATOR << (i - 10);
    }
  }

  return ((data << 10) | bits) ^ FORMAT_MASK;
}

function getBit(value: number, index: number) {
  return ((value >>> index) & 1) !== 0;
}

function reedSolomonRemainder(data: number[]) {
  const generator = reedSolomonGenerator(ERROR_CORRECTION_CODEWORDS);
  const remainder = Array.from({ length: ERROR_CORRECTION_CODEWORDS }, () => 0);

  for (const byte of data) {
    const factor = byte ^ remainder.shift()!;
    remainder.push(0);
    for (let i = 0; i < ERROR_CORRECTION_CODEWORDS; i += 1) {
      remainder[i] ^= gfMultiply(generator[i + 1], factor);
    }
  }

  return remainder;
}

function reedSolomonGenerator(degree: number) {
  let polynomial = [1];
  for (let i = 0; i < degree; i += 1) {
    polynomial = multiplyPolynomials(polynomial, [1, gfPow(2, i)]);
  }
  return polynomial;
}

function multiplyPolynomials(left: number[], right: number[]) {
  const product = Array.from(
    { length: left.length + right.length - 1 },
    () => 0,
  );
  for (let i = 0; i < left.length; i += 1) {
    for (let j = 0; j < right.length; j += 1) {
      product[i + j] ^= gfMultiply(left[i], right[j]);
    }
  }
  return product;
}

function gfPow(value: number, power: number) {
  let result = 1;
  for (let i = 0; i < power; i += 1) {
    result = gfMultiply(result, value);
  }
  return result;
}

function gfMultiply(left: number, right: number) {
  let product = 0;
  let a = left;
  let b = right;

  while (b !== 0) {
    if ((b & 1) !== 0) {
      product ^= a;
    }
    a <<= 1;
    if ((a & 0x100) !== 0) {
      a ^= 0x11d;
    }
    b >>>= 1;
  }

  return product & 0xff;
}

function modulesToPath(modules: boolean[][]) {
  const commands: string[] = [];
  modules.forEach((row, y) => {
    row.forEach((isDark, x) => {
      if (isDark) {
        commands.push(`M${x + QUIET_ZONE},${y + QUIET_ZONE}h1v1h-1z`);
      }
    });
  });
  return commands.join('');
}

function isInside(x: number, y: number) {
  return x >= 0 && x < MODULE_COUNT && y >= 0 && y < MODULE_COUNT;
}

class BitBuffer {
  private bits: boolean[] = [];

  get length() {
    return this.bits.length;
  }

  append(value: number, length: number) {
    for (let i = length - 1; i >= 0; i -= 1) {
      this.bits.push(((value >>> i) & 1) !== 0);
    }
  }

  toBytes() {
    const bytes: number[] = [];
    for (let i = 0; i < this.bits.length; i += 8) {
      let value = 0;
      for (let j = 0; j < 8; j += 1) {
        value = (value << 1) | (this.bits[i + j] ? 1 : 0);
      }
      bytes.push(value);
    }
    return bytes;
  }
}
