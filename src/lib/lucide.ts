export function renderLucideIcon(
  icon: any[],
  attrs: Record<string, string | number> = {}
): string {
  const svgAttrs = {
    xmlns: 'http://www.w3.org/2000/svg',
    width: '24',
    height: '24',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    ...attrs,
  };

  function renderNode(node: any[]): string {
    if (!Array.isArray(node)) return '';
    const [tag, props, children] = node;
    const propsStr = Object.entries(props || {})
      .map(([k, v]) => `${k}="${String(v).replace(/"/g, '&quot;')}"`)
      .join(' ');
    if (children && Array.isArray(children) && children.length > 0) {
      return `<${tag} ${propsStr}>${children.map(renderNode).join('')}</${tag}>`;
    }
    return `<${tag} ${propsStr}></${tag}>`;
  }

  const inner = icon.map(renderNode).join('');
  const svgProps = Object.entries(svgAttrs)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ');

  return `<svg ${svgProps}>${inner}</svg>`;
}
