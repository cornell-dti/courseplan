<template>
  <div>
    <div class="onboarding-subHeader">
      <span class="onboarding-subHeader--font">{{ examType }} Credits</span>
    </div>
    <div class="onboarding-subsection onboarding-transferCreditsSection">
      <div class="onboarding-section" v-for="(exam, index) in exams" :key="index">
        <div class="onboarding-selectWrapperRow">
          <onboarding-transfer-exam-property-dropdown
            property-name="Subject"
            :columnWide="true"
            :availableOptions="getSelectableOptions(exams, subjects, exam.subject)"
            :choice="exam.subject"
            @on-select="subject => $emit('on-subject-select', subject, index)"
          />
          <onboarding-transfer-exam-property-dropdown
            property-name="Score"
            :columnWide="false"
            :availableOptions="scores(exam)"
            :choice="exam.score"
            @on-select="score => $emit('on-score-select', score, index)"
          />
          <div class="onboarding-select--column-removeExam">
            <button
              class="onboarding-remove"
              @click="$emit('on-remove', examType, index)"
              v-if="hasExams(exams, exam)"
            >
              <img
                src="@/assets/images/x-green.svg"
                :alt="`x to remove ${examType} exam ${exam.examType} ${exam.subject}`"
              />
            </button>
          </div>
        </div>
      </div>
      <div class="onboarding-addRemoveWrapper">
        <button class="onboarding-add" @click="$emit('on-add', examType)">+ Another subject</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { getExamScoresFromExamTaken } from '@/requirements/requirement-exam-utils';
import OnboardingTransferExamPropertyDropdown from './OnboardingTransferExamPropertyDropdown.vue';

export default defineComponent({
  components: {
    OnboardingTransferExamPropertyDropdown,
  },
  emits: {
    'on-subject-select': (subject: string, index: number) =>
      typeof subject === 'string' && typeof index === 'number',
    'on-score-select': (score: string | number, index: number) =>
      (typeof score === 'string' || typeof score === 'number') && typeof index === 'number',
    'on-remove': (examType: TransferExamType, index: number) =>
      typeof examType === 'string' && typeof index === 'number',
    'on-add': (examType: TransferExamType) => typeof examType === 'string',
  },
  props: {
    examType: { type: String as PropType<TransferExamType>, required: true },
    exams: {
      type: Array as PropType<readonly FirestoreTransferExam[]>,
      required: true,
    },
    subjects: {
      type: Array as PropType<readonly string[]>,
      required: true,
    },
    placeholderText: {
      type: String,
      required: true,
    },
  },
  methods: {
    getSelectableOptions(
      // exams already picked
      selectedExams: readonly FirestoreTransferExam[],
      // array of ap/ib exams
      allSubjects: readonly string[],
      choice: string
    ) {
      const selectedExamsNames = selectedExams.map(exam => exam.subject);
      const selectableOptions: string[] = [];
      // copy all of the possible options over but exclude already selected ones
      for (const subject of allSubjects) {
        // don't include selected ones
        if (!selectedExamsNames.includes(subject)) {
          selectableOptions.push(subject);
        }
      }
      // add the current selection associated with this input into the availableChoices
      if (choice !== this.placeholderText) {
        selectableOptions.push(choice);
      }
      return selectableOptions;
    },
    hasExams(exams: readonly FirestoreTransferExam[], exam: FirestoreTransferExam): boolean {
      return !(exams.length === 1 && exam.subject === this.placeholderText);
    },
    scores(exam: FirestoreTransferExam) {
      if (exam.subject === this.placeholderText) return [];
      return getExamScoresFromExamTaken(exam).reverse();
    },
  },
});
</script>

<style scoped lang="scss">
@import '@/components/Modals/Onboarding/Onboarding.scss';
</style>
