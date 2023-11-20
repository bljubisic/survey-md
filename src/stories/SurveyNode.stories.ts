import type {Meta, StoryObj } from "@storybook/svelte";

import SurveyPrint from "$lib/SurveyNode.svelte";
import type SurveyNode from "$lib/SurveyNode.svelte";

const meta = {
  title: 'Components/SurveyNode',
  component: SurveyNode,
  tags: ['autodocs'],
  argTypes: {

  },
} satisfies Meta<SurveyNode>;

export default meta;

export let pageIndex = 0;

const chars =
"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function uid() {
  let id = "";
  let size = 16;
  while (size--) id += chars[(Math.random() * 62) | 0];
  return id;
}

function next(url: string, pages: string | any[]) {
  try {
    if (url === "-") {
      for (let i = pageIndex - 1; i > -1; i--) {
        pageIndex = i;
        break;
      }
    } else {
      for (let i = pageIndex + 1; i < pages.length; i++) {
        pageIndex = i;
        break;
      }
    }
  } catch (e) { /* empty */ }
}

// More on writing stories with args: https://storybook.js.org/docs/svelte/writing-stories/args
export const Primary: Story = {
  args: {
    context: {
      uid: uid(),
      started_at: new Date()
        .toISOString()
        .substring(0, 19)
        .replace("T", " ")
    },
    node: {
      "type": "print",
      "expr": parsePrint(),
    },
    next: next("+", ""),
  },
};