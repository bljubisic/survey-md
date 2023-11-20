import type {Meta, StoryObj } from "@storybook/svelte";

import SurveyPrint from "./SurveyPrint.svelte";

const meta = {
  title: 'Components/SurveyPrint',
  component: SurveyPrint,
  tags: ['autodocs'],
  argTypes: {

  },
} satisfies Meta<SurveyPrint>;

export default meta;


const chars =
"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function uid() {
  let id = "";
  let size = 16;
  while (size--) id += chars[(Math.random() * 62) | 0];
  return id;
}

function parsePrint() {
  const text = "{Text}";
  const match = /^\{([^}]+)\}/.exec(text);

  return ((match)? match[1] : "");

}

type Story = StoryObj<typeof meta>;

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
  },
};
