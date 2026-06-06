/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum PresenterId {
  ANDI = "andi",
  SINTA = "sinta",
  RINA = "rina",
  BUDI = "budi",
}

export interface ScriptLine {
  id: string;
  timeCode: string;
  timeInSeconds: number;
  endTimeInSeconds: number;
  speaker: PresenterId;
  action: string;
  speech: string;
  technique: string;
}

export interface QAItem {
  id: string;
  question: string;
  category: string;
  responder: PresenterId;
  response: string;
  techniques: string;
}

export interface LapbookComponent {
  id: string;
  name: string;
  type: "cover" | "banner" | "minibook" | "flap" | "window" | "accordion" | "wheel" | "pocket" | "recap";
  description: string;
  presenter: PresenterId;
  techniqueTip: string;
  realLifeCrafting: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  responderName?: string;
  text: string;
  techniques?: string;
  recommendedTeammate?: string;
}
