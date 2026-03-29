/** All action types the agent can execute */
export type ActionType =
  | 'click'
  | 'double_click'
  | 'right_click'
  | 'type'
  | 'key_press'
  | 'scroll'
  | 'drag'
  | 'move'
  | 'wait'
  | 'screenshot'
  | 'done';

export interface AgentAction {
  type: ActionType;
  /** Pixel coordinates for pointer actions */
  x?: number;
  y?: number;
  /** Text for 'type' action */
  text?: string;
  /** Key combo e.g. "ctrl+c" for 'key_press' */
  key?: string;
  /** Scroll delta */
  deltaX?: number;
  deltaY?: number;
  /** Drag end coordinates */
  endX?: number;
  endY?: number;
  /** Wait duration in ms */
  durationMs?: number;
  /** Model's explanation of why this action */
  reason?: string;
}
