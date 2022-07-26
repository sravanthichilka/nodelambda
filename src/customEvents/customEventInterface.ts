export interface EventChangesInterface {
  label: string;
  previous_value: string;
  previous_sub_heading?: string;
  current_value: string;
  current_sub_heading?: string;
}
export interface addLogEventInterface {
  userId: number;
  alterRecordUserId: number;
  userRoleId: number;
  alterRecordUserRoleId: number;
  userName: string;
  eventTypeId: number;
  eventTypeLabel: string;
  userAgent: string;
  eventMessage: string;
  changes?:
    | { meta: object; event_changes: EventChangesInterface[] }
    | { meta: object; event_changes: EventChangesInterface[] }[];
}

export type companyAddLogEventInterface = addLogEventInterface & {
  companyId: number;
  companyName: string;
};

export type documentAddLogEventInterface = addLogEventInterface & {
  companyId: number;
  companyName: string;
  documentId: number;
  documentName: string;
};

export type anyLogEventInterface =
  | addLogEventInterface
  | companyAddLogEventInterface
  | documentAddLogEventInterface;
