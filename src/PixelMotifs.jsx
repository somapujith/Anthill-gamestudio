import './pixel-motifs.css';

const INVADER = [
  '..#.....#..',
  '...#...#...',
  '..#######..',
  '.##.###.##.',
  '###########',
  '#.#######.#',
  '#.#.....#.#',
  '...##.##...',
];

const INVADER_B = [
  '..#.....#..',
  '#..#...#..#',
  '#.#######.#',
  '###.###.###',
  '###########',
  '.#########.',
  '..#.....#..',
  '.#.......#.',
];

const PAC_OPEN = [
  '..#####..',
  '.#######.',
  '#######..',
  '######...',
  '#####....',
  '######...',
  '#######..',
  '.#######.',
  '..#####..',
];

const PAC_CLOSED = [
  '..#####..',
  '.#######.',
  '#########',
  '#########',
  '#########',
  '#########',
  '#########',
  '.#######.',
  '..#####..',
];

const GHOST = [
  '..######..',
  '.########.',
  '##########',
  '##..##..##',
  '##..##..##',
  '##########',
  '##########',
  '##########',
  '#.##..##.#',
];

function Sprite({ rows, className }) {
  const cells = [];
  rows.forEach((row, y) => [...row].forEach((cell, x) => { if (cell === '#') cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />); }));
  return <svg className={`motif ${className}`} viewBox={`0 0 ${rows[0].length} ${rows.length}`} shapeRendering="crispEdges" focusable="false">{cells}</svg>;
}

export default function PixelMotifs() {
  return <div className="pixel-motifs" aria-hidden="true">
    <span className="motif-slot motif-slot-invader-a"><Sprite rows={INVADER} className="motif-invader motif-invader-1" /><Sprite rows={INVADER_B} className="motif-invader motif-invader-2" /></span>
    <span className="motif-slot motif-slot-invader-b"><Sprite rows={INVADER_B} className="motif-invader motif-invader-1" /><Sprite rows={INVADER} className="motif-invader motif-invader-2" /></span>
    <span className="motif-slot motif-slot-ghost"><Sprite rows={GHOST} className="motif-ghost" /></span>
    <span className="motif-slot motif-slot-chase">
      <span className="motif-pellets" />
      <span className="motif-pac"><Sprite rows={PAC_OPEN} className="motif-pac-open" /><Sprite rows={PAC_CLOSED} className="motif-pac-closed" /></span>
    </span>
  </div>;
}
