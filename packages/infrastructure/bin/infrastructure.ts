#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CulinaryJourneysStack } from '../lib/culinary-journeys-stack';
import { getStage } from '../lib/helper';

const app = new cdk.App();

new CulinaryJourneysStack(app, getStage('CulinaryJourneysStack'));
