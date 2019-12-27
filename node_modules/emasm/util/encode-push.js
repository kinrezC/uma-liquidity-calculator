'use strict';

const addHexPrefix = require('./add-hex-prefix');
const leftZeroPadToByteLength = require('./left-zero-pad-to-byte-length');
const ops = require('../lib/ops');

const encodePush = (v, length) => {
  const baseOffset = Number(addHexPrefix(ops.push));
  const opcodeValue = baseOffset + length - 1;
  return opcodeValue.toString(16) + leftZeroPadToByteLength(v.toString(16), length);
};

module.exports = encodePush;
