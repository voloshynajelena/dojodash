'use client';

import { Paper, Group, Text, Stack, Badge } from '@mantine/core';
import { Calendar } from '@mantine/dates';
import { IconCheck, IconX, IconMinus } from '@tabler/icons-react';
import dayjs from 'dayjs';
import type { AttendanceStatus } from '@dojodash/core/models';
import { ATTENDANCE_COLORS } from '@dojodash/core/constants';

export interface AttendanceRecord {
  date: Date;
  status: AttendanceStatus;
  sessionTitle?: string;
}

export interface AttendanceCalendarProps {
  records: AttendanceRecord[];
  month?: Date;
  onMonthChange?: (month: Date) => void;
  onDateClick?: (date: Date) => void;
}

function getStatusIcon(status: AttendanceStatus) {
  switch (status) {
    case 'present':
      return <IconCheck size={12} />;
    case 'absent':
      return <IconX size={12} />;
    case 'excused':
    case 'late':
      return <IconMinus size={12} />;
    default:
      return null;
  }
}

export function AttendanceCalendar({
  records,
  month,
  onMonthChange,
  onDateClick,
}: AttendanceCalendarProps) {
  const recordMap = new Map<string, AttendanceRecord>();
  records.forEach((record) => {
    const key = dayjs(record.date).format('YYYY-MM-DD');
    recordMap.set(key, record);
  });

  const present = records.filter((r) => r.status === 'present').length;
  const absent = records.filter((r) => r.status === 'absent').length;
  const excused = records.filter((r) => r.status === 'excused' || r.status === 'late').length;

  return (
    <Stack gap="md">
      <Calendar
        date={month}
        onDateChange={(date) => onMonthChange?.(date ?? new Date())}
        renderDay={(date) => {
          const key = dayjs(date).format('YYYY-MM-DD');
          const record = recordMap.get(key);
          const day = date.getDate();

          if (!record) {
            return <div>{day}</div>;
          }

          return (
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              onClick={() => onDateClick?.(date)}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: ATTENDANCE_COLORS[record.status],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 500,
                  fontSize: 12,
                }}
              >
                {day}
              </div>
            </div>
          );
        }}
      />

      <Group justify="center" gap="lg">
        <Group gap="xs">
          <Badge size="sm" color="green" leftSection={<IconCheck size={10} />}>
            Present: {present}
          </Badge>
        </Group>
        <Group gap="xs">
          <Badge size="sm" color="red" leftSection={<IconX size={10} />}>
            Absent: {absent}
          </Badge>
        </Group>
        <Group gap="xs">
          <Badge size="sm" color="orange" leftSection={<IconMinus size={10} />}>
            Excused/Late: {excused}
          </Badge>
        </Group>
      </Group>
    </Stack>
  );
}
