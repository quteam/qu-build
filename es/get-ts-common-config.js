export default function ts() {
  return {
    target: 'ESNEXT',
    jsx: 'preserve',
    moduleResolution: 'node',
    declaration: true,
    experimentalDecorators: true,
    sourceMap: true,
    strict: true
  };
}