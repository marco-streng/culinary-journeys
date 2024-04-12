import {
  toHaveReceivedCommand,
  toHaveReceivedCommandOnce,
  toHaveReceivedCommandTimes,
  toHaveReceivedCommandWith,
  toHaveReceivedLastCommandWith,
  toHaveReceivedNthCommandWith,
  toReceiveCommand,
  toReceiveCommandOnce,
  toReceiveCommandTimes,
  toReceiveCommandWith,
  toReceiveLastCommandWith,
  toReceiveNthCommandWith,
} from 'aws-sdk-client-mock-vitest';
import { expect } from 'vitest';

expect.extend({
  toReceiveCommandTimes,
  toHaveReceivedCommandTimes,
  toReceiveCommandOnce,
  toHaveReceivedCommandOnce,
  toReceiveCommand,
  toHaveReceivedCommand,
  toReceiveCommandWith,
  toHaveReceivedCommandWith,
  toReceiveNthCommandWith,
  toHaveReceivedNthCommandWith,
  toReceiveLastCommandWith,
  toHaveReceivedLastCommandWith,
});
