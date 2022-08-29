/* eslint-disable no-await-in-loop,no-console */
/**
 * TPM ONLY SCRIPT! BE CAREFUL COPYING TO PROD
 * Script to copy data from one user on production or dev to another user on dev.
 * Requires service accounts for database
 *
 * From root, run: `npm run ts-node -- src/admin-copy-user-data.ts <FROM_ENV>/<FROM_USER> <TO_ENV>/<TO_USER>`
 * FROM_ENV and TO_ENV should be either "dev" or "prod"
 * EXAMPLE: `npm run ts-node -- src/admin-copy-user-data.ts prod/noschiff.dev@gmail.com dev/nps39@cornell.edu`
 * npm run ts-node -- src/admin-copy-user-data.ts dev/noschiff.dev@gmail.com dev/noschiff.dev@gmail.com
 */

import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const collections = [
  'user-name',
  'user-semesters',
  'user-toggleable-requirement-choices',
  'user-overridden-fulfillment-choices',
  'user-selectable-requirement-choices',
  'user-subject-colors',
  'user-unique-incrementer',
  'user-onboarding-data',
];

const fromArg = process.argv[2];
const toArg = process.argv[3];
if (fromArg && toArg) {
  const [FROM_ENV, FROM] = fromArg.split('/');
  const [TO_ENV, TO] = toArg.split('/');
  execute(FROM, FROM_ENV, TO, TO_ENV).then(copied =>
    console.log(`Copied: [${copied}] from ${fromArg} to ${toArg}`)
  );
} else {
  throw new Error('Refer to the documentation to correctly run this script.');
}

async function execute(FROM: string, FROM_ENV: string, TO: string, TO_ENV: string) {
  let fromDb;
  let toDb;
  if (FROM_ENV === 'dev' || TO_ENV === 'dev') {
    const dev = initializeApp({
      credential: cert('serviceAccount.json'),
      databaseURL: 'https://cornelldti-courseplan-dev.firebaseio.com',
    });
    const devDb = getFirestore(dev);
    if (FROM_ENV === 'dev') fromDb = devDb;
    if (TO_ENV === 'dev') toDb = devDb;
  }

  if (FROM_ENV === 'prod' || TO_ENV === 'prod') {
    const prod = initializeApp({
      credential: cert('serviceAccountProd.json'),
      databaseURL: 'https://cornell-courseplan.firebaseio.com',
    });
    const prodDb = getFirestore(prod);
    if (FROM_ENV === 'prod') fromDb = prodDb;
    if (TO_ENV === 'prod') toDb = prodDb;
  }

  const copied = [];
  if (fromDb && toDb) {
    for (const collection of collections) {
      const get = (await fromDb.collection(collection).doc(FROM).get()).data();
      if (get) {
        const result = await toDb.collection(collection).doc(TO).set(get);
        if (result) copied.push(collection);
      }
    }
  }
  return copied;
}
