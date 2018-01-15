"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ts;

function ts() {
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