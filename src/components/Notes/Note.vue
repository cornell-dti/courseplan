<template>
  <div class="note" :class="{ expanded: isExpanded }" :style="noteStyle" @click="handleClick">
    <div class="note-content" :class="{ visible: isExpanded, editing: isEditing }">
      <!-- NOTE: the disabled attribute is used to prevent the user from being able to edit the note
      when it is expanded, but the edit icon has not been pressed. This only applies when the note
      is not empty (already had something written in it previously and read from the database). -->
      <input
        v-model="note"
        placeholder="Add a note..."
        :disabled="!isEditing && initialNote !== ''"
        class="note-input"
        @keyup.enter="saveNote"
        @input="handleInput"
      />
      <img
        src="@/assets/images/notes/arrow.svg"
        alt="Arrow icon"
        class="note-icon"
        @click.stop="saveNote"
      />
    </div>
    <div
      class="note-footer"
      :class="{ visible: isExpanded && note && !isEditing && initialNote !== '' }"
    >
      <div class="note-footer-left note-footer-text">Last Updated: {{ formattedLastUpdated }}</div>
      <div class="note-footer-right">
        <img
          src="@/assets/images/edit-note.svg"
          alt="Edit note"
          class="note-footer-icon"
          @click.stop="startEditing"
        />
        <img
          src="@/assets/images/trash.svg"
          alt="Delete note"
          class="note-footer-icon"
          @click.stop="$emit('open-delete-note-modal')"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Timestamp } from 'firebase/firestore';
import { coursesColorSet } from '@/assets/constants/colors';

export default defineComponent({
  name: 'Note',
  props: {
    initialTranslateY: { type: String, default: '-50px', required: true },
    expandedTranslateY: { type: String, default: '-10px', required: true },
    width: { type: String, default: '200px' },
    color: { type: String, default: '#a8e6cf' },
    initialNote: { type: String, default: '' },
    lastUpdated: {
      type: [Object, Date],
      // NOTE: we must use a Timestamp object here, as this is the internal type used by Firestore
      // for storing the created JavaScript Date object. Helper functions are available by default
      // on the Timestamp object to convert between the two.
      default: () => Timestamp.now(),
    },
  },
  data() {
    return {
      isExpanded: false,
      isEditing: false,
      note: this.initialNote,
      isDirty: false,
    };
  },
  watch: {
    expand(newVal) {
      if (newVal) this.isExpanded = true;
    },
  },
  computed: {
    noteStyle() {
      return {
        transform: `translateX(-50%) translateY(${
          this.isExpanded ? this.expandedTranslateY : this.initialTranslateY
        })`,
        width: this.width,
        backgroundColor: this.getLighterColor(this.color),
      };
    },
    // Displays
    formattedLastUpdated() {
      if (!this.lastUpdated) return '';

      let date;
      if (this.lastUpdated instanceof Date) {
        date = this.lastUpdated;
      } else if (typeof this.lastUpdated.toDate === 'function') {
        date = this.lastUpdated.toDate();
      } else {
        return '';
      }

      return `${date.getMonth() + 1}/${date.getDate()}`;
    },
  },
  methods: {
    handleClick() {
      if (!this.isExpanded) {
        this.isExpanded = true;
      }
    },
    startEditing() {
      this.isEditing = true;
      this.isExpanded = true;
    },
    saveNote() {
      this.$emit('save-note', this.note);
      this.isDirty = false;
      this.isEditing = false;
    },
    collapseNote() {
      if (this.isExpanded) {
        this.isExpanded = false;
        this.isEditing = false;
      }
    },
    getLighterColor(color: string) {
      const colorObj = coursesColorSet.find(c => c.hex.toUpperCase() === color.toUpperCase());
      return colorObj ? colorObj.lighterHex : color;
    },
    handleInput() {
      this.isDirty = this.note !== this.initialNote;
    },
  },
});
</script>

<style scoped>
.note {
  box-shadow: 0px 0px 10px 4px rgba(0, 0, 0, 0.055);
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  height: 80px;
  border-radius: 12.49px;
  cursor: pointer;
  z-index: 0;
  transition: transform 0.3s ease, filter 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding-bottom: 10px;
  overflow: hidden;
}

.note.expanded {
  height: 80px;
}

.note-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  padding-top: 15px;
  padding-left: 10px;
  opacity: 0;
  transform: translateY(100%);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.note-content.visible {
  opacity: 1;
  transform: translateY(0);
}

.note-input {
  flex: 1;
  border: none;
  outline: none;
  background-color: transparent;
  color: #555;
  font-size: 14.48px;
  font-family: inherit;
  padding: 5px 0;
}

.note-icon {
  width: 20.18px;
  height: 20.18px;
  margin-left: 8px;
  vertical-align: middle;
  color: grey;
  opacity: 1;
  cursor: pointer;
  transition: filter 0.3s ease;
  margin-right: 10px;
}

.note-icon:hover {
  filter: brightness(0.7);
}

.note-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 10px;
  color: #858585;
  opacity: 0;
  transform: translateY(100%);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.note-footer.visible {
  opacity: 1;
  transform: translateY(0);
}

.note-footer-text {
  opacity: 0.7;
}

.note-footer-right {
  display: flex;
  gap: 8px;
}

.note-footer-icon {
  width: 14px;
  height: 14px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.note-footer-icon:hover {
  opacity: 1;
}

.note-content.editing {
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 13px;
  margin: 0 10px;
  padding: 0 5px;
}

.note-content.editing .note-input {
  padding: 5px 5px;
  margin-right: 0;
  background-color: transparent;
}

.note-content.editing .note-icon {
  margin-right: 5px;
}
</style>
