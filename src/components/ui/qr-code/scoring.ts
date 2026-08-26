export function scoreQrPenalty(modules: boolean[][]) {
  return (
    scoreRuns(modules) +
    scoreBlocks(modules) +
    scoreFinderLikePatterns(modules) +
    scoreDarkRatio(modules)
  );
}

function scoreRuns(modules: boolean[][]) {
  let penalty = 0;
  const moduleCount = modules.length;
  for (let y = 0; y < moduleCount; y += 1) {
    penalty += scoreLine(modules[y]);
  }
  for (let x = 0; x < moduleCount; x += 1) {
    penalty += scoreLine(modules.map((row) => row[x]));
  }
  return penalty;
}

function scoreLine(line: boolean[]) {
  let penalty = 0;
  let runColor = line[0];
  let runLength = 1;
  for (let i = 1; i < line.length; i += 1) {
    if (line[i] === runColor) {
      runLength += 1;
      continue;
    }
    penalty += runLength >= 5 ? runLength - 2 : 0;
    runColor = line[i];
    runLength = 1;
  }
  return penalty + (runLength >= 5 ? runLength - 2 : 0);
}

function scoreBlocks(modules: boolean[][]) {
  let penalty = 0;
  const moduleCount = modules.length;
  for (let y = 0; y < moduleCount - 1; y += 1) {
    for (let x = 0; x < moduleCount - 1; x += 1) {
      const color = modules[y][x];
      if (
        modules[y][x + 1] === color &&
        modules[y + 1][x] === color &&
        modules[y + 1][x + 1] === color
      ) {
        penalty += 3;
      }
    }
  }
  return penalty;
}

function scoreFinderLikePatterns(modules: boolean[][]) {
  const pattern = [
    true,
    false,
    true,
    true,
    true,
    false,
    true,
    false,
    false,
    false,
    false,
  ];
  let penalty = 0;
  const moduleCount = modules.length;
  for (let y = 0; y < moduleCount; y += 1) {
    penalty += scorePatternLine(modules[y], pattern);
  }
  for (let x = 0; x < moduleCount; x += 1) {
    penalty += scorePatternLine(
      modules.map((row) => row[x]),
      pattern,
    );
  }
  return penalty;
}

function scorePatternLine(line: boolean[], pattern: boolean[]) {
  let penalty = 0;
  for (let i = 0; i <= line.length - pattern.length; i += 1) {
    if (pattern.every((value, index) => line[i + index] === value)) {
      penalty += 40;
    }
    if (
      pattern.every(
        (value, index) =>
          line[i + index] === pattern[pattern.length - 1 - index],
      )
    ) {
      penalty += 40;
    }
  }
  return penalty;
}

function scoreDarkRatio(modules: boolean[][]) {
  const total = modules.length * modules.length;
  const dark = modules.reduce(
    (sum, row) => sum + row.filter(Boolean).length,
    0,
  );
  return Math.floor(Math.abs((dark * 100) / total - 50) / 5) * 10;
}
