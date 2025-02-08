<template>
  <div class="note" :style="noteStyle" @click="handleClick">
    <div
      class="note-content"
      :class="{
        visibleEmpty: isExpanded && initialNote === '',
        visible: isExpanded,
        editing: isEditing,
      }"
    >
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
        v-if="isExpanded && initialNote === ''"
        src="@/assets/images/notes/arrow.svg"
        alt="Arrow icon"
        class="note-icon"
        :style="{ opacity: isDisabled || note.trim() === '' ? '0.5' : '1' }"
        :data-id="noteId"
        @click.stop="saveNote"
      />
      <img
        v-if="isEditing && initialNote !== ''"
        src="@/assets/images/notes/checkmark.svg"
        alt="Checkmark icon"
        class="note-icon"
        :data-id="noteId"
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
import { defineComponent, nextTick } from 'vue';
import { Timestamp } from 'firebase/firestore';

export default defineComponent({
  name: 'Note',
  props: {
    // NOTE: each node has an ID (just the courseID)
    // Each note has three types of heights and translateY values: initial, expandedInitial (empty input), and expanded. For now,
    // all translateY values are the same, but this can be changed in the future.
    noteId: { type: String, required: true },
    initialTranslateY: { type: String, default: '-10px' },
    expandedInitialTranslateY: { type: String, default: '-10px' },
    expandedTranslateY: { type: String, default: '-10px' },
    initialHeight: { type: String, default: '20px' },
    expandedInitialHeight: { type: String, default: '40px' },
    expandedHeight: { type: String, default: '60px' },
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
    isEditing: 'updateSvgState',
    isDisabled: 'updateSvgState',
    note: 'updateSvgState', // Update SVG whenever note changes
  },
  computed: {
    noteStyle(): Record<string, string> {
      // Parse the heights and translate values
      const trueExpandedTranslateY =
        this.isExpanded && this.initialNote === '' // note is empty
          ? this.expandedInitialTranslateY
          : this.expandedTranslateY;

      const trueExpandedHeight =
        this.isExpanded && this.initialNote === '' // note is empty
          ? this.expandedInitialHeight
          : this.expandedHeight;

      const translateY = this.isExpanded
        ? parseInt(trueExpandedTranslateY, 10)
        : parseInt(this.initialTranslateY, 10);

      const baseHeight = this.isExpanded
        ? parseInt(trueExpandedHeight, 10)
        : parseInt(this.initialHeight, 10);

      const visibleHeight = baseHeight + Math.max(0, -translateY); // Add the visible part of the translated note
      console.log('visibleHeight', visibleHeight);

      return {
        transform: `translateX(-50%) translateY(${translateY}px)`,
        height: `${visibleHeight}px`, // The height of the note itself
        width: this.width,
        position: 'relative' as const,
        marginBottom: '-10px',
        backgroundColor: this.getLighterColor(this.color, 0.8),
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
    isDisabled() {
      // Disabled when not editing or when input is empty
      return (!this.isEditing && this.initialNote !== '') || this.note.trim() === '';
    },
  },
  methods: {
    handleClick() {
      if (!this.isExpanded) {
        this.isExpanded = true;
        this.$emit('note-state-change', true);
      }
    },
    startEditing() {
      this.isEditing = true;
      this.isExpanded = true;
    },
    saveNote() {
      if (this.isDisabled) return;
      this.$emit('save-note', this.note);
      this.isDirty = false;
      this.isEditing = false;
    },
    collapseNote() {
      if (this.isExpanded) {
        this.isExpanded = false;
        this.isEditing = false;
        this.$emit('note-state-change', false);
      }
    },
    // getLighterColor(color: string) {
    //   const colorObj = coursesColorSet.find(c => c.hex.toUpperCase() === color.toUpperCase());
    //   return colorObj ? colorObj.lighterHex : color;
    // },
    /**
     * Lighten a color in hex code by a percentage
     * @param {string} unconvertedColor - The color to lighten in hex code
     * @param {number} percentage - The percentage to lighten the color by (i.e: light by 80%)
     */
    getLighterColor(unconvertedColor: string, percentage: number) {
      const hexColor = unconvertedColor.replace('#', '');
      // Convert each color channel and lighten it
      const lightenedHex = hexColor
        .match(/.{2}/g)
        ?.map(channel => {
          // Convert channel from HEX to decimal
          const decimal = parseInt(channel, 16);
          // Lighten the channel
          const lightened = Math.min(255, Math.floor(decimal + (255 - decimal) * percentage));
          // Convert back to HEX, ensuring two characters
          return lightened.toString(16).padStart(2, '0');
        })
        .join('');
      return `#${lightenedHex}`;
    },
    updateSvgState() {
      this.updateSvgColor(this.noteId);
    },
    // Note: this is a dynamic style update, so nextTick is used to ensure the SVG element is rendered
    updateSvgColor(noteId: string) {
      const color = this.isDisabled ? 'grey' : this.color;
      const opacity = this.isDisabled ? '0.5' : '1';

      nextTick(() => {
        const svgElement = document.querySelector(`.note-icon[data-id="${noteId}"]`);
        if (!svgElement) return;
        (svgElement as HTMLElement).style.setProperty('--svg-filter-color', color);
        (svgElement as HTMLElement).style.setProperty('opacity', opacity);
      });
    },
    handleInput() {
      this.isDirty = this.note !== this.initialNote;
    },
  },
});
</script>
<style scoped>
.note {
  box-shadow: -4px -4px 10px 4px rgba(160, 91, 91, 0.055);
  left: 50%;
  border-radius: 12.49px;
  cursor: pointer;
  z-index: 0;
  transition: transform 0.3s ease, height 0.3s ease, filter 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  overflow: hidden;
}
.note-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  padding: 5px 0px 10px 10px;
  opacity: 0;
  transform: translateY(100%);
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.note-content.visible {
  opacity: 1;
  transform: translateY(-15px);
}
.note-content.visibleEmpty {
  opacity: 1;
  transform: translateY(0px);
}

.note-input {
  flex: 1;
  padding: 0;
  border: none;
  outline: none;
  background-color: transparent;
  color: #555;
  font-size: 14.48px;
  font-family: inherit;
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
  --svg-filter-color: grey; /* Default color */
  filter: drop-shadow(0 0 0 var(--svg-filter-color)) saturate(5);

  &:hover {
    filter: opacity(0.5) drop-shadow(0 0 0 var(--svg-filter-color));
  }
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
