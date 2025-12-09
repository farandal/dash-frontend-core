import * as React from "react";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";

import TimelineTable from "./TimelineTable";

export default function BasicTimeline() {
  return (
    <Timeline>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot color="info" />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <TimelineTable />
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot color="info" />
          <TimelineConnector />
        </TimelineSeparator>
        <TimelineContent>
          <TimelineTable />
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineSeparator>
          <TimelineDot color="info" />
        </TimelineSeparator>
        <TimelineContent>
          <TimelineTable />
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  );
}

