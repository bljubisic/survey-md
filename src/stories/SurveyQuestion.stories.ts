import type {Meta, StoryObj } from "@storybook/svelte";

import SurveyQuestion from '$lib/SurveyQuestion.svelte';

const meta = {
  title: 'Components/SurveyQuestion',
  component: SurveyQuestion,
  tags: ['autodocs'],
  argTypes: {

  },
} satisfies Meta<SurveyQuestion>;

export default meta;

// export let pageIndex = 0;

const chars =
"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function uid() {
  let id = "";
  let size = 16;
  while (size--) id += chars[(Math.random() * 62) | 0];
  return id;
}

// function next(url: string, pages: string | unknown[]) {
//   try {
//     if (url === "-") {
//       for (let i = pageIndex - 1; i > -1; i--) {
//         pageIndex = i;
//         break;
//       }
//     } else {
//       for (let i = pageIndex + 1; i < pages.length; i++) {
//         pageIndex = i;
//         break;
//       }
//     }
//   } catch (e) { /* empty */ }
// }

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
      "type": "list",
      "ordered": false,
      "start": null,
      "spread": false,
      "children": [
        {
          "type": "listItem",
          "spread": false,
          "checked": null,
          "children": [
            {
              "type": "paragraph",
              "children": [
                {
                  "type": "text",
                  "value": "1337"
                }
              ]
            }
          ]
        },
        {
          "type": "listItem",
          "spread": false,
          "checked": null,
          "children": [
            {
              "type": "paragraph",
              "children": [
                {
                  "type": "link",
                  "title": null,
                  "url": "https://www.google.com/search?q=42",
                  "children": [
                    {
                      "type": "text",
                      "value": "42"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "type": "listItem",
          "spread": false,
          "checked": null,
          "children": [
            {
              "type": "paragraph",
              "children": [
                {
                  "type": "text",
                  "value": "7±2"
                }
              ]
            }
          ]
        }
      ],
      "question": {
        "type": "question",
        "name": "mynumber",
        "params": {
          "shuffle": true
        }
      }
    }
  },
};