import { doc, setDoc, updateDoc } from 'firebase/firestore';

import { SWIM_TEST_CODE } from '@/requirements/data/constants';
import { onboardingDataCollection } from '../firebase-frontend-config';
import store from '../store';
import setUsernameData from './username-data';

export const setAppOnboardingData = (
  name: FirestoreUserName,
  onboarding: AppOnboardingData
): void => {
  setUsernameData(name);
  setDoc(doc(onboardingDataCollection, store.state.currentFirebaseUser.email), {
    gradYear: onboarding.gradYear,
    gradSem: onboarding.gradSem,
    entranceYear: onboarding.entranceYear,
    entranceSem: onboarding.entranceSem,
    colleges: onboarding.college ? [{ acronym: onboarding.college }] : [],
    majors: onboarding.major.map(acronym => ({ acronym })),
    minors: onboarding.minor.map(acronym => ({ acronym })),
    gradPrograms: onboarding.grad ? [{ acronym: onboarding.grad }] : [],
    exam: onboarding.exam,
    tookSwim: onboarding.tookSwim,
  });
};

const setTookSwim = (tookSwim: 'yes' | 'no'): void => {
  updateDoc(doc(onboardingDataCollection, store.state.currentFirebaseUser.email), {
    tookSwim,
  });
};

const setExams = (exam: FirestoreAPIBExam[]) => {
  updateDoc(doc(onboardingDataCollection, store.state.currentFirebaseUser.email), {
    exam,
  });
};

export const deleteTransferCredit = (code: string): void => {
  if (code === SWIM_TEST_CODE) {
    setTookSwim('no');
    return;
  }
  const [type, subject] = code.split(/ (.*)/);
  setExams(
    store.state.onboardingData.exam.filter(e => !(e.type === type && e.subject === subject))
  );
};
