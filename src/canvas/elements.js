/**
 * CanvasCord Element Data Models & Factory
 */

export function createElement(type, overrides = {}) {
  const id = 'el_' + Math.random().toString(36).substring(2, 9);
  const base = {
    id,
    type,
    name: overrides.name || getDefaultName(type),
    x: overrides.x ?? 100,
    y: overrides.y ?? 100,
    width: overrides.width ?? 120,
    height: overrides.height ?? 80,
    rotation: overrides.rotation ?? 0,
    fill: overrides.fill ?? '#2b2d31',
    fillOpacity: overrides.fillOpacity ?? 1,
    stroke: overrides.stroke ?? '#5865F2',
    strokeWidth: overrides.strokeWidth ?? 0,
    strokeDash: overrides.strokeDash ?? 'solid',
    cornerRadius: overrides.cornerRadius ?? 8,
    opacity: overrides.opacity ?? 1,
    shadow: overrides.shadow ?? { enabled: false, x: 0, y: 4, blur: 12, color: 'rgba(0,0,0,0.3)' },
    locked: overrides.locked ?? false,
    visible: overrides.visible ?? true,
    parentId: overrides.parentId ?? null,
  };

  switch (type) {
    case 'frame':
      return {
        ...base,
        name: overrides.name || 'Frame',
        width: overrides.width ?? 390,
        height: overrides.height ?? 844,
        fill: overrides.fill ?? '#1e1f22',
        stroke: overrides.stroke ?? '#35373c',
        strokeWidth: overrides.strokeWidth ?? 1,
        cornerRadius: overrides.cornerRadius ?? 16,
        clipContent: overrides.clipContent ?? true,
        deviceLabel: overrides.deviceLabel || 'Mobile Frame',
      };

    case 'rect':
      return {
        ...base,
        name: overrides.name || 'Rectangle',
        fill: overrides.fill ?? '#5865F2',
        cornerRadius: overrides.cornerRadius ?? 8,
      };

    case 'circle':
      return {
        ...base,
        name: overrides.name || 'Ellipse',
        width: overrides.width ?? 100,
        height: overrides.height ?? 100,
        fill: overrides.fill ?? '#23A55A',
        cornerRadius: 9999,
      };

    case 'star':
      return {
        ...base,
        name: overrides.name || 'Star',
        width: overrides.width ?? 100,
        height: overrides.height ?? 100,
        fill: overrides.fill ?? '#FEE75C',
        pointsCount: overrides.pointsCount ?? 5,
        innerRadiusRatio: overrides.innerRadiusRatio ?? 0.45,
      };

    case 'arrow':
      return {
        ...base,
        name: overrides.name || 'Connector Arrow',
        height: overrides.height ?? 24,
        fill: 'transparent',
        stroke: overrides.stroke ?? '#EB459E',
        strokeWidth: overrides.strokeWidth ?? 2,
        arrowHead: overrides.arrowHead ?? true,
        points: overrides.points ?? [{ x: 0, y: 0 }, { x: overrides.width ?? 160, y: 0 }],
      };

    case 'text':
      return {
        ...base,
        name: overrides.name || 'Heading',
        text: overrides.text ?? 'Double click to edit',
        fontSize: overrides.fontSize ?? 20,
        fontFamily: overrides.fontFamily ?? 'Inter, sans-serif',
        fontWeight: overrides.fontWeight ?? '600',
        fontColor: overrides.fontColor ?? '#F2F3F5',
        textAlign: overrides.textAlign ?? 'left',
        lineHeight: overrides.lineHeight ?? 1.3,
        fill: 'transparent',
      };

    case 'sticky':
      return {
        ...base,
        name: overrides.name || 'Idea Sticky',
        width: overrides.width ?? 180,
        height: overrides.height ?? 160,
        fill: overrides.fill ?? '#fff375',
        cornerRadius: 4,
        shadow: { enabled: true, x: 2, y: 6, blur: 16, color: 'rgba(0,0,0,0.35)' },
        text: overrides.text ?? '💡 New feature idea:\nReal-time voice huddle on canvas!',
        fontColor: overrides.fontColor ?? '#1e1f22',
        fontSize: overrides.fontSize ?? 14,
        author: overrides.author ?? 'Sarah (Design)',
      };

    case 'pen':
      return {
        ...base,
        name: overrides.name || 'Vector Path',
        fill: 'transparent',
        stroke: overrides.stroke ?? '#5865F2',
        strokeWidth: overrides.strokeWidth ?? 3,
        points: overrides.points ?? [],
      };

    case 'component':
      return {
        ...base,
        name: overrides.name || 'UI Component',
        componentType: overrides.componentType || 'button',
        props: overrides.props || {},
      };

    default:
      return base;
  }
}

function getDefaultName(type) {
  const map = {
    frame: 'Frame',
    rect: 'Rectangle',
    circle: 'Ellipse',
    star: 'Star',
    arrow: 'Arrow',
    text: 'Text',
    sticky: 'Sticky Note',
    pen: 'Pen Drawing',
    component: 'Component',
  };
  return map[type] || 'Element';
}
