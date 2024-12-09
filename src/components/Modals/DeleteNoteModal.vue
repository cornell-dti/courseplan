<template>
  <teleport-modal
    title="Delete Note"
    content-class="content-delete"
    left-button-text="Cancel"
    right-button-text="Delete"
    :rightButtonIsDisabled="false"
    :rightButtonImage="icon"
    rightButtonAlt="delete note trashcan icon"
    @modal-closed="closeCurrentModal"
    @left-button-clicked="closeCurrentModal"
    @right-button-clicked="deleteNote"
  >
    <div class="deleteNoteModal-body">
      <div class="deleteNoteModal-body-text">{{ text }}</div>
    </div>
  </teleport-modal>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TeleportModal from '@/components/Modals/TeleportModal.vue';
import trashIcon from '@/assets/images/trash-white.svg';

export default defineComponent({
  components: { TeleportModal },
  props: {
    noteCourseUniqueID: { type: Number, required: true },
  },
  emits: {
    'close-delete-note': () => true,
    'delete-note': (noteCourseUniqueID: number) => typeof noteCourseUniqueID === 'number',
  },
  computed: {
    text() {
      return 'Are you sure you want to delete this note?';
    },
    icon() {
      return trashIcon;
    },
  },
  methods: {
    closeCurrentModal() {
      this.$emit('close-delete-note');
    },
    deleteNote() {
      this.$emit('delete-note', this.noteCourseUniqueID);
      this.closeCurrentModal();
    },
  },
});
</script>

<style lang="scss">
@import '@/assets/scss/_variables.scss';

.content-delete {
  width: 24rem;
}

@media only screen and (max-width: $small-medium-breakpoint) {
  .content-delete {
    width: 100%;
  }
}
</style>
